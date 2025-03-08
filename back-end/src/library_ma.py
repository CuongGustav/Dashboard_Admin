from .extension import ma

class ServerSchema(ma.Schema):
    class Meta:
        fields = ('server_id', 'name', 'cpu_threshold', 'ram_threshold', 'disk_threshold', 
                  'cpu_count_threshold', 'ram_count_threshold', 'disk_count_threshold',
                  'failure_threshold', 'channel', 'status', 'created_at', 'updated_at')

class LogsSchema(ma.Schema):
    class Meta:
        fields = ('log_id', 'server_id', 'log_type', 'log_text', 'created_at')

class ServerMetricSchema(ma.Schema):
    class Meta:
        fields = ('id', 'server_id', 'cpu_usage', 'ram_usage', 'disk_usage', 'disk_used_gb', 
                  'disk_total_gb', 'timestamp')

class ServerProgressSchema(ma.Schema):
    class Meta:
        fields = ('id', 'server_id', 'process_name', 'cpu_usage', 'ram_usage', 'timestamp')

class ServerAlertsSchema(ma.Schema):
    class Meta:
        fields = ('id', 'server_id', 'alert_type', 'status', 'timestamp')

class UserSchema(ma.Schema):
    class Meta:
        fields = ('user_id', 'username', 'email', 'password', 'role_id', 'auth_type', 'session_id', 'session_exp')

class RoleSchema(ma.Schema):
    class Meta:
        fields = ('role_id', 'role_name', 'permission')

class UserServerAccess(ma.Schema):
    class Meta:
        fileds = ('user_server_access_id', 'user_id', 'server_id')
