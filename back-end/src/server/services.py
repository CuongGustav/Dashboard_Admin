from flask import jsonify, request
from src.extension import db
from src.library_ma import ServerSchema
from src.model import Server, User, UserServerAccess
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

server_schema = ServerSchema()
servers_schema = ServerSchema(many=True)

valid_columns ={
    "name" : Server.name,
    "cpu_threshold" : Server.cpu_threshold,
    "ram_threshold" : Server.ram_threshold,
    "disk_threshold" : Server.disk_threshold,
    "failure_threshold" : Server.failure_threshold,
    "cpu_count_threshold" : Server.cpu_count_threshold,
    "ram_count_threshold" : Server.ram_count_threshold,
    "disk_count_threshold" : Server.disk_count_threshold,
    "channel" : Server.channel,
    "status" : Server.status,
    "created_at" : Server.created_at,
    "updated_at" : Server.updated_at
}

#add server
def add_server_service():
    data = request.json
    if ( data and ('name' in data) and ('cpu_threshold' in data) and ('ram_threshold' in data)
        and ('disk_threshold' in data) and ('failure_threshold' in data) and ('cpu_count_threshold' in data)
        and ('ram_count_threshold' in data) and ('disk_count_threshold' in data) and ('channel' in data)
        and ('status' in data) and ('created_at' in data) and ('updated_at' in data)
    ):
        name = data['name']
        cpu_threshold = data['cpu_threshold']
        ram_threshold = data['ram_threshold']
        disk_threshold = data['disk_threshold']
        failure_threshold = data['failure_threshold']
        cpu_count_threshold = data['cpu_count_threshold']
        ram_count_threshold = data['ram_count_threshold']
        disk_count_threshold = data['disk_count_threshold'] 
        channel = data['channel']
        status = data['status']
        created_at = datetime.fromisoformat(data['created_at'].replace("Z", "+00:00"))
        updated_at = datetime.fromisoformat(data['updated_at'].replace("Z", "+00:00"))

        try:
            new_server = Server(name, cpu_threshold, ram_threshold, disk_threshold, failure_threshold, 
                                cpu_count_threshold, ram_count_threshold, disk_count_threshold, channel,
                                status, created_at, updated_at)
            db.session.add(new_server)
            db.session.commit()
            return jsonify({"message": "Add success!"}), 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({"message": "Failed to create Server", "error": str(e)}), 400
    else:
        return jsonify({"message": "Request error"}), 400
    
#get server by id
def get_server_by_id_service(id):
    server = Server.query.get(id)
    if (server): 
        return server_schema.jsonify(server), 200
    else:
        return jsonify({"message": "Cannot Found Server"}), 404
    
#get all server
def get_all_server_service():
    servers = Server.query.all()
    if (servers):
        return servers_schema.jsonify(servers), 200
    else:
        return jsonify({"message": "Cannot Found All Server"}),404
       
