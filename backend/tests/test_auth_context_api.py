import unittest
from unittest.mock import patch

from flask import Flask

from backend.app.api import db_api_bp
from backend.app.auth import load_auth_context


class AuthContextEndpointTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)

        @self.app.before_request
        def attach_auth_context():
            load_auth_context()

        self.app.register_blueprint(db_api_bp, url_prefix="/api")
        self.client = self.app.test_client()

    def test_auth_context_without_token(self):
        response = self.client.get("/api/auth/context")
        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertFalse(data["is_authenticated"])
        self.assertIsNone(data["auth_user"])
        self.assertIsNone(data["auth_error"])

    @patch("backend.app.auth._verify_token")
    def test_auth_context_with_invalid_token(self, verify_token_mock):
        verify_token_mock.return_value = (None, "Invalid Clerk token")

        response = self.client.get(
            "/api/auth/context",
            headers={"Authorization": "Bearer malformed_token"},
        )
        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertFalse(data["is_authenticated"])
        self.assertIsNone(data["auth_user"])
        self.assertEqual(data["auth_error"], "Invalid Clerk token")

    @patch("backend.app.auth._verify_token")
    def test_auth_context_with_valid_token(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_123", "sid": "sess_123", "iss": "issuer_123"},
            None,
        )

        response = self.client.get(
            "/api/auth/context",
            headers={"Authorization": "Bearer valid_token"},
        )
        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertTrue(data["is_authenticated"])
        self.assertEqual(
            data["auth_user"],
            {"user_id": "user_123", "session_id": "sess_123", "issuer": "issuer_123"},
        )
        self.assertIsNone(data["auth_error"])


if __name__ == "__main__":
    unittest.main()
