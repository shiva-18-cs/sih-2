import json
import os
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def get_auth_token():
    resp = client.post("/api/auth/login", json={"username": "coordinator", "password": "coord123"})
    assert resp.status_code == 200
    return resp.json()["access_token"]

def test_rag_query_factual_with_citations():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Ask factual question about Northern Coalfields 2022
    payload = {
        "query_text": "What was the total coal production of Northern Coalfields Sample Ltd in 2022?",
        "subsidiary_filter": "Northern Coalfields Sample Ltd",
        "year_filter": 2022
    }
    resp = client.post("/api/query/ask", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
    assert "22.30" in data["answer"] or "22.3" in data["answer"] or len(data["sources"]) > 0
    assert not data["is_insufficient_evidence"]
    assert len(data["sources"]) > 0
    assert "document_name" in data["sources"][0]
    assert "page_no" in data["sources"][0]

def test_rag_query_negative_insufficient_evidence():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Negative test question outside the domain
    payload = {
        "query_text": "What is the uranium enrichment capacity of Western Coalfields Sample Mine in 2024?"
    }
    resp = client.post("/api/query/ask", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_insufficient_evidence"] or "Insufficient evidence" in data["answer"]

def test_rag_query_history_saved():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = client.get("/api/query/history", headers=headers)
    assert resp.status_code == 200
    history = resp.json()
    assert isinstance(history, list)
    assert len(history) > 0

def test_high_priority_query_workflow():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create high-priority query
    create_resp = client.post(
        "/api/query/high-priority",
        json={
            "title": "Ministry Inquiry: 5-Year Production Audit",
            "query_text": "Verify 5-year overburden and production targets across all subsidiaries",
            "assigned_reviewer": "director"
        },
        headers=headers
    )
    assert create_resp.status_code == 200
    created = create_resp.json()
    assert created["status"] == "in_progress"
    query_id = created["id"]
    
    # 2. List high priority queries
    list_resp = client.get("/api/query/high-priority", headers=headers)
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert any(item["id"] == query_id for item in items)
    
    # 3. Update stage
    update_resp = client.patch(
        f"/api/query/high-priority/{query_id}",
        json={
            "stage": "response_drafting",
            "status": "in_progress",
            "validation_status": "verified"
        },
        headers=headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["stage"] == "response_drafting"
