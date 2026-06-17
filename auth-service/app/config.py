import os


class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///auth.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": int(os.environ.get("DB_POOL_RECYCLE", "280")),
    }

    # —— JWT（所有子产品共享同一个密钥来校验）——
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET", "dev-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get("JWT_TTL_SECONDS", str(7 * 24 * 3600)))
    # 浏览器走 cookie 实现跨子路径 SSO；程序调用也支持 Authorization 头
    JWT_TOKEN_LOCATION = ["cookies", "headers"]
    JWT_COOKIE_DOMAIN = os.environ.get("COOKIE_DOMAIN") or None  # 生产填 .shanhaiyouling.com
    JWT_COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "0") == "1"  # 生产=1(仅https)
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_COOKIE_CSRF_PROTECT = False  # 初期关闭，上线前评估开启
    JWT_ACCESS_COOKIE_PATH = "/"     # 整站子路径共享

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3001")
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-secret"
    JWT_COOKIE_SECURE = False
