from flask import jsonify, request
from src.extension import db
from src.library_ma import ServerSchema
from src.model import Server, User, UserServerAccess
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
import os, json
from dotenv import load_dotenv

#JSON 
valid_columns_json = {
    "server_name": str,
    "cpu_threshold": int,
    "ram_threshold": int,
    "disk_threshold": int,
    "cpu_count_threshold": int,
    "ram_count_threshold": int,
    "disk_count_threshold": int,
    "google_chat_webhooks": list
}
required_columns_json ={
    "server_name": str,
    "cpu_threshold": int,
    "ram_threshold": int,
    "disk_threshold": int,
}

optional_fields = {
    "cpu_count_threshold": 0,
    "ram_count_threshold": 0,
    "disk_count_threshold": 0,
    "google_chat_webhooks": []
}

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))
config_path = os.getenv('CONFIG_PATH')

#Read file config.json
def load_config():
    if os.path.exists(config_path):
        with open(config_path, 'r') as file:
            return json.load(file)
    else:
        return {}
    
#add server 
def add_server_json_services():
    new_server = request.get_json()
    if not new_server:
        return jsonify({"message": "Server information is required"}), 400
    
    for field in required_columns_json:
        if field not in new_server:
            return jsonify({"message": f"Missing field: {field}"}), 400
    config = load_config()
    servername = new_server["server_name"]
    if servername in config:
        return jsonify({"message": "Server already exists"}), 400
    
    for field, default_value in optional_fields.items():
        if field not in new_server:
            new_server[field] = default_value 

    for key,value in new_server.items():
        if key not in valid_columns_json:
            return jsonify({"message": f"Invalid field: {key}"}), 400
        
        if not isinstance(value, valid_columns_json[key]):
            return jsonify({"message": f"Invalid data type for field: {key}"}), 400
   
    config[servername] = new_server
    with open(config_path, 'w') as file:
        json.dump(config, file, indent=4)
    return jsonify({"message": "Server added successfully"}), 201

#Get server by name
def get_server_by_name_json_services():
    servername = request.args.get('servername')
    if not servername:
        return jsonify({"message": "Server name is required"}), 400
    
    config = load_config()
    if not config:
        return jsonify({"message": "No Servers found"}), 404 

    server_info = config.get(servername)

    if server_info:
        server_info["server_name"] = servername
        return jsonify(server_info), 200
    else:
        return jsonify({"message": "Server not found"}), 404
    
#Get All Server JSON
def get_all_server_json_services():
    config = load_config()
    
    if config:
        servers = []
        for server_name, server_info in config.items():
            server_info["server_name"] = server_name
            servers.append(server_info)
        
        return jsonify(servers), 200
    else:
        return jsonify({"message": "No Servers found"}), 404
    
#Search Server by Name JSON
def search_server_by_name_json_services():
    servername = request.args.get('servername')
    if not servername:
        return jsonify({"message": "Server name is required"}), 400

    config = load_config()

    filtered_servers = [
        {**info, "server_name": server}  
        for server, info in config.items()
        if servername.lower() in server.lower()
    ]

    if filtered_servers:
        return jsonify(filtered_servers), 200
    else:
        return jsonify([]), 200


# Update server by name JSON
def update_server_by_name_json_services():
    servername = request.args.get('servername')
    new_info = request.get_json()
    
    if not servername or not new_info:
        return jsonify({"message": "Server name and new information are required"}), 400
    
    config = load_config()
    if servername not in config:
        return jsonify({"message": "Server not found"}), 404
    
    new_name = new_info.get("server_name")
    if new_name and new_name != servername:
        if new_name in config:
            return jsonify({"message": "New server name already exists"}), 400
        
        config[new_name] = config.pop(servername)  # Change server name in config
        servername = new_name  # Update servername to continue processing
    
    current_server_info = config[servername]
    
    # Update the server info with new data
    for key, value in new_info.items():
        if key in valid_columns_json:
            if not isinstance(value, valid_columns_json[key]):
                return jsonify({"message": f"Invalid data type for field: {key}"}), 400
            current_server_info[key] = value
        elif key != "server_name":  # Ensure "server_name" is not in the fields
            return jsonify({"message": f"Invalid field: {key}"}), 400
    
    # Remove the "server_name" field before saving to JSON
    current_server_info.pop("server_name", None)

    updated_config = {servername: current_server_info}
    for key, value in config.items():
        if key != servername:  # Keep other servers unchanged
            updated_config[key] = value
    
    with open(config_path, 'w') as file:
        json.dump(updated_config, file, indent=4)  # Save the updated config without "server_name"

    return jsonify({"message": "Server updated successfully"}), 200



#delete server by name JSON
def delete_server_by_name_json_services():
    servername = request.args.get('servername')
    if not servername:
        return jsonify({"message": "Server name is required"}), 400
    config = load_config()
    if servername not in config:
        return jsonify({"message": "Server not found"}), 404
    del config[servername]
    with open(config_path, 'w') as file:
        json.dump(config, file, indent=4) 
    return jsonify({"message": "Server deleted successfully"}), 200

