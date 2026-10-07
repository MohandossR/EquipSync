from math import radians, sin, cos, sqrt, atan2
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.dependencies import get_current_user, require_roles

from app.models.service_request import ServiceRequest
from app.models.technician import Technician
from app.models.technician_skill import TechnicianSkill
from app.models.service_request_assignment import ServiceRequestAssignment
from app.models.service_request_status_history import ServiceRequestStatusHistory
from app.models.notification import Notification


router = APIRouter(prefix="/api/smart", tags=["Smart Dispatch"])


def haversine(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return 999999

    R = 6371

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def calculate_score(technician, request):
    machine = request.machine
    site = machine.site

    distance = haversine(
        site.latitude,
        site.longitude,
        technician.current_latitude,
        technician.current_longitude,
    )

    # Skill match
    skill_match = False

    if request.required_skill:
        skill_match = any(
            ts.skill
            and ts.skill.name.lower() == request.required_skill.lower()
            for ts in technician.skills
        )

    skill_score = 40 if skill_match else 0

    # Distance score
    if distance <= 10:
        distance_score = 30
    elif distance <= 25:
        distance_score = 25
    elif distance <= 50:
        distance_score = 15
    elif distance <= 100:
        distance_score = 5
    else:
        distance_score = 0

    # Availability
    availability_score = (
        20 if technician.availability_status == "AVAILABLE" else 0
    )

    # Workload
    workload_score = max(0, 10 - (technician.workload or 0) * 2)

    total = (
        skill_score
        + distance_score
        + availability_score
        + workload_score
    )

    return {
        "technician_id": technician.id,
        "employee_code": technician.employee_code,
        "name": technician.user.full_name,
        "availability": technician.availability_status,
        "workload": technician.workload,
        "distance_km": round(distance, 2),
        "skill_match": skill_match,
        "skill_score": skill_score,
        "distance_score": distance_score,
        "availability_score": availability_score,
        "workload_score": workload_score,
        "total_score": total,
    }


@router.get(
    "/technicians/{request_id}/ranking",
    dependencies=[Depends(require_roles("ADMIN", "OPERATIONS_MANAGER"))],
)
def technician_ranking(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    request = (
        db.query(ServiceRequest)
        .filter(ServiceRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(404, "Service request not found")

    technicians = (
        db.query(Technician)
        .filter(
            Technician.is_active == True,
            Technician.availability_status == "AVAILABLE",
        )
        .all()
    )

    ranked = []

    for technician in technicians:
        result = calculate_score(technician, request)

        # Required skill is mandatory for this job.
        if request.required_skill and not result["skill_match"]:
            continue

        ranked.append(result)

    ranked.sort(
        key=lambda x: x["total_score"],
        reverse=True,
    )

    return {
        "request_id": request.id,
        "request_code": request.request_code,
        "candidates": ranked,
        "best_match": ranked[0] if ranked else None,
    }


@router.post(
    "/technicians/{request_id}/auto-assign",
    dependencies=[Depends(require_roles("ADMIN", "OPERATIONS_MANAGER"))],
)
def auto_assign(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    request = (
        db.query(ServiceRequest)
        .filter(ServiceRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(404, "Service request not found")

    if request.status not in ["APPROVED", "REASSIGNMENT_REQUIRED"]:
        raise HTTPException(
            409,
            f"Request cannot be auto-assigned from {request.status}",
        )

    technicians = (
        db.query(Technician)
        .filter(
            Technician.is_active == True,
            Technician.availability_status == "AVAILABLE",
        )
        .all()
    )

    ranked = []

    for technician in technicians:
        result = calculate_score(technician, request)

        if request.required_skill and not result["skill_match"]:
            continue

        ranked.append((result, technician))

    ranked.sort(
        key=lambda x: x[0]["total_score"],
        reverse=True,
    )

    if not ranked:
        raise HTTPException(
            409,
            "No suitable technician available",
        )

    result, technician = ranked[0]

    assignment = ServiceRequestAssignment(
        service_request_id=request.id,
        technician_id=technician.id,
        status="ASSIGNED",
        assigned_at=datetime.utcnow(),
    )

    db.add(assignment)

    request.status = "ASSIGNED"

    technician.availability_status = "BUSY"
    technician.workload = (technician.workload or 0) + 1

    db.add(
        ServiceRequestStatusHistory(
            service_request_id=request.id,
            old_status=request.status,
            new_status="ASSIGNED",
            changed_by=current_user.id,
            reason=f"Auto-assigned to {technician.user.full_name}",
        )
    )

    db.add(
        Notification(
            user_id=technician.user_id,
            service_request_id=request.id,
            title="New Service Assignment",
            message=(
                f"You have been assigned {request.request_code}. "
                f"Score: {result['total_score']}"
            ),
            notification_type="ASSIGNMENT",
            is_read=False,
        )
    )

    db.commit()
    db.refresh(assignment)

    return {
        "message": "Technician automatically assigned",
        "assignment_id": assignment.id,
        "request_id": request.id,
        "technician": result,
    }