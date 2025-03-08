from flask import jsonify, request
from src.extension import db
from src.library_ma import ServerMetricSchema
from sqlalchemy.exc import SQLAlchemyError
from src.model import ServerMetric, Server
from datetime import datetime, timezone

serverMetric_schema = ServerMetricSchema()
serverMetrics_schema = ServerMetricSchema(many=True)

valid_columns = {
    "server_id": ServerMetric.server_id,
    "cpu_usage": ServerMetric.cpu_usage,
    "ram_usage": ServerMetric.ram_usage,
    "disk_usage": ServerMetric.disk_usage,
    "disk_used_gb": ServerMetric.disk_used_gb,
    "disk_total_gb": ServerMetric.disk_total_gb,
    "timestamp": ServerMetric.timestamp
}

#add server metric
def add_server_metric_service():
    data = request.json

    if ( data  and ( 'server_id' in data) and ('cpu_usage' in data) and ('ram_usage' in data) and 
        ('disk_usage' in data) and ('disk_used_gb' in data) and ('disk_total_gb' in data) and ('timestamp' in data)):

        data['timestamp'] = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))

        server_id = data['server_id']
        cpu_usage = data['cpu_usage']
        ram_usage = data['ram_usage']
        disk_usage = data['disk_usage']
        disk_usage_gb = data['disk_used_gb']
        disk_total_gb = data['disk_total_gb']
        timestamp = data['timestamp']

        try:
            new_server_metric = ServerMetric(server_id, cpu_usage, ram_usage, disk_usage, disk_usage_gb, 
                                             disk_total_gb, timestamp)
            db.session.add(new_server_metric)
            db.session.commit()
            return jsonify({"mesage": "Add Server Metric Success"}), 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({"message": "Fail To Create Server Metric" , "error": str(e)}), 404

    else:
        return jsonify({"message": "Request error"}), 400
    
#get all server metric
def get_all_server_metric_service():
    serverMetrics = ServerMetric.query.all()
    if serverMetrics:
        return serverMetrics_schema.jsonify(serverMetrics), 200
    else: 
        return jsonify({"message": "Cannot Get All Server Metric"}), 404
    
#get all serrver metric by serverid
def get_all_server_metric_by_serverid_service(server_id):
    if not isinstance(server_id, int) and server_id > 0:
        return jsonify({"message": "Invalid Server"}), 400
    try:
        serverMetrics = ServerMetric.query.filter(ServerMetric.server_id == server_id).all()
        if serverMetrics:
            return serverMetrics_schema.jsonify(serverMetrics), 200
        else :
            return jsonify({"message": "No Server Metric By Server"}), 404
    except SQLAlchemyError as e:
        return jsonify({"message": "Request Error", "error": str(e)}), 400


#delete server metric
def delete_server_metric_service(id):
    servermetric = ServerMetric.query.get(id)
    if not servermetric:
        return jsonify({"message": "Cannot Find Server Metric"}), 404
    else:
        try:
            db.session.delete(servermetric)
            db.session.commit()
            return jsonify({"message": "Delete Server Metric Success"}), 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({"message": "Cannot Delete Server Metric", "error": str(e)}), 404
        
#Get All Server Metric By Time
def get_all_server_metric_by_time_service():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    #if not start_date and end_date => default today
    if not start_date and not end_date:
        today = datetime.now(timezone.utc).date()
        start_date = datetime.combine(today, datetime.min.time())
        end_date = datetime.combine(today, datetime.max.time())

    try:
        if start_date: 
            start_date = datetime.fromisoformat(start_date.replace("Z", "+00:00").strip())
        else :
            start_date = datetime.min
        
        if end_date:
            end_date = datetime.fromisoformat(end_date.replace("Z", "+00:00").strip())
        else:
            end_date = datetime.max

        filter_serverMetrics = ServerMetric.query.filter(ServerMetric.timestamp.between(start_date, end_date )).all()
        if filter_serverMetrics:
            return serverMetrics_schema.jsonify(filter_serverMetrics), 200
        else :
            return jsonify({"message": "No server metric found in this date range"}), 404

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Database Error", "error": str(e)}), 500
    
#get server metrics sorted by serverid
def get_server_metric_sorted_serverid_service(server_id):
    sort_by = request.args.get("sort_by", "timestamp") #default sort by timestamp
    order = request.args.get("order", "desc").strip().lower() #default decreases

    if sort_by not in valid_columns:
        return jsonify({"message": "Invalid sort field"}), 400
    
    sort_column = valid_columns[sort_by]

    if order == "asc":
        sort_column = sort_column.asc()
    else:
        sort_column = sort_column.desc()

    try: 
        serverMetrics = ServerMetric.query.filter_by(server_id = server_id).order_by(sort_column).all()
        return serverMetrics_schema.jsonify(serverMetrics), 200
    except SQLAlchemyError as e:
        return jsonify({"message": "Database Error", "error": str(e)})
    
#get all server metric sorted
def get_all_server_metric_sorted_service():

    #args using query param from request
    sort_by = request.args.get("sort_by", "timestamp") #default sort by timestamp
    order = request.args.get("order", "desc").strip().lower() #default decreases

    if sort_by not in valid_columns:
        return jsonify({"message": "Invalid sort field"}), 400
    
    sort_column = valid_columns[sort_by]

    if order == "asc":
        sort_column = sort_column.asc()
    else:
        sort_column = sort_column.desc()

    try:
        serverMetrics = ServerMetric.query.order_by(sort_column).all()
        return serverMetrics_schema.jsonify(serverMetrics), 200
    except SQLAlchemyError as e:
        return jsonify({"message": "Database Error", "error": str(e)}), 500
    