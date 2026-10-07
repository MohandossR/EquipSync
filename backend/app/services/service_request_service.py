from sqlalchemy.orm import Session

from app.models.service_request import ServiceRequest
from app.services.request_validation import validate_service_request_data
from app.services.workflow import validate_transition


def create_request(
    db: Session,
    *,
    machine_id: int,
    site_id: int,
    description: str,
    priority: str,
    required_skills: list[str],
    created_by: int,
) -> ServiceRequest:

    validate_service_request_data(
        machine_id=machine_id,
        site_id=site_id,
        description=description,
        priority=priority,
        required_skills=required_skills,
    )

    request = ServiceRequest(
        machine_id=machine_id,
        site_id=site_id,
        description=description.strip(),
        priority=priority.upper(),
        required_skills=required_skills,
        status="CREATED",
        created_by=created_by,
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
) -> ServiceRequest:

    new_status = new_status.upper()

    validate_transition(
        request.status,
        new_status,
    )

    request.status = new_status

    db.commit()
    db.refresh(request)

    return request