#update server by id
def update_server_by_id_service(id):
    server = Server.query.get(id)
    if not server:
        return jsonify({"message": "Cannot Found Server"}), 404
    
    data = request.json
    if not data:
        return jsonify({"message": "Invalid JSON Data"}), 400
    
    data['created_at'] = datetime.fromisoformat(data['created_at'].replace("Z","+00:00"))
    data['updated_at'] = datetime.fromisoformat(data['updated_at'].replace("Z", "+00:00"))

    try:
        editable_filed = {'name', 'cpu_threshold', 'ram_threshold', 'disk_threshold', 'failure_threshold',
                        'cpu_count_threshold', 'ram_count_threshold', 'disk_count_threshold',
                        'channel', 'status', 'created_at', 'updated_at'}
        for key, value in data.items():
            if key in editable_filed:
                setattr (server, key, value)
        db.session.commit()
        return jsonify({"message": "Updated Server"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Cannot Update Server", "error": str(e)}), 404
    
#delete server by id
def delete_server_by_id_service(id):
    server = Server.query.get(id)
    if not server:
        return jsonify({"message": "Cannot Found Server"}), 404
    try:
        UserServerAccess.query.filter_by(server_id = id).delete()
        db.session.delete(server)
        db.session.commit()
        return jsonify({"message": "Deleted Server"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Cannot Delete Server", "error": str(e)}), 404
    
#get all server sorted
def get_all_server_sorted_service():

    sort_by = request.args.get("sort_by", "name")
    order = request.args.get("order", "desc")

    if sort_by not in valid_columns:
        return jsonify({"message": "Invalid sort field"}), 400
    
    sort_column = valid_columns[sort_by]

    if order == 'asc':
        sort_column = sort_column.asc()
    else:
        sort_column = sort_column.desc()

    try:
        servers = Server.query.order_by(sort_column).all()
        return servers_schema.jsonify(servers), 200
    except SQLAlchemyError as e:
        return jsonify({"message": "database Error", "error": str(e)}),500
    

#get server by user
def get_server_by_user_service(id):
    user = User.query.get(id)
    if user:
        try: 
            servers = db.session.query(Server).join(UserServerAccess, UserServerAccess.server_id == Server.server_id)\
                                    .join(User, UserServerAccess.user_id == User.user_id)\
                                    .filter(User.user_id == id).all()
            return servers_schema.jsonify(servers), 200
        except SQLAlchemyError as e:
            return jsonify({"message": "Database Error", "error": str(e)}), 500
    else:
        return jsonify ({"mesage": "User not found"}), 404
    
#get server by user sorted
def get_server_by_user_sorted_service(id):
    user = User.query.get(id)

    if not user:
        return jsonify({"mesage": "User Invalid"}), 400 

    sort_by = request.args.get("sort_by", "name")
    order = request.args.get("order", "desc")

    if sort_by not in valid_columns:
        return jsonify({"message": "Invalid sort field"}), 400
    if order not in ['asc', 'desc']:
        return jsonify({"message": "Invalid order field"}), 400
    
    sort_column = valid_columns[sort_by]

    if order == 'asc':
        sort_column = sort_column.asc()
    else:
        sort_column = sort_column.desc()

    try:
        serversUser = db.session.query(Server).join(UserServerAccess, UserServerAccess.server_id == Server.server_id) \
                                                .join(User, UserServerAccess.user_id == User.user_id) \
                                                .filter(User.user_id == id) \
                                                .order_by(sort_column) \
                                                .all()

        return servers_schema.jsonify(serversUser), 200
    except SQLAlchemyError as e:
        return jsonify({"message": "Database Error", "error": str(e)}), 500

#search server by name selectUser -> all
def search_server_by_name_service():
    server_name = request.args.get("server_name")

    if not server_name:
        return jsonify({"message": "Server name is required"}), 400
    
    try:
        servers = Server.query.filter(Server.name.ilike(f"%{server_name}%")).all()
        return servers_schema.jsonify(servers), 200
    except SQLAlchemyError as e:
        return jsonify({"message": "Database Error", "error": str(e)}), 500
    
#sorted server search by name selectUser -> all
def sorted_server_search_by_name_service():
    server_name = request.args.get("server_name")
    sort_by = request.args.get("sort_by", "name")
    order = request.args.get("order", "desc")

    if not server_name:
        return jsonify({"message": "Server name is required"}), 400
    if sort_by not in valid_columns:
        return jsonify({"message": "Invalid sort field"}), 400
    if order not in ["asc", "desc"]:
        return jsonify({"message": "Invalid order field"}), 400

    sort_column = valid_columns[sort_by]

    if order == "asc":
        sort_column = sort_column.asc()
    else:
        sort_column = sort_column.desc()

    try:
        servers = Server.query.filter(Server.name.ilike(f"%{server_name}%")).order_by(sort_column).all()
        return jsonify(servers_schema.dump(servers)), 200
    except SQLAlchemyError as e:
        return jsonify({"message": "Database Error", "error": str(e)}), 500

#search server by name and selected user specific
def server_search_by_name_selected_user_service():
    server_name = request.args.get("server_name")
    server_name = server_name.strip()
    user_id = request.args.get("user_id")

    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User Invalid"}), 400
    
    if server_name:
        try:
            servers = db.session.query(Server).join(UserServerAccess, UserServerAccess.server_id == Server.server_id)\
                                          .join(User, User.user_id == UserServerAccess.user_id)\
                                          .filter(User.user_id == user_id)\
                                          .filter(Server.name.ilike(f"%{server_name}%")).all()
            return servers_schema.jsonify(servers), 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({"message": "server Error", "error": str(e)})
    else:
        return jsonify({"message": "Server Name Invalid"}), 400

    
