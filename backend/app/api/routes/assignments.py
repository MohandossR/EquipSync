from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.dependencies import get_current_user
from app.models.service_request_assignment import ServiceRequestAssignment
from app.models.service_request import ServiceRequest
from app.models.technician import Technician
from app.models.service_request_status_history import ServiceRequestStatusHistory
from app.models.notification import Notification


router = APIRouter(prefix="/api/assignments", tags=["Assignments"])


class RejectRequest(BaseModel):
    reason: str = "Technician rejected the assignment"


@router.post("/{assignment_id}/accept")
def accept_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    assignment = (
        db.query(ServiceRequestAssignment)
        .filter(ServiceRequestAssignment.id == assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(404, "Assignment not found")

    technician = (
        db.query(Technician)
        .filter(Technician.id == assignment.technician_id)
        .first()
    )

    if not technician or technician.user_id != current_user.id:
        raise HTTPException(403, "This assignment does not belong to you")

    if assignment.status != "ASSIGNED":
        raise HTTPException(
            409,
            f"Assignment is already {assignment.status}",
        )

    request = assignment.service_request

    assignment.status = "ACCEPTED"
    assignment.accepted_at = datetime.utcnow()

    old_status = request.status
    request.status = "ACCEPTED"

    db.add(
        ServiceRequestStatusHistory(
            service_request_id=request.id,
            old_status=old_status,
            new_status="ACCEPTED",
            changed_by=current_user.id,
            reason="Technician accepted assignment",
        )
    )

    db.add(
        Notification(
            user_id=request.requested_by,
            service_request_id=request.id,
            title="Technician Accepted",
            message=f"Technician accepted {request.request_code}.",
            notification_type="ASSIGNMENT_ACCEPTED",
            is_read=False,
        )
    )

    db.commit()

    return {
        "message": "Assignment accepted",
        "assignment_id": assignment.id,
        "request_id": request.id,
        "status": "ACCEPTED",
    }


@router.post("/{assignment_id}/reject")
def reject_assignment(
    assignment_id: int,
    payload: RejectRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    assignment = (
        db.query(ServiceRequestAssignment)
        .filter(ServiceRequestAssignment.id == assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(404, "Assignment not found")

    technician = (
        db.query(Technician)
        .filter(Technician.id == assignment.technician_id)
        .first()
    )

    if not technician or technician.user_id != current_user.id:
        raise HTTPException(
            403,
            "This assignment does not belong to you",
        )

    if assignment.status != "ASSIGNED":
        raise HTTPException(
            409,
            f"Assignment is already {assignment.status}",
        )

    request = assignment.service_request

    # Reject current assignment
    assignment.status = "REJECTED"

    # Free current technician
    technician.availability_status = "AVAILABLE"
    technician.workload = max(
        0,
        (technician.workload or 0) - 1
    )

    # Find another available technician
    technicians = (
        db.query(Technician)
        .filter(
            Technician.id != technician.id,
            Technician.is_active == True,
            Technician.availability_status == "AVAILABLE",
        )
        .all()
    )

    # Basic smart fallback:
    # prefer lowest workload.
    technicians.sort(
        key=lambda t: t.workload or 0
    )

    new_technician = (
        technicians[0]
        if technicians
        else None
    )

    old_status = request.status

    if new_technician:

        # Automatically reassign
        new_assignment = ServiceRequestAssignment(
            service_request_id=request.id,
            technician_id=new_technician.id,
            status="ASSIGNED",
            assigned_at=datetime.utcnow(),
        )

        request.status = "ASSIGNED"

        new_technician.availability_status = "BUSY"
        new_technician.workload = (
            (new_technician.workload or 0) + 1
        )

        db.add(new_assignment)

        db.add(
            Notification(
                user_id=new_technician.user_id,
                service_request_id=request.id,
                title="New Service Assignment",
                message=(
                    f"You have been automatically assigned "
                    f"{request.request_code} after another "
                    f"technician rejected the job."
                ),
                notification_type="REASSIGNMENT",
                is_read=False,
            )
        )

        db.add(
            ServiceRequestStatusHistory(
                service_request_id=request.id,
                old_status=old_status,
                new_status="ASSIGNED",
                changed_by=current_user.id,
                remarks=(
                    f"Automatic reassignment to "
                    f"{new_technician.employee_code}. "
                    f"Previous technician rejected: "
                    f"{payload.reason}"
                ),
            )
        )

        message = (
            f"Assignment rejected and automatically "
            f"reassigned to {new_technician.user.full_name}."
        )

    else:

        # Nobody available
        request.status = "REASSIGNMENT_REQUIRED"

        db.add(
            ServiceRequestStatusHistory(
                service_request_id=request.id,
                old_status=old_status,
                new_status="REASSIGNMENT_REQUIRED",
                changed_by=current_user.id,
                remarks=payload.reason,
            )
        )

        message = (
            "Assignment rejected. No other technician "
            "is currently available."
        )

    # Notify customer
    db.add(
        Notification(
            user_id=request.requested_by,
            service_request_id=request.id,
            title="Technician Assignment Updated",
            message=message,
            notification_type="ASSIGNMENT_REJECTED",
            is_read=False,
        )
    )

    db.commit()

    return {
        "message": message,
        "request_id": request.id,
        "request_status": request.status,
        "reassigned": new_technician is not None,
        "new_technician_id": (
            new_technician.id
            if new_technician
            else None
        ),
        "reason": payload.reason,
    }