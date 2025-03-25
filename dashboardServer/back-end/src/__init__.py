from flask import Flask, request, Blueprint
from .chart.controller import server_metrics
from .logs.controller import logs
from .servermetric.controller import servermetrics
from .user.controller import users
from .server.controller import servers
from .logs.controller import logs
from flask_cors import CORS
from .extension import db, jwt, ma
import os
from .model import User, Role
from .auth.controller import auth

def create_db (app):
    if not os.path.exists("src/serveradmin.db"):
        with app.app_context():
            db.create_all()


def create_app (config_file="config.py"):
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    app.config.from_pyfile(config_file)
    app.register_blueprint(server_metrics)
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)

#     limiter.init_app(app)
    # create_db(app)
    app.register_blueprint(servers)
    app.register_blueprint(logs)
    app.register_blueprint(servermetrics)
    app.register_blueprint(users)
    app.register_blueprint(auth)
    return app