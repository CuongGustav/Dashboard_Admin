from flask import request, jsonify
from src.extension import db
from src.library_ma import LogsSchema
from src.model import Logs, Server
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

log_schema = LogsSchema()
logs_schema = LogsSchema(many=True) 

#add log
def add_log_service():
    data = request.json
    if (data and ('server_id' in data) and ('log_type' in data) 
        and ('log_text' in data) and ('created_at' in data)):

        server_id = data['server_id']
        log_type = data['log_type']
        log_text = data['log_text']
        created_at = datetime.fromisoformat(data['created_at'].replace("Z", "+00:00"))   

        try:
            new_log = Logs(server_id, log_type, log_text, created_at)
            db.session.add(new_log)
            db.session.commit()
            return jsonify({"message": "Created Logs"}), 200
        except SQLAlchemyError as e:
            return jsonify({"message": "Fail To Create Logs", "error": str(e)}),404
    else:
        return jsonify({"Message": "Request Error"}),400

#Get log by id    
def get_log_by_id_service(id):
    log = Logs.query.get(id)
    if log:
        return log_schema.jsonify(log),200
    else:
        return jsonify({"message": "Cannot Found Logs"}), 404

#Get all log    
def get_all_log_service():
    logs = Logs.query.all()
    if logs:
        return logs_schema.jsonify(logs), 200
    else:
        return jsonify({"message": "Cannot Found All Server"}), 404 

#Get all log by server id    
def get_all_log_by_server_service(server_id):
    if not isinstance(server_id, int) and server_id>0:
        return jsonify({"message": "Invalid Server"}),400
    
    try:
        logs = Logs.query.join(Server).filter( server_id == Logs.server_id).all()
        if logs:
            return logs_schema.jsonify(logs), 200
        else:
            return jsonify({"message": "Cannot Find Log By Server"}), 404
    except SQLAlchemyError as e:
        return jsonify({"message": "Database Occur", "error": str(e)}), 500