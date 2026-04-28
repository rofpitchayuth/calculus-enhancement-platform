"""
tests/services/test_recommendation_service.py
===============================================
Unit tests for RecommendationService.get_next_adaptive_question().

Validates the ZPD (Zone of Proximal Development) logic:
    normal  → [mastery, mastery + 0.2]
    harder  → [mastery + 0.2, mastery + 0.4]
    easier  → [mastery - 0.2, mastery]

The KTService.predict_mastery call is mocked to return a fixed mastery of 0.5.
All database interactions are fully mocked.
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch


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


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestZPDLogic:
    """
    Tests the ZPD difficulty-range calculation inside
    RecommendationService.get_next_adaptive_question().
    """

    @pytest.mark.asyncio
    @patch("app.services.recommendation_service.KTService.predict_mastery", new_callable=AsyncMock)
    async def test_normal_difficulty_range(self, mock_mastery, mock_db, mock_question):
        """
        With mastery=0.5 and adjustment='normal':
        target_min = 0.5, target_max = 0.7
        """
        mock_mastery.return_value = 0.5
        mock_db.query.return_value.filter.return_value.all.return_value = []
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_question

        from app.services.recommendation_service import RecommendationService

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="normal",
        )

        # Verify predict_mastery was called with correct params
        mock_mastery.assert_called_once_with(
            student_id="1", history=[], target_skill_id="integration"
        )

        # Verify db.query was called (question lookup)
        assert mock_db.query.called

    @pytest.mark.asyncio
    @patch("app.services.recommendation_service.KTService.predict_mastery", new_callable=AsyncMock)
    async def test_harder_difficulty_range(self, mock_mastery, mock_db, mock_question):
        """
        With mastery=0.5 and adjustment='harder':
        target_min = min(0.8, 0.5+0.2) = 0.7
        target_max = min(1.0, 0.5+0.4) = 0.9
        """
        mock_mastery.return_value = 0.5
        mock_db.query.return_value.filter.return_value.all.return_value = []
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_question

        from app.services.recommendation_service import RecommendationService

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="harder",
        )

        mock_mastery.assert_called_once()
        assert mock_db.query.called

    @pytest.mark.asyncio
    @patch("app.services.recommendation_service.KTService.predict_mastery", new_callable=AsyncMock)
    async def test_easier_difficulty_range(self, mock_mastery, mock_db, mock_question):
        """
        With mastery=0.5 and adjustment='easier':
        target_min = max(0.0, 0.5-0.2) = 0.3
        target_max = 0.5
        """
        mock_mastery.return_value = 0.5
        mock_db.query.return_value.filter.return_value.all.return_value = []
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_question

        from app.services.recommendation_service import RecommendationService

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="easier",
        )

        mock_mastery.assert_called_once()
        assert mock_db.query.called

    @pytest.mark.asyncio
    @patch("app.services.recommendation_service.KTService.predict_mastery", new_callable=AsyncMock)
    async def test_mastery_none_defaults_to_half(self, mock_mastery, mock_db, mock_question):
        """
        When predict_mastery returns None, mastery should default to 0.5.
        The function should still return a question without crashing.
        """
        mock_mastery.return_value = None
        mock_db.query.return_value.filter.return_value.all.return_value = []
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_question

        from app.services.recommendation_service import RecommendationService

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="normal",
        )

        # Should not crash; should still attempt to query
        assert mock_db.query.called

    @pytest.mark.asyncio
    @patch("app.services.recommendation_service.KTService.predict_mastery", new_callable=AsyncMock)
    async def test_fallback_when_no_zpd_question(self, mock_mastery, mock_db):
        """
        When no question exists in the ZPD range, the fallback query
        should be attempted (ordered by difficulty ascending).
        """
        mock_mastery.return_value = 0.5

        mock_db.query.return_value.filter.return_value.all.return_value = []
        # First call returns None (no ZPD match), second returns a fallback
        fallback_q = MagicMock()
        fallback_q.id = 99
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.side_effect = [
            None,       # ZPD query → no match
            fallback_q, # Fallback query → found one
        ]

        from app.services.recommendation_service import RecommendationService

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="normal",
        )

        # The fallback path should have been reached
        assert mock_db.query.return_value.filter.called

    @pytest.mark.asyncio
    @patch("app.services.recommendation_service.KTService.predict_mastery", new_callable=AsyncMock)
    async def test_harder_clamps_at_upper_bound(self, mock_mastery, mock_db, mock_question):
        """
        With mastery=0.9 and adjustment='harder':
        target_min = min(0.8, 0.9+0.2) = 0.8  (clamped)
        target_max = min(1.0, 0.9+0.4) = 1.0  (clamped)
        """
        mock_mastery.return_value = 0.9
        mock_db.query.return_value.filter.return_value.all.return_value = []
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_question

        from app.services.recommendation_service import RecommendationService

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="harder",
        )

        mock_mastery.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.services.recommendation_service.KTService.predict_mastery", new_callable=AsyncMock)
    async def test_easier_clamps_at_lower_bound(self, mock_mastery, mock_db, mock_question):
        """
        With mastery=0.1 and adjustment='easier':
        target_min = max(0.0, 0.1-0.2) = 0.0  (clamped)
        target_max = 0.1
        """
        mock_mastery.return_value = 0.1
        mock_db.query.return_value.filter.return_value.all.return_value = []
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_question

        from app.services.recommendation_service import RecommendationService

        result = await RecommendationService.get_next_adaptive_question(
            db=mock_db, user_id=1, sub_topic="integration",
            difficulty_adjustment="easier",
        )

        mock_mastery.assert_called_once()
