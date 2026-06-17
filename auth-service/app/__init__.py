import logging

from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db, jwt


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    # 允许各子产品前台带 cookie 跨源调用认证接口
    CORS(app, resources={r"/auth/api/*": {
        "origins": app.config["CORS_ORIGINS"].split(","),
        "supports_credentials": True,
    }})

    if not app.config.get("TESTING") and not app.logger.handlers:
        h = logging.StreamHandler()
        h.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
        app.logger.addHandler(h)
    app.logger.setLevel(app.config.get("LOG_LEVEL", "INFO"))

    db.init_app(app)
    jwt.init_app(app)

    from .errors import register_error_handlers
    register_error_handlers(app)

    @app.get("/auth/api/health")
    def health():
        return {"status": "ok"}

    from .blueprints.auth import auth_bp
    app.register_blueprint(auth_bp)

    with app.app_context():
        from . import models  # noqa: F401
        db.create_all()

    return app
