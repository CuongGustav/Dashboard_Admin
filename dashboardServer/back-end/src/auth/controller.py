from flask import Blueprint
from .services import check_permission, register, login, get_user_by_id, logout, protected, google_callback, google_login, delete, get_session_by_session_id
from flask_jwt_extended import jwt_required
from src.extension import limiter
auth = Blueprint("auth", __name__)
@auth.route("/register", methods = ['POST'])
def register_user():
    return register()

@auth.route("/login", methods = ['POST'])
def login_user():
    return login()
@auth.route("/google-login", methods = ['POST'])
def google_login_user():
    return google_login()
@auth.route("/auth/callback", methods = ['POST'])
def auth_google_callback():
    return google_callback()
@auth.route("/logout", methods = ['POST'])
def logout_user():
    return logout()
@auth.route("/protected", methods = ['GET'])
def protected_user():
    return protected()
@auth.route("/user/<int:id>", methods = ['GET'])
def get_user(id):
    return get_user_by_id(id)
@auth.route("/server/delete", methods = ['POST'])
@check_permission('delete')
def delete_user():
    return delete()

@auth.route("/get_session/<string:id>", methods = ['GET'] )
def get_session(id):
    return get_session_by_session_id(id)


