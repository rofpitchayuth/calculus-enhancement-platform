"""
tests/services/test_quiz_service.py
====================================
Unit tests for QuizService.submit_answer().

Validates the STRICT evaluation rule:
    is_correct == True  ONLY WHEN  error_code == 'correct_answer'

All database interactions are fully mocked.
"""

import pytest
from unittest.mock import MagicMock, patch


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_db():
    """Create a fully mocked SQLAlchemy Session."""
    session = MagicMock()
    session.commit.return_value = None
    session.refresh.return_value = None
    return session


def _make_question(qid, choices, correct="A"):
    q = MagicMock()
    q.id = qid
    q.choices = choices
    q.correct_answer = correct
    q.difficulty = 0.5
    return q


def _make_session(sid, uid):
    s = MagicMock()
    s.id = sid
    s.user_id = uid
    return s


CHOICES = [
    {"id": "A", "text": "x^2 + C", "error_code": "correct_answer"},
    {"id": "B", "text": "x^2",     "error_code": "forgot_plus_c"},
    {"id": "C", "text": "2x",      "error_code": "derivative_instead_of_integral"},
    {"id": "D", "text": "-x^2",    "error_code": "sign_error"},
]


def _setup_db(mock_db, MockQuestion, MockQuizSession, question, session):
    def side_effect(model):
        chain = MagicMock()
        if model is MockQuestion:
            chain.filter.return_value.first.return_value = question
        elif model is MockQuizSession:
            chain.filter.return_value.first.return_value = session
        return chain
    mock_db.query.side_effect = side_effect


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestSubmitAnswer:

    @patch("app.services.quiz_service.QuizSession")
    @patch("app.services.quiz_service.Question")
    @patch("app.services.quiz_service.QuizAttempt")
    def test_correct_answer_is_true(self, _Att, MQ, MS, mock_db):
        """is_correct MUST be True when error_code == 'correct_answer'."""
        _setup_db(mock_db, MQ, MS, _make_question(1, CHOICES), _make_session(100, 1))
        from app.services.quiz_service import QuizService
        r = QuizService(mock_db).submit_answer(1, 100, 1, "A", "integration", 5.0)
        assert r.is_correct is True
        assert r.error_code == "correct_answer"

    @patch("app.services.quiz_service.QuizSession")
    @patch("app.services.quiz_service.Question")
    @patch("app.services.quiz_service.QuizAttempt")
    def test_forgot_plus_c_is_false(self, _Att, MQ, MS, mock_db):
        """is_correct MUST be False when error_code == 'forgot_plus_c'."""
        _setup_db(mock_db, MQ, MS, _make_question(1, CHOICES), _make_session(100, 1))
        from app.services.quiz_service import QuizService
        r = QuizService(mock_db).submit_answer(1, 100, 1, "B", "integration", 8.0)
        assert r.is_correct is False
        assert r.error_code == "forgot_plus_c"

    @patch("app.services.quiz_service.QuizSession")
    @patch("app.services.quiz_service.Question")
    @patch("app.services.quiz_service.QuizAttempt")
    def test_sign_error_is_false(self, _Att, MQ, MS, mock_db):
        """Any non-correct error code yields is_correct == False."""
        _setup_db(mock_db, MQ, MS, _make_question(1, CHOICES), _make_session(100, 1))
        from app.services.quiz_service import QuizService
        r = QuizService(mock_db).submit_answer(1, 100, 1, "D", "integration", 12.0)
        assert r.is_correct is False
        assert r.error_code == "sign_error"

    @patch("app.services.quiz_service.QuizSession")
    @patch("app.services.quiz_service.Question")
    @patch("app.services.quiz_service.QuizAttempt")
    def test_mastery_increases_on_correct(self, _Att, MQ, MS, mock_db):
        """p_mastery_after > p_mastery_before when correct."""
        _setup_db(mock_db, MQ, MS, _make_question(2, CHOICES), _make_session(200, 2))
        from app.services.quiz_service import QuizService
        r = QuizService(mock_db).submit_answer(2, 200, 2, "A", "limits", 3.0)
        assert r.p_mastery_after > r.p_mastery_before

    @patch("app.services.quiz_service.QuizSession")
    @patch("app.services.quiz_service.Question")
    @patch("app.services.quiz_service.QuizAttempt")
    def test_mastery_decreases_on_wrong(self, _Att, MQ, MS, mock_db):
        """p_mastery_after < p_mastery_before when wrong."""
        _setup_db(mock_db, MQ, MS, _make_question(2, CHOICES), _make_session(200, 2))
        from app.services.quiz_service import QuizService
        r = QuizService(mock_db).submit_answer(2, 200, 2, "B", "limits", 3.0)
        assert r.p_mastery_after < r.p_mastery_before

    @patch("app.services.quiz_service.QuizSession")
    @patch("app.services.quiz_service.Question")
    @patch("app.services.quiz_service.QuizAttempt")
    def test_unmatched_choice_defaults_unclassified(self, _Att, MQ, MS, mock_db):
        """Unknown choice letter yields 'unclassified_error'."""
        _setup_db(mock_db, MQ, MS, _make_question(3, CHOICES), _make_session(300, 3))
        from app.services.quiz_service import QuizService
        r = QuizService(mock_db).submit_answer(3, 300, 3, "Z", "derivative", 2.0)
        assert r.is_correct is False
        assert r.error_code == "unclassified_error"

    @patch("app.services.quiz_service.QuizSession")
    @patch("app.services.quiz_service.Question")
    @patch("app.services.quiz_service.QuizAttempt")
    def test_case_insensitive_matching(self, _Att, MQ, MS, mock_db):
        """Lowercase 'a' should match choice id='A'."""
        _setup_db(mock_db, MQ, MS, _make_question(4, CHOICES), _make_session(400, 4))
        from app.services.quiz_service import QuizService
        r = QuizService(mock_db).submit_answer(4, 400, 4, "a", "integration", 4.5)
        assert r.is_correct is True
        assert r.error_code == "correct_answer"

    @patch("app.services.quiz_service.QuizSession")
    @patch("app.services.quiz_service.Question")
    @patch("app.services.quiz_service.QuizAttempt")
    def test_missing_question_raises(self, _Att, MQ, MS, mock_db):
        """ValueError when question_id does not exist."""
        def se(model):
            c = MagicMock()
            if model is MQ:
                c.filter.return_value.first.return_value = None
            return c
        mock_db.query.side_effect = se
        from app.services.quiz_service import QuizService
        with pytest.raises(ValueError, match="not found"):
            QuizService(mock_db).submit_answer(1, 100, 999, "A", "limits", 1.0)

    @patch("app.services.quiz_service.QuizSession")
    @patch("app.services.quiz_service.Question")
    @patch("app.services.quiz_service.QuizAttempt")
    def test_missing_session_raises(self, _Att, MQ, MS, mock_db):
        """ValueError when session_id is invalid."""
        q = _make_question(1, CHOICES)
        def se(model):
            c = MagicMock()
            if model is MQ:
                c.filter.return_value.first.return_value = q
            elif model is MS:
                c.filter.return_value.first.return_value = None
            return c
        mock_db.query.side_effect = se
        from app.services.quiz_service import QuizService
        with pytest.raises(ValueError, match="not found"):
            QuizService(mock_db).submit_answer(1, 999, 1, "A", "limits", 1.0)
