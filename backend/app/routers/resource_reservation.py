from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.resource_reservation import (
    ResourceReservationCreate,
    ResourceReservationRelease,
    ResourceReservationResponse,
)
from app.services.resource_reservation_service import (
    create_reservation,
    get_resource_reservations,
    release_reservation,
)

router = APIRouter(
    prefix="/api/resources",
    tags=["Resource Reservations"],
)


@router.post(
    "/{resource_id}/reserve",
    response_model=ResourceReservationResponse,
    status_code=status.HTTP_201_CREATED,
)
def reserve_resource(
    resource_id: int,
    reservation_data: ResourceReservationCreate,
    db: Session = Depends(get_db),
):
    try:
        reservation = create_reservation(
            db=db,
            resource_id=resource_id,
            service_request_id=reservation_data.service_request_id,
            quantity=reservation_data.quantity,
        )

        return reservation

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.post(
    "/{resource_id}/release",
    response_model=ResourceReservationResponse,
)
def release_resource(
    resource_id: int,
    release_data: ResourceReservationRelease,
    db: Session = Depends(get_db),
):
    try:
        reservation = release_reservation(
            db=db,
            resource_id=resource_id,
            reservation_id=release_data.reservation_id,
        )

        return reservation

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.get(
    "/{resource_id}/reservations",
    response_model=list[ResourceReservationResponse],
)
def get_reservations(
    resource_id: int,
    db: Session = Depends(get_db),
):
    try:
        reservations = get_resource_reservations(
            db=db,
            resource_id=resource_id,
        )

        return reservations

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )
