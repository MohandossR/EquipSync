from sqlalchemy.orm import Session

from app.models.part import Part
from app.models.resource import Resource


def is_part_available(part: Part, required_quantity: int) -> bool:
    return part.quantity >= required_quantity


def is_part_low_stock(part: Part) -> bool:
    return part.quantity <= part.minimum_stock


def is_resource_available(resource: Resource, required_quantity: int = 1) -> bool:
    return resource.is_available and resource.quantity >= required_quantity


def update_part_stock(
    db: Session,
    part: Part,
    new_quantity: int
) -> Part:
    if new_quantity < 0:
        raise ValueError("Part quantity cannot be negative")

    part.quantity = new_quantity
    db.commit()
    db.refresh(part)

    return part


def update_resource_stock(
    db: Session,
    resource: Resource,
    new_quantity: int
) -> Resource:
    if new_quantity < 0:
        raise ValueError("Resource quantity cannot be negative")

    resource.quantity = new_quantity
    resource.is_available = new_quantity > 0

    db.commit()
    db.refresh(resource)

    return resource
