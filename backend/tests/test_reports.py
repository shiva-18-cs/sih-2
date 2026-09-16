import os
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.user import AuditLog

client = TestClient(app)

def get_token(username="coordinator", password="coord123"):
    resp = client.post("/api/auth/login", json={"username": username, "password": password})
    assert resp.status_code == 200
    return resp.json()["access_token"]

def test_generate_production_summary_report():
    token = get_token("coordinator", "coord123")
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "report_type": "production_summary",
        "subsidiary": "Northern Coalfields Sample Ltd",
        "year": 2024
    }
    resp = client.post("/api/reports/generate", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "report_id" in data
    assert "content" in data
    assert "Northern Coalfields" in data["title"]
    assert data["status"] in ["draft", "pending_approval"]
    
    report_id = data["report_id"]
    
    # 2. Get report detail
    detail_resp = client.get(f"/api/reports/{report_id}", headers=headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == report_id
    assert "content" in detail

def test_report_approval_workflow_rbac():
    coord_token = get_token("coordinator", "coord123")
    director_token = get_token("director", "direct123")
    
    # Coordinator generates report
    gen_resp = client.post(
        "/api/reports/generate",
        json={"report_type": "geological_summary", "subsidiary": "Eastern Mining Sample Ltd"},
        headers={"Authorization": f"Bearer {coord_token}"}
    )
    assert gen_resp.status_code == 200
    report_id = gen_resp.json()["report_id"]
    
    # Coordinator submits for approval
    submit_resp = client.patch(
        f"/api/reports/{report_id}/approval",
        json={"action": "submit_for_approval"},
        headers={"Authorization": f"Bearer {coord_token}"}
    )
    assert submit_resp.status_code == 200
    assert submit_resp.json()["status"] == "pending_approval"
    
    # Coordinator cannot approve (RBAC check -> 403)
    coord_approve = client.patch(
        f"/api/reports/{report_id}/approval",
        json={"action": "approve", "reviewer_notes": "Attempted by coordinator"},
        headers={"Authorization": f"Bearer {coord_token}"}
    )
    assert coord_approve.status_code == 403
    
    # Director approves
    director_approve = client.patch(
        f"/api/reports/{report_id}/approval",
        json={"action": "approve", "reviewer_notes": "Reviewed and approved for CIL HQ submission."},
        headers={"Authorization": f"Bearer {director_token}"}
    )
    assert director_approve.status_code == 200
    assert director_approve.json()["status"] == "approved"
    assert director_approve.json()["approved_by"] == "director"
