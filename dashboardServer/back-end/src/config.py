import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.environ.get("KEY")
SQLALCHEMY_DATABASE_URI = os.environ.get("DB_URL") 
FLASK_JWT_SECRET_KEY = os.environ.get("JWT_KEY")
ACCESS_TOKEN_EXPIRES = os.environ.get("TOKEN")
REFRESH_TOKEN_EXPIRES = os.environ.get("REFRESH_TOKEN")
SQLALCHEMY_TRACK_MODIFICATIONS = False


