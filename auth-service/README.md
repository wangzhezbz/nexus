# auth-service · 中央认证服务

聚合平台的**唯一账号体系**。负责注册/登录/发 JWT，并把登录态写进 Cookie（域 `.shanhaiyouling.com`），
实现"登录一次、所有子产品通行"的单点登录（SSO）。各产品**不自建账号**，只校验本服务签发的 JWT。

部署路由：`shanhaiyouling.com/auth/...`（见平台规范 §7）。本地默认端口 5100。

## 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/auth/api/register` | 注册（email+password≥6），返回用户信息 + 写 Cookie |
| POST | `/auth/api/login` | 登录，返回用户信息 + 写 Cookie |
| POST | `/auth/api/logout` | 退出，清 Cookie |
| GET | `/auth/api/me` | 当前登录用户（需 JWT） |
| POST | `/auth/api/refresh` | 续签（需 JWT） |
| GET | `/auth/api/health` | 健康检查 |

JWT 载荷：`sub`=用户ID，`email`，`role`（`user`/`admin`/…）。

## 关键环境变量

```
JWT_SECRET=<全平台共享，所有产品后端必须一致>
COOKIE_DOMAIN=.shanhaiyouling.com     # 本地留空
COOKIE_SECURE=1                       # 生产=1(仅https)，本地=0
DATABASE_URL=mysql+pymysql://...      # 生产 MySQL；本地默认 sqlite
CORS_ORIGINS=https://shanhaiyouling.com
```

---

## 各产品如何校验登录（拷这段到你的 Flask 后端）

产品后端**不做登录**，只校验本服务签发的 JWT。三步：

### 1) 配置（与 auth-service 一致）
```python
# config.py
JWT_SECRET_KEY = os.environ["JWT_SECRET"]          # 必须和 auth-service 相同
JWT_TOKEN_LOCATION = ["cookies", "headers"]
JWT_COOKIE_DOMAIN = os.environ.get("COOKIE_DOMAIN") or None
JWT_ACCESS_COOKIE_PATH = "/"
JWT_COOKIE_CSRF_PROTECT = False
```

### 2) 初始化
```python
from flask_jwt_extended import JWTManager
jwt = JWTManager(app)
```

### 3) 保护接口 + 管理员校验
```python
from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

def current_user():
    claims = get_jwt()
    return {"id": int(get_jwt_identity()), "email": claims.get("email"),
            "role": claims.get("role")}

def admin_required(fn):
    """后台路由用：非管理员 403。"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*a, **k):
        if get_jwt().get("role") != "admin":
            return jsonify({"error": "admin only"}), 403
        return fn(*a, **k)
    return wrapper

# 前台接口：@jwt_required()      —— 登录即可
# 后台接口：@admin_required      —— 必须管理员
```

> 浏览器请求会自动带上 Cookie 里的 JWT；程序调用则带 `Authorization: Bearer <token>`。两种都支持。

## 设管理员

注册默认 `role=user`。把某人设为管理员（进各产品后台）：直接改库 `UPDATE users SET role='admin' WHERE email='...'`，
或后续在 auth-service 加一个受保护的"提升角色"接口（二期）。

## 本地启动 / 测试
```
pip install -r requirements.txt
python wsgi.py                      # http://localhost:5100
python -m pytest -q                 # 跑测试
```
