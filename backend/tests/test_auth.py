import unittest
from unittest.mock import patch

from flask import Flask

from backend.app.auth import _get_bearer_token, load_auth_context


class AuthModuleTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)

    def test_get_bearer_token_returns_none_when_missing(self):
        with self.app.test_request_context("/api/auth/context"):
            self.assertIsNone(_get_bearer_token())

    def test_get_bearer_token_extracts_value(self):
        with self.app.test_request_context(
            "/api/auth/context",
            headers={"Authorization": "Bearer token_abc"},
        ):
            self.assertEqual(_get_bearer_token(), "token_abc")

    @patch("backend.app.auth._verify_token")
    def test_load_auth_context_handles_invalid_token(self, verify_token_mock):
        verify_token_mock.return_value = (None, "Invalid Clerk token")

        with self.app.test_request_context(
            "/api/auth/context",
            headers={"Authorization": "Bearer token_abc"},
        ):
            load_auth_context()
            from flask import g

            self.assertFalse(g.is_authenticated)
            self.assertIsNone(g.auth_user)
            self.assertEqual(g.auth_error, "Invalid Clerk token")

    @patch("backend.app.auth._verify_token")
    def test_load_auth_context_sets_user_on_valid_token(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_1", "sid": "session_1", "iss": "issuer_1"},
            None,
        )

        with self.app.test_request_context(
            "/api/auth/context",
            headers={"Authorization": "Bearer token_abc"},
        ):
            load_auth_context()
            from flask import g

            self.assertTrue(g.is_authenticated)
            self.assertEqual(
                g.auth_user,
                {"user_id": "user_1", "session_id": "session_1", "issuer": "issuer_1"},
            )
            self.assertIsNone(g.auth_error)


if __name__ == "__main__":
    unittest.main()
