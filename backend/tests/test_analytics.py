from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(username="admin", password="admin123"):
    resp = client.post("/api/auth/login", json={"username": username, "password": password})
    assert resp.status_code == 200
    return resp.json()["access_token"]

def test_dashboard_statistics():
    token = get_token("admin", "admin123")
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = client.get("/api/analytics/dashboard", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    
    assert "ingestion" in data
    assert data["ingestion"]["total_documents"] >= 20
    assert "conflicts" in data
    assert "reports" in data
    assert "queries" in data
    assert "breakdowns" in data
    assert "by_subsidiary" in data["breakdowns"]

def test_production_trends_data():
    token = get_token("coordinator", "coord123")
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = client.get("/api/analytics/production-trends?subsidiary=Northern Coalfields Sample Ltd", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "trend_data" in data
    assert len(data["trend_data"]) > 0

def test_topics_word_frequency():
    token = get_token("coordinator", "coord123")
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = client.get("/api/query/topics", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "words" in data
    assert len(data["words"]) > 0
    first_word = data["words"][0]
    assert "word" in first_word
    assert "count" in first_word

def test_audit_trail_immutable_log():
    token = get_token("auditor", "audit123")
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = client.get("/api/analytics/audit-trail", headers=headers)
    assert resp.status_code == 200
    logs = resp.json()
    assert isinstance(logs, list)
    assert len(logs) > 0
    assert all("action" in log and "username" in log for log in logs)
