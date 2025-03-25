from flask import jsonify, request, current_app
from src.model import User, Role
from datetime import timedelta, datetime, timezone
import os
import requests
import secrets
import string
from dotenv import load_dotenv
import uuid
import logging
import json
import jwt
from src.extension import db
load_dotenv()
def generate_secure_password(length=12):
    characters = string.ascii_letters + string.digits + string.punctuation
    secure_password = ''.join(secrets.choice(characters) for i in range(length))
    return secure_password
CLIENT_ID = os.environ.get("CLIENT_ID")
CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
REDIRECT_URI = os.environ.get("REDIRECT_URI")
URL = os.environ.get("URL_GETINFO")
SECRET_KEY = os.environ.get("KEY")
print (SECRET_KEY)
ACCESS_DOMAIN = os.environ.get("ACCESS_DOMAIN")
SESSION_EXPIRATION = int(os.environ.get("SESSION_EXPIRATION"))
ACCESS_EMAIL = os.environ.get("ACCESS_EMAIL")
SESSION_FILE = "src/auth/session.json"
login_attempts = {}
log_file = os.path.join("src/auth", "login.log")
logging.basicConfig(
    filename=log_file, 
    level=logging.WARNING, 
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def register ():
    data = request.get_json()
    user = User.query.filter_by(username = data['username']).first()
    if user :
        return jsonify('Username already exists')
    else:
        new_user = User(
            username= data.get('username'),
            email= data.get('email'),
            role_id= data.get('role_id'),
            password = data.get('password'),
            auth_type= 'local'
        )
        new_user.set_password(data.get('password'))
        if new_user.save_user(): print('User created successfully')
        return jsonify ('User created successfully')

def login():
    data = request.get_json()
    username = data.get('username')
    ip = request.remote_addr
    user_agent = request.headers.get('User-Agent', 'Unknown')
    print(data)
    user = User.query.filter_by(username = data['username']).first()
    key = username if user else ip
    if key in login_attempts:
        attempts = login_attempts[key]
        if attempts["count"] >= 5 and (datetime.utcnow() - attempts["last_attempt"]).seconds < 300:
            logging.warning(f"[LOGIN-FAILED] Too many failed attempts for {key} from {ip}")
            return jsonify({'error': 'Too many failed attempts. Try again later.'}), 429
    if not user or not user.check_password(data['password']):
        
        if key not in login_attempts:
            login_attempts[key] = {"count": 1, "last_attempt": datetime.utcnow()}
        else:
            login_attempts[key]["count"] += 1
            login_attempts[key]["last_attempt"] = datetime.utcnow()
        logging.warning(f"[LOGIN-FAILED] Username={username}, IP={ip}, User-Agent={user_agent}")
        return jsonify({'message':'Invalid username or password'}), 404  
    
    if key in login_attempts:
        del login_attempts[key]
        
    if user and user.check_password(data['password']):
        session_id = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=SESSION_EXPIRATION)
        
        print(session_id)
        print(expires_at)
        user.session_id = session_id
        user.session_expiration = expires_at
        db.session.commit()
        response = jsonify(
            {
                "message": "Login successful",
                "session_expiration": user.session_expiration
            })
        response.set_cookie("session_id", session_id, httponly=True, max_age=SESSION_EXPIRATION)
        return response
    else:
        return jsonify({'message':'Invalid username or password'}), 404

def protected():
    session_id = request.cookies.get("session_id")
    if session_id is None:
        print("No session_id")
        return jsonify({"error": "Unauthorized"}), 401
    session_data = get_session_by_session_id(session_id)
    if not session_data or not session_data.get("session"):
        return jsonify({"error": "Unauthorized"}), 401

    session = session_data.get("session")
    if session.get("expires_at") and session.get("expires_at") < datetime.utcnow().timestamp():
        return jsonify({"error": "Unauthorized"}), 401
    time_out = session.get("expires_at") - datetime.utcnow().timestamp()
    print("now", datetime.utcnow().timestamp())
    
    name = session.get("name")
    picture = session.get("picture")
    print("OUTTT", time_out)
    return jsonify({"message": "Access granted", "timeout": time_out * 1000, "name": name, "picture": picture})

def logout():
    session_id = request.cookies.get("session_id")
    email = get_session_by_session_id(session_id).get("email") if get_session_by_session_id(session_id) else None

    try:
        with open(SESSION_FILE, "r") as f:
            sessions = json.load(f)
        if email in sessions:
            del sessions[email]
        with open(SESSION_FILE, "w") as f:
            json.dump(sessions, f, indent=4)
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    response = jsonify({"message": "Logged out"})
    response.set_cookie("session_id", "", expires=0)  
    return response

