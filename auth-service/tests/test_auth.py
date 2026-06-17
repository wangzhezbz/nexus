def _reg(client, email="u@x.com", pw="secret123"):
    return client.post("/auth/api/register", json={"email": email, "password": pw})


def test_register_returns_user_and_sets_cookie(client):
    r = _reg(client)
    assert r.status_code == 201
    data = r.get_json()
    assert data["user"]["email"] == "u@x.com"
    assert data["user"]["role"] == "user"
    assert data["access_token"]
    # 登录态写进了 cookie（实现 SSO）
    assert any("access_token" in c for c in r.headers.getlist("Set-Cookie"))


def test_register_rejects_short_password(client):
    r = client.post("/auth/api/register", json={"email": "a@b.com", "password": "12"})
    assert r.status_code == 400


def test_register_rejects_duplicate(client):
    _reg(client, "dup@x.com")
    r = _reg(client, "dup@x.com")
    assert r.status_code == 400


def test_login_ok_and_wrong_password(client):
    _reg(client, "log@x.com", "secret123")
    ok = client.post("/auth/api/login", json={"email": "log@x.com", "password": "secret123"})
    assert ok.status_code == 200
    assert ok.get_json()["user"]["email"] == "log@x.com"
    bad = client.post("/auth/api/login", json={"email": "log@x.com", "password": "nope"})
    assert bad.status_code == 401


def test_me_requires_auth(client):
    assert client.get("/auth/api/me").status_code == 401


def test_me_returns_identity_from_token(client):
    r = _reg(client, "me@x.com")
    token = r.get_json()["access_token"]
    me = client.get("/auth/api/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    body = me.get_json()["user"]
    assert body["email"] == "me@x.com"
    assert body["role"] == "user"


def test_jwt_carries_role_claim(app, client):
    # admin 角色应体现在 JWT claim 里（产品后台据此校验）
    from app.extensions import db
    from app.models import User
    with app.app_context():
        u = User(email="admin@x.com", role="admin")
        u.set_password("secret123")
        db.session.add(u)
        db.session.commit()
    r = client.post("/auth/api/login", json={"email": "admin@x.com", "password": "secret123"})
    token = r.get_json()["access_token"]
    me = client.get("/auth/api/me", headers={"Authorization": f"Bearer {token}"})
    assert me.get_json()["user"]["role"] == "admin"


def test_logout_clears_cookie(client):
    _reg(client, "out@x.com")
    r = client.post("/auth/api/logout")
    assert r.status_code == 200
    # 退出会下发清除 cookie 的 Set-Cookie
    assert r.headers.getlist("Set-Cookie")
