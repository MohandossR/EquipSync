import math
from typing import Set, Dict, Any

# Required scoring weights
WEIGHT_SKILL = 0.40
WEIGHT_DISTANCE = 0.30
WEIGHT_AVAILABILITY = 0.20
WEIGHT_WORKLOAD = 0.10

MAX_DISTANCE_KM = 100.0  # Distance threshold where score becomes 0
MAX_DAILY_JOBS = 5       # Workload threshold where score becomes 0

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the great-circle distance between two points in kilometers."""
    if None in (lat1, lon1, lat2, lon2):
        return float('inf') 

    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2)**2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def evaluate_technician(technician: Any, request_skills: Set[str], site_lat: float, site_lon: float) -> Dict[str, Any]:
    """
    Evaluates a technician against a service request and returns a detailed scoring breakdown.
    """
    # 1. Skill Match (40%)
    tech_skills = set(technician.skills) if hasattr(technician, 'skills') and technician.skills else set()
    if not request_skills:
        skill_score = 1.0 
    else:
        matched_skills = tech_skills.intersection(request_skills)
        skill_score = len(matched_skills) / len(request_skills)
    
    # 2. Distance Score (30%)[cite: 12]
    distance = calculate_haversine_distance(site_lat, site_lon, getattr(technician, 'lat', None), getattr(technician, 'lon', None))
    if distance == float('inf'):
        distance_score = 0.0
    else:
        distance_score = max(0.0, 1.0 - (distance / MAX_DISTANCE_KM))
    
    # 3. Availability Score (20%)[cite: 12]
    availability_score = 1.0 if getattr(technician, 'is_available', False) else 0.0
    
    # 4. Workload Score (10%)[cite: 12]
    active_jobs = getattr(technician, 'active_jobs', 0)
    workload_score = max(0.0, 1.0 - (active_jobs / MAX_DAILY_JOBS))
    
    # Calculate weighted total[cite: 12]
    total_score = (
        (skill_score * WEIGHT_SKILL) + 
        (distance_score * WEIGHT_DISTANCE) + 
        (availability_score * WEIGHT_AVAILABILITY) + 
        (workload_score * WEIGHT_WORKLOAD)
    )
                  
    # Generate explainable reasoning[cite: 12]
    reasons = []
    if skill_score == 1.0: reasons.append("Perfect Skill Match")
    if distance < 15.0: reasons.append(f"Nearby ({distance:.1f}km)")
    if workload_score > 0.8: reasons.append("Light workload")
    if availability_score == 0: reasons.append("Currently Unavailable")
    
    return {
        "technician_id": technician.id,
        "name": technician.name,
        "total_score": round(total_score, 2),
        "distance_km": round(distance, 1) if distance != float('inf') else None,
        "reasoning": " | ".join(reasons) if reasons else "Partial match",
        "breakdown": {
            "skill_match": round(skill_score * WEIGHT_SKILL, 2),
            "distance": round(distance_score * WEIGHT_DISTANCE, 2),
            "availability": round(availability_score * WEIGHT_AVAILABILITY, 2),
            "workload": round(workload_score * WEIGHT_WORKLOAD, 2)
        }
    }
