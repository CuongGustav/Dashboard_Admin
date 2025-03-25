from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    get_remote_address,  # Giới hạn dựa trên IP
    default_limits=["100 per minute"],  # Giới hạn mặc định
)

jwt = JWTManager()
db = SQLAlchemy()
ma = Marshmallow()

