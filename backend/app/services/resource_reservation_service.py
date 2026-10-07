from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.resource import Resource
from app.models.resource_reservation import ResourceReservation
from app.models.service_request import ServiceRequest


def get_available_quantity(db: Session, resource_id: int) -> int:
    resource = db.execute(
        select(Resource).where(Resource.id == resource_id)
    ).scalar_one_or_none()

    if resource is None:
        raise ValueError("Resource not found")

    reserved_quantity = db.execute(
        select(
            func.coalesce(func.sum(ResourceReservation.quantity), 0)
        ).where(
            ResourceReservation.resource_id == resource_id,
            ResourceReservation.status == "RESERVED",
        )
    ).scalar_one()

    return max(resource.quantity - reserved_quantity, 0)


def create_reservation(
    db: Session,
    resource_id: int,
    service_request_id: int,
    quantity: int,
):
    if quantity <= 0:
        raise ValueError("Reservation quantity must be greater than zero")

    resource = db.execute(
        select(Resource)
        .where(Resource.id == resource_id)
        .with_for_update()
    ).scalar_one_or_none()

    if resource is None:
        raise ValueError("Resource not found")

    service_request = db.execute(
        select(ServiceRequest)
        .where(ServiceRequest.id == service_request_id)
    ).scalar_one_or_none()

    if service_request is None:
        raise ValueError("Service request not found")

    reserved_quantity = db.execute(
        select(
            func.coalesce(func.sum(ResourceReservation.quantity), 0)
        ).where(
            ResourceReservation.resource_id == resource_id,
            ResourceReservation.status == "RESERVED",
        )
    ).scalar_one()

    available_quantity = resource.quantity - reserved_quantity

    if available_quantity < 0:
        available_quantity = 0

    if quantity > available_quantity:
        raise ValueError(
            f"Only {available_quantity} units are available"
        )

    reservation = ResourceReservation(
        resource_id=resource_id,
        service_request_id=service_request_id,
        quantity=quantity,
        status="RESERVED",
    )

    db.add(reservation)

    remaining_quantity = available_quantity - quantity

    resource.is_available = remaining_quantity > 0

    db.commit()
    db.refresh(reservation)

    return reservation


def release_reservation(
    db: Session,
    resource_id: int,
    reservation_id: int,
):
    resource = db.execute(
        select(Resource)
        .where(Resource.id == resource_id)
        .with_for_update()
    ).scalar_one_or_none()

    if resource is None:
        raise ValueError("Resource not found")

    reservation = db.execute(
        select(ResourceReservation)
        .where(
            ResourceReservation.id == reservation_id,
            ResourceReservation.resource_id == resource_id,
        )
        .with_for_update()
    ).scalar_one_or_none()

    if reservation is None:
        raise ValueError("Reservation not found")

    if reservation.status != "RESERVED":
        raise ValueError("Reservation has already been released")

    reservation.status = "RELEASED"

    reserved_quantity = db.execute(
        select(
            func.coalesce(func.sum(ResourceReservation.quantity), 0)
        ).where(
            ResourceReservation.resource_id == resource_id,
            ResourceReservation.status == "RESERVED",
        )
    ).scalar_one()

    available_quantity = resource.quantity - reserved_quantity

    if available_quantity < 0:
        available_quantity = 0

    resource.is_available = available_quantity > 0

    db.commit()
    db.refresh(reservation)

    return reservation


def get_resource_reservations(
    db: Session,
    resource_id: int,
):
    resource = db.execute(
        select(Resource)
        .where(Resource.id == resource_id)
    ).scalar_one_or_none()

    if resource is None:
        raise ValueError("Resource not found")

    reservations = db.execute(
        select(ResourceReservation)
        .where(ResourceReservation.resource_id == resource_id)
        .order_by(ResourceReservation.reserved_at.desc())
    ).scalars().all()

    return reservations
