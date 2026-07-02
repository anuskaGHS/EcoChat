from dotenv import load_dotenv
load_dotenv()
import os
import sys
import hashlib
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq

# Ensure local imports work regardless of how the script is run
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from retrieval import search_knowledge_base
from prompts import VARIANT_A, VARIANT_B

app = Flask(__name__)
CORS(app)

# ==========================================
# MongoDB Database Connection & Fallback
# ==========================================
MONGO_URI = os.environ.get("MONGO_URI")
db_client = None
db = None
use_fallback = False

if MONGO_URI:
    try:
        from pymongo import MongoClient
        db_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        # Test connection
        db_client.server_info()
        db = db_client.get_database("ecochat")
        print("Connected to MongoDB Atlas successfully!")
    except Exception as e:
        print(f"MongoDB connection failed: {e}. Falling back to local file storage.")
        use_fallback = True
else:
    print("MONGO_URI not set. Falling back to local file storage.")
    use_fallback = True

# Fallback File Storage
FALLBACK_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fallback_db.json")

def load_fallback_data():
    if not os.path.exists(FALLBACK_FILE):
        return {"users": {}}
    try:
        with open(FALLBACK_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {"users": {}}

def save_fallback_data(data):
    try:
        with open(FALLBACK_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Failed to save fallback data: {e}")

# ==========================================
# Database Helper Functions
# ==========================================
def find_user_by_email(email):
    email = email.lower().strip()
    if not use_fallback and db is not None:
        try:
            user = db.users.find_one({"email": email})
            if user:
                user["_id"] = str(user["_id"])
            return user
        except Exception as e:
            print(f"DB Find Error: {e}. Falling back to memory/local file.")
    
    # Fallback to local storage
    data = load_fallback_data()
    return data["users"].get(email)

def create_user(email, name, password_hash):
    email = email.lower().strip()
    user_doc = {
        "email": email,
        "name": name,
        "password_hash": password_hash,
        "saved_tips": [],
        "bookmarked_articles": [],
        "joined_challenges": [],
        "saved_resources": [],
        "habits": []
    }
    if not use_fallback and db is not None:
        try:
            db.users.insert_one(user_doc)
            user_doc["_id"] = str(user_doc["_id"])
            return user_doc
        except Exception as e:
            print(f"DB Insert Error: {e}. Falling back to memory/local file.")
            
    # Fallback
    data = load_fallback_data()
    data["users"][email] = user_doc
    save_fallback_data(data)
    return user_doc

def update_user_sync(email, sync_data):
    email = email.lower().strip()
    update_fields = {
        "saved_tips": sync_data.get("saved_tips", []),
        "bookmarked_articles": sync_data.get("bookmarked_articles", []),
        "joined_challenges": sync_data.get("joined_challenges", []),
        "saved_resources": sync_data.get("saved_resources", []),
        "habits": sync_data.get("habits", [])
    }
    if not use_fallback and db is not None:
        try:
            db.users.update_one({"email": email}, {"$set": update_fields})
            return
        except Exception as e:
            print(f"DB Update Error: {e}. Falling back to memory/local file.")
            
    # Fallback
    data = load_fallback_data()
    if email in data["users"]:
        data["users"][email].update(update_fields)
        save_fallback_data(data)

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

# ==========================================
# Authentication & Sync Routes
# ==========================================
@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    
    if not email or not password or not name:
        return jsonify({"error": "Missing required fields: email, password, name"}), 400
        
    email = email.lower().strip()
    existing_user = find_user_by_email(email)
    if existing_user:
        return jsonify({"error": "User with this email already exists"}), 409
        
    password_hash = hash_password(password)
    user = create_user(email, name, password_hash)
    
    user.pop("password_hash", None)
    return jsonify({"success": True, "user": user}), 201

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Missing required fields: email, password"}), 400
        
    email = email.lower().strip()
    user = find_user_by_email(email)
    if not user or user.get("password_hash") != hash_password(password):
        return jsonify({"error": "Invalid email or password"}), 401
        
    user_data = dict(user)
    user_data.pop("password_hash", None)
    return jsonify({"success": True, "user": user_data}), 200

@app.route("/auth/sync", methods=["POST"])
def sync_data():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    
    if not email:
        return jsonify({"error": "Missing 'email' in request"}), 400
        
    email = email.lower().strip()
    user = find_user_by_email(email)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    update_user_sync(email, data)
    return jsonify({"success": True}), 200

# ==========================================
# Chat Route (Unchanged)
# ==========================================
@app.route("/chat", methods=["POST"])
def chat():
    # Read Groq API key from environment dynamically
    groq_api_key = os.environ.get("GROQ_API_KEY")

    data = request.get_json(silent=True) or {}
    question = data.get("question")

    if not question:
        return jsonify({"error": "Missing 'question' in request body"}), 400

    if not groq_api_key:
        return jsonify({"error": "GROQ_API_KEY environment variable is not set"}), 500

    try:
        # Search the knowledge base
        match = search_knowledge_base(question)
        
        # Format or assign prompt based on whether match is found
        if match:
            system_prompt = VARIANT_A.format(
                retrieved_question=match.get("main_question", ""),
                retrieved_answer=match.get("answer", ""),
                retrieved_source=match.get("source", "")
            )
            match_found = True
        else:
            system_prompt = VARIANT_B
            match_found = False

        # Call Groq API
        client = Groq(api_key=groq_api_key)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": question,
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        
        response_text = chat_completion.choices[0].message.content
        
        return jsonify({
            "response": response_text,
            "match_found": match_found,
            "source": match.get("source", "") if match else ""
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
