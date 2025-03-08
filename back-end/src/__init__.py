from flask import Flask, request, Blueprint
from .extension import db, ma
from .server.controller import servers
from .logs.controller import logs
from .servermetric.controller import servermetrics
from .user.controller import users
from flask_cors import CORS
import os

def create_db (app):
    if not os.path.exists("src/serveradmin.db"):
        with app.app_context():
            db.create_all()


def create_app (config_file="config.py"):
    app = Flask(__name__)
    CORS(app)
    app.config.from_pyfile(config_file)
    db.init_app(app)
    ma.init_app(app)
    create_db(app)
    app.register_blueprint(servers)
    app.register_blueprint(logs)
    app.register_blueprint(servermetrics)
    app.register_blueprint(users)
    return app