from flask import Blueprint
from .services import (
                       get_server_by_name_json_services, get_all_server_json_services,
                       search_server_by_name_json_services, update_server_by_name_json_services,
                       delete_server_by_name_json_services, add_server_json_services)

servers = Blueprint("servers", __name__)


#JSON
#add server
@servers.route("/serverAdmin/AddServerJSON", methods=["POST"])
def add_server_json():
    return add_server_json_services()

#get server by name JSON
@servers.route("/serverAdmin/GetServerByNameJSON", methods=["GET"])
def get_server_by_name_json():
    return get_server_by_name_json_services()

#get all server JSON
@servers.route("/serverAdmin/GetAllServerJSON", methods=["GET"])
def get_all_server_json():
    return get_all_server_json_services()

#get server by name JSON
@servers.route("/serverAdmin/SearchServerByNameJSON", methods=["GET"])
def search_server_by_name_json():
    return search_server_by_name_json_services()

#update server by name JSON
@servers.route("/serverAdmin/UpdateServerByNameJSON", methods=["PUT"])
def update_server_by_name_json():
    return update_server_by_name_json_services()

#delete server by name JSON
@servers.route("/serverAdmin/DeleteServerByNameJSON", methods=["DELETE"])
def delete_server_by_name_json():
    return delete_server_by_name_json_services()