def savejson(email, name, session_id, expires_at, picture):
    try:
        try:
            with open(SESSION_FILE, "r") as f:
                sessions = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            sessions = {}
        
        sessions[email] = {
            "name": name,
            "session_id": session_id,
            "expires_at": expires_at,
            "picture": picture
        }
        with open(SESSION_FILE, "w") as f:
            json.dump(sessions, f, indent=4)
        
        print("Session saved successfully.")

    except Exception as e:
        print(f"Error saving session: {e}")

def load_session(email): 
    try:
        with open(SESSION_FILE, "r") as f:
            sessions = json.load(f)
            return sessions.get(email, None)
    except (FileNotFoundError, json.JSONDecodeError):
        return None

def get_session_by_session_id(session_id):
    try:
        with open(SESSION_FILE, "r") as f:
            sessions = json.load(f)
            for key, session in sessions.items():
                if session.get("session_id") == session_id:
                    return {"email": key, "session": session}
    except (FileNotFoundError, json.JSONDecodeError):
        return None
    return None

def delete_session(email):
    try:
        with open(SESSION_FILE, "r") as f:
            sessions = json.load(f)
        
        if email in sessions:
            del sessions[email]
            with open(SESSION_FILE, "w") as f:
                json.dump(sessions, f, indent=4)
            print(f"Session for {email} deleted.")
        else:
            print(f"No session found for {email}.")
    
    except (FileNotFoundError, json.JSONDecodeError):
        print("No session data available.")

def google_login():
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/auth"
        "?response_type=code"
        f"&client_id={CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        "&scope=openid%20email%20profile"
    )
    print(google_auth_url)
    return jsonify(google_auth_url)

def google_callback():
    code = request.get_json()
    print(code.get('code'))
    # Get access token from Google
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code.get('code'),
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    response = requests.post(token_url, data=data)
    print(response)
    token_info = response.json()
    
    if "access_token" not in token_info:
        return jsonify({"error": "Failed to authenticate"}), 401

    access_token = token_info["access_token"]

    # Get user info from Google
    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    user_info = requests.get(user_info_url, headers=headers).json()

    name = user_info["name"]
    picture = user_info["picture"]
    email = user_info["email"]

    if email not in ACCESS_EMAIL:
        print("Not found email")
        return jsonify({"message": "User not found"}), 404
    
    # Update session ID
    session_id = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(seconds=SESSION_EXPIRATION)
    timestamp_expires_at = expires_at.timestamp()
    
    savejson(email, name, session_id, timestamp_expires_at, picture)
    json_session = load_session(email)
    print("SAVED", json_session.get("session_id") if json_session else None)
    response = jsonify(
        {
            "message": "Logged in with Google",
            "session_expiration": json_session.get("expires_at") if json_session else None,
            "name": json_session.get("name") if json_session else None,
            "picture": json_session.get("picture") if json_session else None
        }
    )
    response.set_cookie("session_id", session_id, httponly=True, max_age=SESSION_EXPIRATION)
    return response

def get_user_by_id(id):
    token = request.headers.get("Authorization")
    print("Received Token:", token)
    if not token:
        return jsonify({"msg": "Missing token"}), 401 
    try:
        token = token.split("Bearer ")[1]  
    except IndexError:
        return jsonify({"msg": "Invalid token format"}), 400
    
    user = User.query.filter_by(user_id=id).first()
    if user:
        if user.auth_type == 'google':
            google_verify_url = "https://www.googleapis.com/oauth2/v3/tokeninfo"
            response = requests.get(f"{google_verify_url}?access_token={token}")
            if response.status_code != 200:
                return jsonify({"msg": "Invalid Google Token"}), 401
            else:
                return jsonify(
                    {
                        "user_id": user.user_id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role.role_name
                    }
                )
        else:
            try:
                decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                if decoded_token["sub"] != user.username:
                    return jsonify({"msg": "Invalid token"}), 401
            except jwt.ExpiredSignatureError:
                return jsonify({"msg": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"msg": "Invalid token"}), 401
            return jsonify(
                {
                    "user_id": user.user_id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role.role_name
                }
            )
    else:
        return jsonify('User not found'), 404

def check_permission(required_permission):
    def decorator(f):
        def wrapper(*args, **kwargs):
            session_id = request.cookies.get("session_id")
            if not session_id:
                return jsonify({"error": "Unauthorized"}), 401

            try:
                user = User.query.filter_by(session_id=session_id).first()
                permissions = db.session.query(Role.permissions).join(User).filter(User.user_id == user.user_id).first()[0]
                print(permissions)
                if required_permission not in permissions:
                    return jsonify({"error": "Forbidden"}), 403
                return f(*args, **kwargs)

            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except jwt.DecodeError:
                return jsonify({"error": "Invalid token"}), 401

        return wrapper
    return decorator

def delete():
    return jsonify('User deleted successfully')