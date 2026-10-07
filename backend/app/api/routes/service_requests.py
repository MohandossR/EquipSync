from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.service_request import (
    ServiceRequestCreate,
    ServiceRequestResponse,
    ServiceRequestStatusUpdate,
)
from app.services.service_request_service import (
    create_request,
    get_request,
    get_requests,
    update_status,
)


router = APIRouter(
    prefix="/api/requests",
    tags=["Service Requests"],
)


@router.post(
    "",
    response_model=ServiceRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_service_request(
    payload: ServiceRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_request(
        db,
        machine_id=payload.machine_id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        required_skill=payload.required_skill,
        requested_by=current_user.id,
        sla_deadline=payload.sla_deadline,
    )


@router.get(
    "",
    response_model=list[ServiceRequestResponse],
)
def list_service_requests(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_requests(
        db,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{request_id}",
    response_model=ServiceRequestResponse,
)
def get_service_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = get_request(db, request_id)

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found",
        )

    return request


@router.put(
    "/{request_id}/status",
    response_model=ServiceRequestResponse,
)
def change_service_request_status(
    request_id: int,
    payload: ServiceRequestStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = get_request(db, request_id)

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found",
        )

    return update_status(
        db,
        request,
        payload.status,
        changed_by=current_user.id,
        reason=payload.reason,
    )


@router.post(
    "/{request_id}/approve",
    response_model=ServiceRequestResponse,
)
def approve_service_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = get_request(db, request_id)

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found",
        )

    return update_status(
        db,
        request,
        "APPROVED",
        changed_by=current_user.id,
        reason="Request approved",
    )
