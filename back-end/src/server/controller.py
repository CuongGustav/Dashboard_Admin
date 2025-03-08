from flask import Blueprint
from .services import (add_server_service, get_server_by_id_service, update_server_by_id_service,
                       delete_server_by_id_service, get_all_server_service, 
                       get_all_server_sorted_service, get_server_by_user_service,
                       search_server_by_name_service, get_server_by_user_sorted_service,
                       sorted_server_search_by_name_service, server_search_by_name_selected_user_service)

servers = Blueprint("servers", __name__)

#add server
@servers.route("/serverAdmin/Server", methods=['POST'])
def add_book():
    return add_server_service()

#get server by id
@servers.route("/serverAdmin/Server/<int:id>", methods=['GET'])
def get_server_by_id(id):
    return get_server_by_id_service(id)

#get all server
@servers.route("/serverAdmin/ServerAll", methods=["GET"])
def get_all_server():
    return get_all_server_service()

#update server by id 
@servers.route("/serverAdmin/Server/<int:id>", methods=['PUT'])
def update_server_by_id(id):
    return update_server_by_id_service(id)

#delete server by id
@servers.route("/serverAdmin/Server/<int:id>", methods=['DELETE'])
def delete_server_by_id(id):
    return delete_server_by_id_service(id)

#get all server sorted 
@servers.route("/serverAdmin/GetAllServerSorted/", methods=["GET"])
def get_all_server_sorted():
    return get_all_server_sorted_service()

#get all server by user
@servers.route("/serverAdmin/GetAllServerByUser/<int:id>", methods=["GET"])
def get_all_server_by_user(id):
    return get_server_by_user_service(id)

#get server by user sorted
@servers.route("/serverAdmin/ServerByUserSorted/<int:id>", methods=["GET"])
def get_server_by_user_sorted(id):
    return get_server_by_user_sorted_service(id)

#search server by name
@servers.route("/serverAdmin/SearchServerByName/", methods=["GET"])
def search_server_by_name():
    return search_server_by_name_service()

#sorted server search by name
@servers.route("/serverAdmin/ServerSearchByNameSort", methods=["GET"])
def sorted_server_search_by_name():
    return sorted_server_search_by_name_service()

#search server by name and selected user specific
@servers.route("/serverAdmin/SearchServerByNameServerAndUser/", methods=["GET"])
def server_search_by_name_selected_user():
    return server_search_by_name_selected_user_service()