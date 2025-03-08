from .extension import db
from sqlalchemy import Enum
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime, timezone
import json
from werkzeug.security import generate_password_hash, check_password_hash

class Server(db.Model):
    server_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    cpu_threshold = db.Column(db.Integer)
    ram_threshold = db.Column(db.Integer)
    disk_threshold = db.Column(db.Integer)
    failure_threshold = db.Column(db.Integer)
    cpu_count_threshold = db.Column(db.Integer)
    ram_count_threshold = db.Column(db.Integer)
    disk_count_threshold = db.Column(db.Integer)
    channel = db.Column(JSON)
    status = db.Column(db.Enum("Active", "Inactive", "Fail", name="server_status"))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    def __init__(self, name, cpu_threshold, ram_threshold, disk_threshold,
                 failure_threshold, cpu_count_threshold, ram_count_threshold, disk_count_threshold,
                 channel, status, created_at=None, updated_at=None):
        self.name = name
        self.cpu_threshold = cpu_threshold
        self.ram_threshold = ram_threshold
        self.disk_threshold = disk_threshold
        self.failure_threshold = failure_threshold
        self.cpu_count_threshold = cpu_count_threshold
        self.ram_count_threshold = ram_count_threshold
        self.disk_count_threshold = disk_count_threshold
        self.channel = channel
        self.status = status
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)
class Logs(db.Model):
    log_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    server_id = db.Column(db.Integer, db.ForeignKey('server.server_id'), nullable=False)
    log_type = db.Column(db.String(255), nullable=False)
    log_text = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    server = db.relationship('Server', backref=db.backref('logs', lazy=True))
    def __init__(self, server_id, log_type, log_text, created_at=None):
        self.server_id = server_id
        self.log_type = log_type
        self.log_text = log_text
        self.created_at = created_at or datetime.now(timezone.utc)()
class ServerMetric(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    server_id = db.Column(db.Integer, db.ForeignKey('server.server_id'), nullable=False)
    cpu_usage = db.Column(db.Float)
    ram_usage = db.Column(db.Float)
    disk_usage = db.Column(db.Float)
    disk_used_gb = db.Column(db.Float)
    disk_total_gb = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    server = db.relationship('Server', backref=db.backref('server_metrics', lazy=True))
    def __init__(self, server_id, cpu_usage, ram_usage, disk_usage, disk_used_gb, disk_total_gb, timestamp=None):
        self.server_id = server_id
        self.cpu_usage = cpu_usage
        self.ram_usage = ram_usage
        self.disk_usage = disk_usage
        self.disk_used_gb = disk_used_gb
        self.disk_total_gb = disk_total_gb
        self.timestamp = timestamp or datetime.now(timezone.utc)()
class ServerProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    server_id = db.Column(db.Integer, db.ForeignKey('server.server_id'), nullable=False)
    process_name = db.Column(db.String(255), nullable=False)
    cpu_usage = db.Column(db.Float)
    ram_usage = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    server = db.relationship('Server', backref=db.backref('server_progress', lazy=True))
    def __init__(self, server_id, process_name, cpu_usage, ram_usage, timestamp=None):
        self.server_id = server_id
        self.process_name = process_name
        self.cpu_usage = cpu_usage
        self.ram_usage = ram_usage
        self.timestamp = timestamp or datetime.now(timezone.utc)
class ServerAlerts(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    server_id = db.Column(db.Integer, db.ForeignKey('server.server_id'), nullable=False)
    alert_type = db.Column(db.Enum("CPU", "RAM", "DISK", name="alert_type"))
    status = db.Column(db.Boolean)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    server = db.relationship('Server', backref=db.backref('server_alerts', lazy=True))
    def __init__(self, server_id, alert_type, status, timestamp=None):
        self.server_id = server_id
        self.alert_type = alert_type
        self.status = status
        self.timestamp = timestamp or datetime.now(timezone.utc)()
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(80), unique = True, nullable = False)
    email = db.Column(db.String(120), unique = True, nullable = False)
    password = db.Column(db.String(256), nullable = False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id'), nullable = False)
    auth_type = db.Column(db.Enum('local', 'google'), nullable=False)
    role = db.relationship('Role', backref='users')
    session_id = db.Column(db.String(256), nullable=True)
    session_expiration = db.Column(db.DateTime, nullable=True)
    def __init__(self, username, email, password, role_id, auth_type):
        self.username = username
        self.email = email
        self.password = password
        self.role_id = role_id
        self.auth_type = auth_type
    def __repr__(self):
        return '<User %r>' % self.username
    def set_password(self, password):
        hashed = generate_password_hash(password)
        self.password = hashed.split('$', 1)[-1]
    def check_password(self, password):
        full_hash = f"scrypt:32768:8:1${self.password}"
        print(full_hash)
        return check_password_hash(full_hash, password)
    @classmethod
    def get_by_username(cls, username):
        return cls.query.filter_by(username = username).first()
    def save_user (self):
        db.session.add(self)
        db.session.commit()
class Role(db.Model):
    __tablename__ = 'roles'
    role_id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(50), unique=True, nullable=False)
    permissions = db.Column(db.Text, nullable=False)
    def __init__(self, role_name, permissions):
        self.role_name = role_name
        self.permissions = permissions
    def get_permissions(self):
        """Chuyển chuỗi JSON thành dictionary"""
        return json.loads(self.permissions)
    def has_permission(self, permission):
        """Kiểm tra quyền"""
        perms = self.get_permissions()
        return perms.get(permission, False)
class UserServerAccess(db.Model):
    user_server_access_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    server_id = db.Column(db.Integer, db.ForeignKey('server.server_id'), nullable=False)
    user = db.relationship('User', backref=db.backref('user_server_access', lazy=True))
    server = db.relationship('Server', backref=db.backref('user_server_access', lazy=True))
    def __init__(self, user_id, server_id):
        self.user_id = user_id
        self.server_id = server_id