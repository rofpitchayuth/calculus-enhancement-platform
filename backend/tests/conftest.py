"""
tests/conftest.py
==================
Shared fixtures for the backend test suite.

Provides a reusable mock database session that can be injected into
any test via the 'mock_db' fixture name.
"""

import pytest
from unittest.mock import MagicMock


@pytest.fixture
def mock_db():
    """
    Provide a mock SQLAlchemy Session.
    
    The session's commit/refresh/flush/close methods are no-ops,
    allowing service-layer tests to run without a PostgreSQL instance.
    """
    session = MagicMock()
    session.commit.return_value = None
    session.refresh.return_value = None
    session.flush.return_value = None
    session.close.return_value = None
    return session
