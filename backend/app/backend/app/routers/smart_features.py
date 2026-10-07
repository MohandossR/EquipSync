from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

# Note: These imports assume Mohandoss uses standard naming for models[cite: 5, 7].
# Mohandoss will adjust these specific import paths during integration if needed.
from app.database import get_db
from app.models import ServiceRequest, Technician

from app.services.scoring import evaluate_technician
from app.services.sla_monitor import calculate_sla_status, detect_request_exceptions

router = APIRouter(tags=["Smart Operations"])

@router.get("/api/technicians/recommended/{request_id}", status_code=status.HTTP_200_OK)
def get_technician_recommendations(request_id: int, db: Session = Depends(get_db)):
    """
    Returns a ranked list of technicians based on skill, location, availability, and workload[cite: 12].
    """
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail=f"Service request {request_id} not found")
        
    technicians = db.query(Technician).filter(Technician.is_active == True).all()
    
    # Safely extract requested skills
    request_skills = set()
    if hasattr(request, 'required_skills'):
        request_skills = {skill.name for skill in request.required_skills}
    
    site_lat = request.site.lat if hasattr(request, 'site') else None
    site_lon = request.site.lon if hasattr(request, 'site') else None
    
    recommendations = []
    for tech in technicians:
        score_data = evaluate_technician(
            technician=tech,
            request_skills=request_skills,
            site_lat=site_lat,
            site_lon=site_lon
        )
        
        # Filter out those with absolutely zero skill match
        if score_data["breakdown"]["skill_match"] > 0:
            recommendations.append(score_data)
            
    recommendations.sort(key=lambda x: x["total_score"], reverse=True)
    
    return {"request_id": request_id, "recommendations": recommendations}

@router.post("/api/assignments/reassign", status_code=status.HTTP_200_OK)
def trigger_reassignment(request_id: int, dropped_technician_id: int, db: Session = Depends(get_db)):
    """
    Handles technician dropout by returning the next best alternative[cite: 12].
    """
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    # Mark as dropped out
    request.assignment_status = "DROPPED_OUT"
    db.commit()
    
    # Get all recommendations and filter out the one who dropped out
    all_recommendations = get_technician_recommendations(request_id, db)["recommendations"]
    valid_alternatives = [rec for rec in all_recommendations if rec["technician_id"] != dropped_technician_id]
    
    if not valid_alternatives:
        raise HTTPException(status_code=400, detail="No alternative qualified technicians available.")
        
    return {
        "message": "Reassignment required due to technician dropout.",
        "previous_technician_id": dropped_technician_id,
        "recommended_reassignment": valid_alternatives[0]
    }
