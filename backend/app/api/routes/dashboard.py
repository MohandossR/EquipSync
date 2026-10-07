from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.service_request import ServiceRequest

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_requests = db.query(func.count(ServiceRequest.id)).scalar() or 0

    pending_approval = (
        db.query(func.count(ServiceRequest.id))
        .filter(ServiceRequest.status == "PENDING_APPROVAL")
        .scalar()
        or 0
    )

    active_jobs = (
        db.query(func.count(ServiceRequest.id))
        .filter(
            ServiceRequest.status.in_(
                [
                    "ASSIGNED",
                    "ACCEPTED",
                    "TRAVELLING",
                    "IN_PROGRESS",
                ]
            )
        )
        .scalar()
        or 0
    )

    sla_breached = (
        db.query(func.count(ServiceRequest.id))
        .filter(
            ServiceRequest.sla_deadline.isnot(None),
            ServiceRequest.sla_deadline < datetime.utcnow(),
            ServiceRequest.status.notin_(["COMPLETED", "VERIFIED", "CLOSED", "CANCELLED"]),
        )
        .scalar()
        or 0
    )

    return {
        "total_requests": total_requests,
        "pending_approval": pending_approval,
        "active_jobs": active_jobs,
        "sla_breached": sla_breached,
    }


@router.get("/sla")
def get_sla_summary(db: Session = Depends(get_db)):
    total = (
        db.query(func.count(ServiceRequest.id))
        .filter(ServiceRequest.sla_deadline.isnot(None))
        .scalar()
        or 0
    )

    breached = (
        db.query(func.count(ServiceRequest.id))
        .filter(
            ServiceRequest.sla_deadline.isnot(None),
            ServiceRequest.sla_deadline < datetime.utcnow(),
            ServiceRequest.status.notin_(
                ["COMPLETED", "VERIFIED", "CLOSED", "CANCELLED"]
            ),
        )
        .scalar()
        or 0
    )

    return {
        "total_with_sla": total,
        "breached": breached,
        "within_sla": total - breached,
    }