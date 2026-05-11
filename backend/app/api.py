"""this exists to be the db api sheet"""
import json
from datetime import datetime
from bson import json_util
from flask import Blueprint, jsonify, g, request
from . import mongo
from .AI import analyze_text
from .auth import require_auth

db_api_bp = Blueprint('api', __name__)
APP_DB_NAME = "elder-fraud"

@db_api_bp.route('/status', methods=['GET'])
def get_status():
    try:
        # mongo connection 
        mongo.cx.admin.command('ping')
        
        return jsonify({
            "status": "online",
            "database": "connected"
        }), 200
    except Exception as e:
        # If Atlas is down or IP isnt whitelisted
        return jsonify({
            "status": "offline",
            "error": "Couldn't connect to MongoDB Atlas"
        }), 500


@db_api_bp.route('/all_data', methods=['GET'])
def get_all_data():
    try:
        # Change as we make changes to the DB
        collection = mongo.cx['test']['test_collection']

        # get the data
        # limit how many documents we fetch
        cursor = collection.find().limit(10)

        # MongoDB uses BSON (Binary JSON) which is an extension of JSON
        data = json.loads(json_util.dumps(list(cursor)))

        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error" : "Access denied or collection missing", "details" : str(e)}), 403


@db_api_bp.route('/auth/context', methods=['GET'])
def get_auth_context():
    auth_user = getattr(g, "auth_user", None)
    auth_error = getattr(g, "auth_error", None)
    is_authenticated = getattr(g, "is_authenticated", False)

    return jsonify({
        "is_authenticated": is_authenticated,
        "auth_user": auth_user,
        "auth_error": auth_error
    }), 200

@db_api_bp.route('/users/sync', methods=['POST'])
@require_auth
def sync_user():
    try:
        data = request.get_json() or {}
        full_name = data.get("fullName")
        email = data.get("email")
        phone = data.get("phone")

        if not email:
            return jsonify({
                "error": "email is required"
            }), 400

        user_id = g.auth_user["user_id"]
        now = datetime.now()
        collection = mongo.cx[APP_DB_NAME]["users"]
        set_fields = {
            "clerk_user_id": user_id,
            "session_id": g.auth_user.get("session_id"),
            "issuer": g.auth_user.get("issuer"),
            "email": email,
            "updated_at": now,
        }

        if full_name:
            set_fields["full_name"] = full_name
        if phone:
            set_fields["phone"] = phone

        collection.update_one(
            {"clerk_user_id": user_id},
            {
                "$set": set_fields,
                "$setOnInsert": {
                    "created_at": now,
                },
            },
            upsert=True,
        )

        saved_user = collection.find_one(
            {"clerk_user_id": user_id},
            {"_id": 0},
        )

        return jsonify({
            "message": "User synced successfully",
            "user": saved_user,
        }), 200
    except Exception as e:
        return jsonify({"error": "User sync failed", "details": str(e)}), 500

@db_api_bp.route('/scan', methods=['POST'])
def scan_email():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data['text']
        if not text.strip():
            return jsonify({"error": "Email text is empty"}), 400

        result = analyze_text(text)

        # Save best-effort scan history without making classification depend on Mongo availability.
        try:
            collection = mongo.cx[APP_DB_NAME]["scans"]
            collection.insert_one({
                "text": text,
                "result": result,
                "timestamp": datetime.now()
            })
            result["saved_to_db"] = True
        except Exception as db_error:
            result["saved_to_db"] = False
            result["save_error"] = str(db_error)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": "Scan failed", "details": str(e)}), 500
