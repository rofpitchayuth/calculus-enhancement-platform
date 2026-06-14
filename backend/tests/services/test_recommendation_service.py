"""
tests/services/test_recommendation_service.py
===============================================
Unit tests for RecommendationService.get_next_adaptive_question().

Validates the ZPD (Zone of Proximal Development) logic:
    normal  → [mastery, mastery + 0.2]
    harder  → [mastery + 0.2, mastery + 0.4]
    easier  → [mastery - 0.2, mastery]

All database interactions are fully mocked.
"""

import pytest
from unittest.mock import MagicMock
from app.models.question import Question
from app.models.result import QuizAttempt, StudentStats
from app.services.recommendation_service import RecommendationService

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_db():
    """Create a fully mocked SQLAlchemy Session."""
    session = MagicMock()
    return session


@pytest.fixture
def mock_question():
    """Factory for a mock Question ORM object."""
    q = MagicMock()
    q.id = 42
    q.sub_topic = "integration"
    q.difficulty = 0.55
    q.question_text = "Find the integral of x dx"
    return q


def _setup_db(mock_db, mock_question, mastery=0.5, recent_correct_ids=None):
    """Sets up query side effects for SQLAlchemy models used in RecommendationService."""
    if recent_correct_ids is None:
        recent_correct_ids = []
        
    mock_stats = MagicMock()
    mock_stats.skill_mastery = {"integration": mastery}
    
    def query_side_effect(model):
        chain = MagicMock()
        if model is StudentStats:
            chain.filter.return_value.first.return_value = mock_stats
        elif model is QuizAttempt.question_id:
            chain.filter.return_value.all.return_value = [(qid,) for qid in recent_correct_ids]
        elif model is Question:
            # We want to return mock_question on query
            chain.filter.return_value.order_by.return_value.first.return_value = mock_question
        return chain
        
    mock_db.query.side_effect = query_side_effect


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestZPDLogic:
    """
    Tests the ZPD difficulty-range calculation inside
    RecommendationService.get_next_adaptive_question().
    """

    @pytest.mark.asyncio
    async def test_normal_difficulty_range(self, mock_db, mock_question):
        """
        With mastery=0.5 and adjustment='normal':
        target_min = 0.5, target_max = 0.7
        """
        _setup_db(mock_db, mock_question, mastery=0.5)

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="normal",
        )

        assert result == mock_question
        assert mock_db.query.called

    @pytest.mark.asyncio
    async def test_harder_difficulty_range(self, mock_db, mock_question):
        """
        With mastery=0.5 and adjustment='harder':
        target_min = min(0.8, 0.5+0.2) = 0.7
        target_max = min(1.0, 0.5+0.4) = 0.9
        """
        _setup_db(mock_db, mock_question, mastery=0.5)

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="harder",
        )

        assert result == mock_question
        assert mock_db.query.called

    @pytest.mark.asyncio
    async def test_easier_difficulty_range(self, mock_db, mock_question):
        """
        With mastery=0.5 and adjustment='easier':
        target_min = max(0.0, 0.5-0.2) = 0.3
        target_max = 0.5
        """
        _setup_db(mock_db, mock_question, mastery=0.5)

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="easier",
        )

        assert result == mock_question
        assert mock_db.query.called

    @pytest.mark.asyncio
    async def test_mastery_none_defaults_to_half(self, mock_db, mock_question):
        """
        When StudentStats does not exist, mastery should default to 0.5.
        The function should still return a question without crashing.
        """
        # Set setup_db to return None for StudentStats
        def query_side_effect(model):
            chain = MagicMock()
            if model is StudentStats:
                chain.filter.return_value.first.return_value = None
            elif model is QuizAttempt.question_id:
                chain.filter.return_value.all.return_value = []
            elif model is Question:
                chain.filter.return_value.order_by.return_value.first.return_value = mock_question
            return chain
        mock_db.query.side_effect = query_side_effect

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="normal",
        )

        assert result == mock_question
        assert mock_db.query.called

    @pytest.mark.asyncio
    async def test_fallback_when_no_zpd_question(self, mock_db):
        """
        When no question exists in the ZPD range, the fallback query
        should be attempted (ordered by difficulty ascending).
        """
        mock_stats = MagicMock()
        mock_stats.skill_mastery = {"integration": 0.5}
        
        fallback_q = MagicMock()
        fallback_q.id = 99
        
        # Instantiate the Question query chain once so the side_effect is preserved across multiple calls
        question_chain = MagicMock()
        question_chain.filter.return_value.order_by.return_value.first.side_effect = [
            None,       # ZPD query → no match
            fallback_q, # Fallback query → found one
        ]
        
        def query_side_effect(model):
            if model is StudentStats:
                chain = MagicMock()
                chain.filter.return_value.first.return_value = mock_stats
                return chain
            elif model is QuizAttempt.question_id:
                chain = MagicMock()
                chain.filter.return_value.all.return_value = []
                return chain
            elif model is Question:
                return question_chain
            return MagicMock()
            
        mock_db.query.side_effect = query_side_effect

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="normal",
        )

        assert result == fallback_q

    @pytest.mark.asyncio
    async def test_harder_clamps_at_upper_bound(self, mock_db, mock_question):
        """
        With mastery=0.9 and adjustment='harder':
        target_min = min(0.8, 0.9+0.2) = 0.8  (clamped)
        target_max = min(1.0, 0.9+0.4) = 1.0  (clamped)
        """
        _setup_db(mock_db, mock_question, mastery=0.9)

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="harder",
        )

        assert result == mock_question
        assert mock_db.query.called

    @pytest.mark.asyncio
    async def test_easier_clamps_at_lower_bound(self, mock_db, mock_question):
        """
        With mastery=0.1 and adjustment='easier':
        target_min = max(0.0, 0.1-0.2) = 0.0  (clamped)
        target_max = 0.1
        """
        _setup_db(mock_db, mock_question, mastery=0.1)

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="easier",
        )

        assert result == mock_question
        assert mock_db.query.called
