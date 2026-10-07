from datetime import datetime, timezone
from typing import List, Dict, Any

def calculate_sla_status(created_at: datetime, sla_hours: int) -> Dict[str, Any]:
    """
    Calculates the SLA deadline and categorizes the state as SAFE, AT_RISK, or BREACHED.
    """
    now = datetime.now(timezone.utc)
    
    # Ensure created_at is timezone aware
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
        
    deadline_timestamp = created_at.timestamp() + (sla_hours * 3600)
    time_remaining_seconds = deadline_timestamp - now.timestamp()
    total_sla_seconds = sla_hours * 3600
    
    status = "SAFE"[cite: 12]
    if time_remaining_seconds <= 0:
        status = "BREACHED"[cite: 12]
    elif time_remaining_seconds < (total_sla_seconds * 0.25):
        status = "AT_RISK"[cite: 12]
        
    return {
        "status": status,
        "deadline_timestamp": deadline_timestamp,
        "hours_remaining": round(time_remaining_seconds / 3600, 2) if time_remaining_seconds > 0 else 0
    }

def detect_request_exceptions(request: Any, required_parts: List[Any]) -> List[str]:
    """
    Scans a service request and associated parts to flag operational exceptions.
    """
    exceptions = []
    
    # 1. SLA Exception[cite: 12]
    sla_info = calculate_sla_status(request.created_at, request.sla_hours)
    if sla_info["status"] == "BREACHED":
        exceptions.append("SLA_BREACHED")
        
    # 2. Technician Dropout[cite: 12]
    if getattr(request, 'assignment_status', None) == "DROPPED_OUT":
        exceptions.append("REASSIGNMENT_REQUIRED")
        
    # 3. Part Unavailability[cite: 12]
    for part in required_parts:
        if getattr(part, 'inventory_count', 0) < getattr(part, 'required_qty', 1):
            exceptions.append("PART_UNAVAILABLE")
            
    return exceptions
