import unittest
from os import environ
from unittest.mock import MagicMock, patch

from backend.app import api
from backend.app import create_app


class ScanEndpointTests(unittest.TestCase):
    def setUp(self):
        environ.setdefault("MONGO_URI", "mongodb://localhost:27017/elder_fraud_test")
        self.app = create_app()
        self.client = self.app.test_client()

    def test_scan_without_text_returns_400(self):
        response = self.client.post("/api/scan", json={})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"error": "No text provided"})

    def test_scan_with_empty_text_returns_400(self):
        response = self.client.post("/api/scan", json={"text": "   "})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"error": "Email text is empty"})

    def test_scan_saves_result_when_database_write_succeeds(self):
        scans_collection_mock = MagicMock()
        cluster_mock = MagicMock()
        cluster_mock.__getitem__.return_value = {"scans": scans_collection_mock}

        with patch("backend.app.api.analyze_text", return_value={
            "pred_label": "phishing",
            "pred_score": 98.5,
        }), patch.object(api.mongo, "cx", cluster_mock):
            response = self.client.post("/api/scan", json={"text": "urgent transfer request"})
        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertEqual(data["pred_label"], "phishing")
        self.assertEqual(data["pred_score"], 98.5)
        self.assertTrue(data["saved_to_db"])
        self.assertNotIn("save_error", data)

        scans_collection_mock.insert_one.assert_called_once()

    def test_scan_returns_result_when_database_write_fails(self):
        scans_collection_mock = MagicMock()
        scans_collection_mock.insert_one.side_effect = Exception("insert failed")
        cluster_mock = MagicMock()
        cluster_mock.__getitem__.return_value = {"scans": scans_collection_mock}

        with patch("backend.app.api.analyze_text", return_value={
            "pred_label": "spam",
            "pred_score": 76.2,
        }), patch.object(api.mongo, "cx", cluster_mock):
            response = self.client.post("/api/scan", json={"text": "limited time offer"})
        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertEqual(data["pred_label"], "spam")
        self.assertEqual(data["pred_score"], 76.2)
        self.assertFalse(data["saved_to_db"])
        self.assertEqual(data["save_error"], "insert failed")


if __name__ == "__main__":
    unittest.main()
