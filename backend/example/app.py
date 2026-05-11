import os
from flask import Flask, jsonify
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Setup MongoDB Connection
mongo_uri = os.getenv("MONGO_URI")

# Using ServerApi is recommended for Atlas to ensure forward compatibility
client = MongoClient(mongo_uri, server_api=ServerApi('1'))

# Select your database and collection
# This is set up on the atlas site,
# If the user has privledges to do so,
# we can use mongo's lazy creation to make new dbs from here
# CURRENTLY GROUP USER DOES NOT HAVE THE PERMS
db = client.test
collection = db.test_collection

@app.route('/')
def index():
    try:
        # The 'ping' command is the standard way to check if the server is reachable
        client.admin.command('ping')
        
        count = collection.count_documents({})
        return jsonify({
            "status": "Success",
            "message": "Connected to MongoDB Atlas!",
            "document_count": count
        })
    except Exception as e:
        return jsonify({"status": "Error", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)





"""
One of many ways to delete
collection.delete_one({"_id": some_id})
"""