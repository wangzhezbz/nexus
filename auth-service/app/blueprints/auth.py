import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, get_jwt,
    set_access_cookies, unset_jwt_cookies,
)

from ..extensions import db
from ..models import User
from ..errors import ApiError

auth_bp = Blueprint("auth", __name__)
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _issue(user: User):
    """签发 JWT：identity=用户ID，附带 email/role 供各产品读取。"""
    return create_access_token(
        identity=str(user.id),
        additional_claims={"email": user.email, "role": user.role},
    )


def _auth_response(user: User, status: int = 200):
    """返回用户信息 + 把 JWT 写进 Cookie（实现跨子路径 SSO）。"""
    token = _issue(user)
    resp = jsonify({"user": user.public(), "access_token": token})
    set_access_cookies(resp, token)  # 浏览器据此在整站共享登录态
    return resp, status


@auth_bp.post("/auth/api/register")
def register():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    if not EMAIL_RE.match(email):
        raise ApiError("invalid email", 400)
    if len(password) < 6:
        raise ApiError("password must be at least 6 chars", 400)
    if User.query.filter_by(email=email).first():
        raise ApiError("email already registered", 400)

    user = User(email=email, role="user")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return _auth_response(user, 201)


@auth_bp.post("/auth/api/login")
def login():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        raise ApiError("invalid credentials", 401)
    return _auth_response(user, 200)


@auth_bp.post("/auth/api/logout")
def logout():
    resp = jsonify({"ok": True})
    unset_jwt_cookies(resp)
    return resp


@auth_bp.get("/auth/api/me")
@jwt_required()
def me():
    claims = get_jwt()
    return jsonify({
        "user": {
            "id": int(get_jwt_identity()),
            "email": claims.get("email"),
            "role": claims.get("role"),
        }
    })


@auth_bp.post("/auth/api/refresh")
@jwt_required()
def refresh():
    """续签：用当前有效 JWT 换一个新的，刷新 Cookie。"""
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        raise ApiError("user not found", 404)
    return _auth_response(user, 200)
