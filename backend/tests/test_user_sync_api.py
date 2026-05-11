import unittest
from os import environ
from unittest.mock import MagicMock, patch

from backend.app import api
from backend.app import create_app


class UserSyncEndpointTests(unittest.TestCase):
    def setUp(self):
        environ.setdefault("MONGO_URI", "mongodb://localhost:27017/elder_fraud_test")
        self.app = create_app()
        self.client = self.app.test_client()

    def test_sync_requires_authentication(self):
        response = self.client.post("/api/users/sync", json={
            "fullName": "Jane Doe",
            "email": "jane@example.com",
            "phone": "+1 555 123 4567",
        })

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json(), {"error": "Authentication required"})

    @patch("backend.app.auth._verify_token")
    def test_sync_requires_email(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_123", "sid": "sess_123", "iss": "issuer_123"},
            None,
        )

        response = self.client.post(
            "/api/users/sync",
            json={"fullName": "Jane Doe"},
            headers={"Authorization": "Bearer valid_token"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "email is required"},
        )

    @patch("backend.app.auth._verify_token")
    def test_sync_upserts_user_with_email_only_login_payload(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_123", "sid": "sess_123", "iss": "issuer_123"},
            None,
        )
        users_collection_mock = MagicMock()
        users_collection_mock.find_one.return_value = {
            "clerk_user_id": "user_123",
            "session_id": "sess_123",
            "issuer": "issuer_123",
            "email": "jane@example.com",
        }
        cluster_mock = MagicMock()
        cluster_mock.__getitem__.return_value = {"users": users_collection_mock}

        with patch.object(api.mongo, "cx", cluster_mock):
            response = self.client.post(
                "/api/users/sync",
                json={"email": "jane@example.com"},
                headers={"Authorization": "Bearer valid_token"},
            )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["message"], "User synced successfully")
        self.assertEqual(data["user"]["email"], "jane@example.com")
        users_collection_mock.update_one.assert_called_once()
        update_args, update_kwargs = users_collection_mock.update_one.call_args
        self.assertEqual(update_args[0], {"clerk_user_id": "user_123"})
        self.assertEqual(update_args[1]["$set"]["email"], "jane@example.com")
        self.assertNotIn("full_name", update_args[1]["$set"])
        self.assertNotIn("phone", update_args[1]["$set"])
        self.assertTrue(update_kwargs["upsert"])

    @patch("backend.app.auth._verify_token")
    def test_sync_upserts_user_when_database_write_succeeds(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_123", "sid": "sess_123", "iss": "issuer_123"},
            None,
        )
        users_collection_mock = MagicMock()
        users_collection_mock.find_one.return_value = {
            "clerk_user_id": "user_123",
            "session_id": "sess_123",
            "issuer": "issuer_123",
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "phone": "+1 555 123 4567",
        }
        cluster_mock = MagicMock()
        cluster_mock.__getitem__.return_value = {"users": users_collection_mock}

        with patch.object(api.mongo, "cx", cluster_mock):
            response = self.client.post(
                "/api/users/sync",
                json={
                    "fullName": "Jane Doe",
                    "email": "jane@example.com",
                    "phone": "+1 555 123 4567",
                },
                headers={"Authorization": "Bearer valid_token"},
            )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["message"], "User synced successfully")
        self.assertEqual(data["user"]["clerk_user_id"], "user_123")
        self.assertEqual(data["user"]["email"], "jane@example.com")
        users_collection_mock.update_one.assert_called_once()
        users_collection_mock.find_one.assert_called_once()

    @patch("backend.app.auth._verify_token")
    def test_sync_returns_500_when_database_write_fails(self, verify_token_mock):
        verify_token_mock.return_value = (
            {"sub": "user_123", "sid": "sess_123", "iss": "issuer_123"},
            None,
        )
        users_collection_mock = MagicMock()
        users_collection_mock.update_one.side_effect = Exception("update failed")
        cluster_mock = MagicMock()
        cluster_mock.__getitem__.return_value = {"users": users_collection_mock}

        with patch.object(api.mongo, "cx", cluster_mock):
            response = self.client.post(
                "/api/users/sync",
                json={
                    "fullName": "Jane Doe",
                    "email": "jane@example.com",
                    "phone": "+1 555 123 4567",
                },
                headers={"Authorization": "Bearer valid_token"},
            )

        self.assertEqual(response.status_code, 500)
        data = response.get_json()
        self.assertEqual(data["error"], "User sync failed")
        self.assertEqual(data["details"], "update failed")


if __name__ == "__main__":
    unittest.main()
