from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
import os
from dotenv import load_dotenv
from .auth import load_auth_context

mongo = PyMongo()

def create_app():
    load_dotenv()
    app = Flask(__name__)

    # Attach login string
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")

    mongo.init_app(app)

    # Enable CORS
    CORS(app, allow_headers=["Content-Type", "Authorization"])

    @app.before_request
    def attach_auth_context():
        load_auth_context()

    # This is necessary to avoid waiting loop for files/libraries to be loaded
    # (Because we are using factory pattern)
    from .api import db_api_bp
    app.register_blueprint(db_api_bp, url_prefix='/api')

    return app