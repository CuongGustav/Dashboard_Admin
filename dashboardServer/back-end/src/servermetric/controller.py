from flask import Blueprint
from datetime import datetime
from .services import (add_server_metric_service,delete_server_metric_service,
                       get_all_server_metric_service, get_all_server_metric_by_time_service,
                       get_all_server_metric_by_serverid_service,
                       get_server_metric_sorted_serverid_service,
                       get_all_server_metric_sorted_service)

servermetrics = Blueprint("servermetrics", __name__)

#add server metric
@servermetrics.route("/serverAdmin/ServerMetric", methods=["POST"])
def add_server_metric():
    return add_server_metric_service()

#get all server metric
@servermetrics.route("/serverAdmin/ServerMetricAll", methods=["GET"])
def get_all_server_metric():
    return get_all_server_metric_service()

#get all server metric by serverid
@servermetrics.route("/serverAdmin/ServerMetricAllByServer/<int:id>", methods=["GET"])
def get_all_server_metric_by_serverid(id):
    return get_all_server_metric_by_serverid_service(id)

#delete server metric by id
@servermetrics.route("/serverAdmin/ServerMetric/<int:id>", methods=["DELETE"])
def delete_server_metric(id):
    return delete_server_metric_service(id)

#Filter Server Metric By Time
@servermetrics.route("/serverAdmin/ServerMetricByTime/", methods=["GET"])
def get_all_server_metric_by_time():
    return get_all_server_metric_by_time_service()

#Get server metrics sorted services by serverid
@servermetrics.route("/serverAdmin/SortServerMetricByServer/<int:id>", methods=["GET"])
def get_server_metric_sorted_services_by_serverid(id):
    return get_server_metric_sorted_serverid_service(id)

#Get all Server Metrics Sorted 
@servermetrics.route("/serverAdmin/SortServerMetricAll/", methods=["GET"])
def get_all_server_metric_sorted():
    return get_all_server_metric_sorted_service()