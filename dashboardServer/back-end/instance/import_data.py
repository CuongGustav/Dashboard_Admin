import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src import create_app
from src.extension import db
from src.model import Server, ServerMetric
from datetime import datetime, timezone, timedelta
import random
import json


app = create_app()
with app.app_context():
    
    servers = []
    for i in range(1, 21):
        server = Server(
            name=f"Server {i}",
            cpu_threshold=random.randint(50, 90),
            ram_threshold=random.randint(50, 90),
            disk_threshold=random.randint(50, 90),
            failure_threshold=random.randint(3, 10),
            cpu_count_threshold=random.randint(1, 4),
            ram_count_threshold=random.randint(1, 4),
            disk_count_threshold=random.randint(1, 4),
            channel=json.dumps({"email": "admin@example.com", "type": "alert"}),
            status="Active"
        )
        servers.append(server)

    db.session.add_all(servers)
    db.session.commit()

    
    for server in servers:
        
        cpu_usage_list = []
        ram_usage_list = []
        disk_usage_list = []
        disk_used_gb_list = []
        
        
        disk_total_gb = round(random.uniform(500, 1000), 2)

        
        base_timestamp = datetime.now(timezone.utc)
        for j in range(30):
           
            cpu_usage = round(random.uniform(10.0, 95.0), 2)
            cpu_usage_list.append(cpu_usage)

            ram_usage = round(random.uniform(10.0, 95.0), 2)
            ram_usage_list.append(ram_usage)

            disk_used_gb = round(random.uniform(100, disk_total_gb * 0.95), 2)  # Giới hạn để không vượt quá total
            disk_used_gb_list.append(disk_used_gb)

            disk_usage = round((disk_used_gb / disk_total_gb) * 100, 2)
            disk_usage_list.append(disk_usage)

        metric = ServerMetric(
            server_id=server.server_id,
            cpu_usage=json.dumps(cpu_usage_list),
            ram_usage=json.dumps(ram_usage_list),
            disk_usage=json.dumps(disk_usage_list),
            disk_used_gb=json.dumps(disk_used_gb_list),
            disk_total_gb=disk_total_gb,
            timestamp=base_timestamp
        )
        db.session.add(metric)

    db.session.commit()
    print("Thêm dữ liệu thành công!")