from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.api.dependencies import get_current_user

from app.models.user import User
from app.models.service_request import ServiceRequest
from app.models.service_request_status_history import ServiceRequestStatusHistory


router = APIRouter(
    prefix="/api/verification",
    tags=["Verification"],
)


@router.post("/{request_id}/verify")
def verify_service_request(
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

    if request.status != "VERIFICATION_PENDING":
        raise HTTPException(
            status_code=409,
            detail="Only requests pending verification can be verified",
        )

    old_status = request.status

    request.status = "VERIFIED"

    history = ServiceRequestStatusHistory(
        service_request_id=request.id,
        old_status=old_status,
        new_status="VERIFIED",
        changed_by=current_user.id,
        remarks="Service completion verified by operations",
        changed_at=datetime.utcnow(),
    )

    db.add(history)
    db.commit()
    db.refresh(request)

    return {
        "message": "Service request verified successfully",
        "request_id": request.id,
        "status": request.status,
    }


@router.post("/{request_id}/close")
def close_service_request(
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

    if request.status != "VERIFIED":
        raise HTTPException(
            status_code=409,
            detail="Only verified requests can be closed",
        )

    old_status = request.status

    request.status = "CLOSED"

    history = ServiceRequestStatusHistory(
        service_request_id=request.id,
        old_status=old_status,
        new_status="CLOSED",
        changed_by=current_user.id,
        remarks="Service request closed successfully",
        changed_at=datetime.utcnow(),
    )

    db.add(history)
    db.commit()
    db.refresh(request)

    return {
        "message": "Service request closed successfully",
        "request_id": request.id,
        "status": request.status,
    }