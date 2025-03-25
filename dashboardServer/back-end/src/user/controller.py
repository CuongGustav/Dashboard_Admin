from flask import Blueprint
from .services import (get_all_user_service,get_user_by_server_service)

users = Blueprint ("users", __name__)

#get all user
@users.route("/serverAdmin/UserAll", methods=["GET"])
def get_all_user():
    return get_all_user_service()

#get user by server
@users.route("/serverAdmin/UserByServerId/<int:id>", methods=["GET"])
def get_user_by_server(id):
    return get_user_by_server_service(id)
