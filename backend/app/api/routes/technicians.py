from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.technician import Technician
from app.models.skill import Skill
from app.models.technician_skill import TechnicianSkill
from app.models.service_request import ServiceRequest
from app.models.service_request_assignment import ServiceRequestAssignment
from app.models.service_request_status_history import ServiceRequestStatusHistory


router = APIRouter(
    prefix="/api/technicians",
    tags=["Technicians"],
)


def calculate_score(
    technician: Technician,
    skill_match: bool,
) -> int:
    score = 0

    # Available technicians get the highest base score.
    if technician.availability_status == "AVAILABLE":
        score += 100

    # Skill match is highly important.
    if skill_match:
        score += 50

    # Prefer technicians with lower workload.
    score += max(0, 20 - (technician.workload * 5))

    return score


@router.get("/candidates/{request_id}")
def get_technician_candidates(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request = (
        db.query(ServiceRequest)
        .filter(ServiceRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Service request not found",
        )

    technicians = (
        db.query(Technician)
        .filter(
            Technician.is_active == True,
            Technician.availability_status == "AVAILABLE",
        )
        .all()
    )

    candidates = []

    for technician in technicians:
        skill_match = False

        if request.required_skill:
            skill = (
                db.query(Skill)
                .filter(Skill.name == request.required_skill)
                .first()
            )

            if skill:
                technician_skill = (
                    db.query(TechnicianSkill)
                    .filter(
                        TechnicianSkill.technician_id == technician.id,
                        TechnicianSkill.skill_id == skill.id,
                    )
                    .first()
                )

                skill_match = technician_skill is not None

        score = calculate_score(
            technician,
            skill_match,
        )

        candidates.append(
            {
                "technician_id": technician.id,
                "employee_code": technician.employee_code,
                "availability_status": technician.availability_status,
                "workload": technician.workload,
                "skill_match": skill_match,
                "score": score,
            }
        )

    candidates.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return candidates


@router.post("/assign/{request_id}/{technician_id}")
def assign_technician(
    request_id: int,
    technician_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request = (
        db.query(ServiceRequest)
        .filter(ServiceRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Service request not found",
        )

    if request.status != "APPROVED":
        raise HTTPException(
            status_code=409,
            detail="Only APPROVED requests can be assigned",
        )

    technician = (
        db.query(Technician)
        .filter(
            Technician.id == technician_id,
            Technician.is_active == True,
        )
        .first()
    )

    if not technician:
        raise HTTPException(
            status_code=404,
            detail="Technician not found",
        )

    if technician.availability_status != "AVAILABLE":
        raise HTTPException(
            status_code=409,
            detail="Technician is not available",
        )

    existing_assignment = (
        db.query(ServiceRequestAssignment)
        .filter(
            ServiceRequestAssignment.service_request_id == request_id,
            ServiceRequestAssignment.status.in_(
                ["ASSIGNED", "ACCEPTED"]
            ),
        )
        .first()
    )

    if existing_assignment:
        raise HTTPException(
            status_code=409,
            detail="Service request already has an active assignment",
        )

    assignment = ServiceRequestAssignment(
        service_request_id=request.id,
        technician_id=technician.id,
        status="ASSIGNED",
        assigned_at=datetime.utcnow(),
    )

    old_status = request.status

    request.status = "ASSIGNED"

    technician.availability_status = "BUSY"
    technician.workload = technician.workload + 1

    history = ServiceRequestStatusHistory(
        service_request_id=request.id,
        old_status=old_status,
        new_status="ASSIGNED",
        changed_by=current_user.id,
        remarks=f"Assigned to technician {technician.employee_code}",
    )

    db.add(assignment)
    db.add(history)

    db.commit()

    db.refresh(assignment)
    db.refresh(request)
    db.refresh(technician)

    return {
        "message": "Technician assigned successfully",
        "request_id": request.id,
        "request_status": request.status,
        "technician_id": technician.id,
        "employee_code": technician.employee_code,
        "assignment_id": assignment.id,
        "technician_status": technician.availability_status,
        "workload": technician.workload,
    }


@router.get("/me/jobs")
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    technician = (
        db.query(Technician)
        .filter(Technician.user_id == current_user.id)
        .first()
    )

    if not technician:
        raise HTTPException(
            status_code=404,
            detail="Technician profile not found for current user",
        )

    assignments = (
        db.query(ServiceRequestAssignment)
        .filter(
            ServiceRequestAssignment.technician_id == technician.id,
            ServiceRequestAssignment.status.in_(
                ["ASSIGNED", "ACCEPTED"]
            ),
        )
        .all()
    )

    jobs = []

    for assignment in assignments:
        request = (
            db.query(ServiceRequest)
            .filter(
                ServiceRequest.id == assignment.service_request_id
            )
            .first()
        )

        if not request:
            continue

        jobs.append(
            {
                "id": request.id,
                "request_code": request.request_code,
                "title": request.title,
                "description": request.description,
                "machine_id": request.machine_id,
                "priority": request.priority,
                "required_skill": request.required_skill,
                "sla_deadline": request.sla_deadline,
                "status": request.status,
                "assignment_id": assignment.id,
                "assigned_at": assignment.assigned_at,
                "assignment_status": assignment.status,
            }
        )

    return jobs

@router.put("/jobs/{request_id}/status")
def update_job_status(
    request_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    technician = (
        db.query(Technician)
        .filter(Technician.user_id == current_user.id)
        .first()
    )

    if not technician:
        raise HTTPException(
            status_code=404,
            detail="Technician profile not found",
        )

    request = (
        db.query(ServiceRequest)
        .filter(ServiceRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Service request not found",
        )

    assignment = (
        db.query(ServiceRequestAssignment)
        .filter(
            ServiceRequestAssignment.service_request_id == request.id,
            ServiceRequestAssignment.technician_id == technician.id,
            ServiceRequestAssignment.status.in_(
                ["ASSIGNED", "ACCEPTED"]
            ),
        )
        .order_by(
            ServiceRequestAssignment.assigned_at.desc()
        )
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=403,
            detail="You are not assigned to this service request",
        )

    allowed_statuses = [
        "TRAVELLING",
        "IN_PROGRESS",
        "COMPLETED",
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. Allowed values: "
                "TRAVELLING, IN_PROGRESS, COMPLETED"
            ),
        )

    old_status = request.status

    request.status = status

    # When technician completes the job,
    # close the assignment and make technician available again.
    if status == "COMPLETED":

        assignment.status = "COMPLETED"
        assignment.completed_at = datetime.utcnow()

        technician.availability_status = "AVAILABLE"

        technician.workload = max(
            0,
            (technician.workload or 0) - 1
        )

    history = ServiceRequestStatusHistory(
        service_request_id=request.id,
        old_status=old_status,
        new_status=status,
        changed_by=current_user.id,
        remarks=f"Technician updated job status to {status}",
    )

    db.add(history)

    db.commit()

    db.refresh(request)
    db.refresh(assignment)
    db.refresh(technician)

    return {
        "message": "Job status updated successfully",
        "request_id": request.id,
        "request_code": request.request_code,
        "status": request.status,
        "assignment_status": assignment.status,
        "technician_status": technician.availability_status,
        "workload": technician.workload,
    }