import pytest
from datetime import datetime, timedelta, timezone
from app.services.scoring import evaluate_technician
from app.services.sla_monitor import calculate_sla_status

class MockTechnician:
    def __init__(self, id, name, skills, lat, lon, is_available, active_jobs):
        self.id = id
        self.name = name
        self.skills = skills
        self.lat = lat
        self.lon = lon
        self.is_available = is_available
        self.active_jobs = active_jobs

def test_perfect_technician_score():
    """Test standard scoring rules[cite: 12]"""
    tech = MockTechnician(
        id=1, name="John Doe", 
        skills=["Hydraulics", "Electrical"], 
        lat=13.0827, lon=80.2707, 
        is_available=True, active_jobs=0
    )
    request_skills = {"Hydraulics"}
    
    result = evaluate_technician(tech, request_skills, site_lat=13.0827, site_lon=80.2707)
    
    assert result["total_score"] == 1.0 
    assert result["breakdown"]["skill_match"] == 0.40
    assert result["breakdown"]["distance"] == 0.30

def test_sla_breached_condition():
    """Test SLA BREACHED state[cite: 12]"""
    created_at = datetime.now(timezone.utc) - timedelta(hours=5)
    sla_hours = 4
    result = calculate_sla_status(created_at, sla_hours)
    
    assert result["status"] == "BREACHED"
    assert result["hours_remaining"] == 0

def test_sla_safe_condition():
    """Test SLA SAFE state[cite: 12]"""
    created_at = datetime.now(timezone.utc) - timedelta(hours=1)
    sla_hours = 10
    result = calculate_sla_status(created_at, sla_hours)
    
    assert result["status"] == "SAFE"
    assert result["hours_remaining"] > 2.5
