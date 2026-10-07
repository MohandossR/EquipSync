from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.api.dependencies import get_current_user

from app.models.user import User
from app.models.technician import Technician
from app.models.service_request import ServiceRequest
from app.models.service_report import ServiceReport


router = APIRouter(
    prefix="/api/service-reports",
    tags=["Service Reports"],
)


class ServiceReportCreate(BaseModel):
    work_summary: str
    findings: str
    recommendations: str


@router.post("/{request_id}")
def create_service_report(
    request_id: int,
    report_data: ServiceReportCreate,
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

    if request.status != "COMPLETED":
        raise HTTPException(
            status_code=409,
            detail="Service report can only be submitted for completed jobs",
        )

    technician = (
        db.query(Technician)
        .filter(
            Technician.user_id == current_user.id,
            Technician.is_active == True,
        )
        .first()
    )

    if not technician:
        raise HTTPException(
            status_code=404,
            detail="Technician profile not found for current user",
        )

    existing = (
        db.query(ServiceReport)
        .filter(
            ServiceReport.service_request_id == request_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Service report already exists",
        )

    report = ServiceReport(
        service_request_id=request_id,
        technician_id=technician.id,
        work_summary=report_data.work_summary,
        findings=report_data.findings,
        recommendations=report_data.recommendations,
        submitted_at=datetime.utcnow(),
    )

    request.status = "VERIFICATION_PENDING"

    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "message": "Service report submitted successfully",
        "report_id": report.id,
        "request_id": request_id,
        "status": request.status,
    }