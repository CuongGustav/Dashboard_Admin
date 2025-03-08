from flask import jsonify, request
from src.extension import db
from src.library_ma import UserSchema
from src.model import User, Server, UserServerAccess
from sqlalchemy.exc import SQLAlchemyError

user_schema = UserSchema()
users_schema = UserSchema(many=True)

#get all user
def get_all_user_service():
    user = User.query.all()
    if (user):
        return users_schema.jsonify(user), 200
    else:
        return jsonify({"message": "Cannot Get All User"}),404
    
#get user by server
def get_user_by_server_service(server_id):
    server = Server.query.get(server_id)
    if not server:
        return jsonify({"message": "Server Not Found"}), 400
    
    try:
        users = db.session.query(User).join(UserServerAccess, User.user_id == UserServerAccess.user_id)\
                                      .join(Server, Server.server_id == UserServerAccess.server_id)\
                                      .filter(Server.server_id == server_id).all()
        return users_schema.jsonify(users), 200
    except SQLAlchemyError as e:
        return jsonify({"message": "Database Error", "error": str(e)}), 500