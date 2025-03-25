from flask import Blueprint
from .services import get_server_history_service, get_server_list_service

server_metrics = Blueprint("server_metrics", __name__)

@server_metrics.route("/", methods=["GET"])
def home():
    return "Server Management"

@server_metrics.route("/servers", methods=["GET"])
def get_server_list():
    return get_server_list_service()

@server_metrics.route("/chart/<string:server_name>/history", methods=["GET"])
def get_server_history(server_name):
    return get_server_history_service(server_name)
