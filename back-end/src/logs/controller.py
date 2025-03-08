from flask import Blueprint
from .services import (add_log_service, get_log_by_id_service, 
                       get_all_log_service, get_all_log_by_server_service)

logs = Blueprint("logs", __name__)

#add log
@logs.route("/serverAdmin/Log", methods=["POST"])
def add_log():  
    return add_log_service()

#get log by id
@logs.route("/serverAdmin/Log/<int:id>", methods=["GET"])
def get_log_by_id(id):
    return get_log_by_id_service(id)

#get all log
@logs.route("/serverAdmin/LogAll", methods=["GET"])
def get_all_log():
    return get_all_log_service()

#get all log by server
@logs.route("/serverAdmin/LogsByServer/<int:server_id>", methods=["GET"])
def get_all_log_by_server(server_id):
    return get_all_log_by_server_service(server_id)
    