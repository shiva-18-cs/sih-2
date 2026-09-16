import os
import json
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.entity import ConflictRecord, Entity
from app.models.user import AuditLog

client = TestClient(app)

def get_auth_token():
    login_resp = client.post("/api/auth/login", json={"username": "coordinator", "password": "coord123"})
    assert login_resp.status_code == 200
    return login_resp.json()["access_token"]

def test_validation_scan_detects_all_injected_conflicts():
    token = get_auth_token()
    
    # 1. Trigger validation scan with valid JWT token
    scan_resp = client.post("/api/validation/run-check", headers={"Authorization": f"Bearer {token}"})
    assert scan_resp.status_code == 200
    
    summary_resp = client.get("/api/validation/summary")
    assert summary_resp.status_code == 200
    data = summary_resp.json()
    
    # 2. Check that all 3 conflicts are flagged matching ground truth
    assert data["total_conflicts_flagged"] >= 3
    assert data["validation_detection_rate_pct"] == 100.0

def test_conflict_records_match_ground_truth_conflicts():
    # Load ground truth conflicts.json
    gt_path = os.path.join(settings.DATASET_DIR, "ground_truth", "conflicts.json")
    with open(gt_path, "r", encoding="utf-8") as f:
        gt_conflicts = json.load(f)
        
    gt_ids = {c["conflict_id"] for c in gt_conflicts}
    
    response = client.get("/api/validation/conflicts")
    assert response.status_code == 200
    conflicts = response.json()
    
    detected_ids = {c["conflict_id"] for c in conflicts if c["conflict_id"]}
    # Verify all ground truth conflict IDs (CONF-001, CONF-002, CONF-003) exist
    for gid in gt_ids:
        assert gid in detected_ids, f"Expected conflict {gid} was not detected!"

def test_resolve_conflict_with_audit_trail():
    token = get_auth_token()
    
    # Get first conflict
    conf_list = client.get("/api/validation/conflicts").json()
    assert len(conf_list) > 0
    target_conf = conf_list[0]
    
    # Resolve
    resolve_resp = client.post(
        f"/api/validation/conflicts/{target_conf['id']}/resolve",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "resolved_value": target_conf["source_a_value"],
            "resolution_notes": "Adopted audited Annual Production Report as authoritative."
        }
    )
    assert resolve_resp.status_code == 200
    resolved_data = resolve_resp.json()
    assert resolved_data["status"] == "resolved"
    assert resolved_data["resolved_value"] == target_conf["source_a_value"]
    
    # Check AuditLog
    with SessionLocal() as db:
        audit_entry = db.query(AuditLog).filter(
            AuditLog.action == "CONFLICT_RESOLVED",
            AuditLog.resource_id == target_conf["id"]
        ).first()
        assert audit_entry is not None
        assert audit_entry.username == "coordinator"
        assert audit_entry.new_value["resolved_value"] == target_conf["source_a_value"]
