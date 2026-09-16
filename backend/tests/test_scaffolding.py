from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "locked_tech_stack" in data
    assert data["locked_tech_stack"]["backend"] == "FastAPI (Python 3.11+)"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "CMPDI" in response.json()["message"]

def test_auth_login_admin():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "Administrator"

def test_auth_login_all_5_roles():
    roles_creds = [
        ("admin", "admin123", "Administrator"),
        ("coordinator", "coord123", "Project Coordinator"),
        ("director", "direct123", "Director/Senior Officer"),
        ("agency", "agency123", "Implementation Agency"),
        ("auditor", "audit123", "Auditor"),
    ]
    for username, password, expected_role in roles_creds:
        resp = client.post("/api/auth/login", json={"username": username, "password": password})
        assert resp.status_code == 200, f"Login failed for {username}"
        assert resp.json()["role"] == expected_role
