from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.machine import Machine
from app.models.service_request import ServiceRequest
from app.models.service_request_status_history import ServiceRequestStatusHistory
from app.services.request_validation import validate_service_request_data
from app.services.workflow import validate_transition


def generate_request_code(db: Session) -> str:
    """Generate a unique human-readable service request code."""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    base_code = f"SR-{timestamp}"

    existing = (
        db.query(ServiceRequest)
        .filter(ServiceRequest.request_code == base_code)
        .first()
    )

    if not existing:
        return base_code

    counter = 1
    while True:
        request_code = f"{base_code}-{counter}"
        existing = (
            db.query(ServiceRequest)
            .filter(ServiceRequest.request_code == request_code)
            .first()
        )
        if not existing:
            return request_code
        counter += 1


def create_request(
    db: Session,
    *,
    machine_id: int,
    title: str,
    description: str | None,
    priority: str,
    required_skill: str | None,
    requested_by: int,
    sla_deadline: datetime | None = None,
) -> ServiceRequest:

    validate_service_request_data(
        machine_id=machine_id,
        description=description or "",
        priority=priority,
        required_skill=required_skill,
    )

    machine = db.get(Machine, machine_id)

    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine not found",
        )

    if not machine.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Machine is inactive",
        )

    request = ServiceRequest(
        request_code=generate_request_code(db),
        machine_id=machine_id,
        requested_by=requested_by,
        title=title.strip(),
        description=description.strip() if description else None,
        priority=priority.upper(),
        required_skill=required_skill.strip() if required_skill else None,
        status="CREATED",
        sla_deadline=sla_deadline,
    )

    db.add(request)
    db.commit()
    db.refresh(request)

    return request


def get_request(
    db: Session,
    request_id: int,
) -> ServiceRequest | None:
    return db.get(ServiceRequest, request_id)


def get_requests(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> list[ServiceRequest]:
    return (
        db.query(ServiceRequest)
        .order_by(ServiceRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_status(
    db: Session,
    request: ServiceRequest,
    new_status: str,
    changed_by: int,
    reason: str | None = None,
) -> ServiceRequest:

    new_status = new_status.upper()

    validate_transition(
        request.status,
        new_status,
    )

    old_status = request.status

    request.status = new_status

    history = ServiceRequestStatusHistory(
        service_request_id=request.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
        remarks=reason,
    )

    db.add(history)
    db.commit()
    db.refresh(request)

    return request
