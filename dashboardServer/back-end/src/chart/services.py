import os
from flask import jsonify
import json

def get_server_list_service():
    # get current path of services.py
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # go to api/client_data/{server_name}.json
    base_path = os.path.join(current_dir, "..", "..", "..", "..", "api", "client_data")

    try:
        files = os.listdir(base_path)
        json_files = [f for f in files if f.endswith(".json")]
    except FileNotFoundError:
        return jsonify({"message": f"Directory not found at {base_path}"}), 404

    server_list = [os.path.splitext(f)[0] for f in json_files]

    if not server_list:
        return jsonify({"message": "No servers found"}), 404

    return jsonify(server_list)

def get_server_history_service(server_name):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.join(current_dir, "..", "..", "..", "..", "api", "client_data")
    file_path = os.path.join(base_path, f"{server_name}.json")

    if not os.path.exists(file_path):
        return jsonify({"message": f"No history found for server '{server_name}'"}), 404

    with open(file_path, 'r', encoding='utf-8') as file:
        server_metrics = json.load(file)

    cpu_usage_list = server_metrics.get("cpu_history", [])
    ram_usage_list = server_metrics.get("ram_history", [])
    disk_usage_list = server_metrics.get("disk_history", [])
    last_reported = server_metrics.get("last_reported", "")

    response_data = {
        "cpu_history": [str(x) for x in cpu_usage_list],
        "ram_history": [str(x) for x in ram_usage_list],
        "disk_history": [str(x) for x in disk_usage_list],
        "last_reported": last_reported
    }

    return jsonify(response_data)

