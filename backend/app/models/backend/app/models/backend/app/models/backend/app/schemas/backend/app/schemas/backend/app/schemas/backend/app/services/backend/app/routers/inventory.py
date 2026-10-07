from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.part import Part
from app.models.resource import Resource
from app.schemas.part import PartCreate, PartUpdate, PartResponse
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse
from app.services.inventory_service import (
    is_part_available,
    is_part_low_stock,
    is_resource_available,
    update_part_stock,
    update_resource_stock
)

router = APIRouter(prefix="/api", tags=["Inventory"])


@router.post("/parts", response_model=PartResponse)
def create_part(part_data: PartCreate, db: Session = Depends(get_db)):
    existing_part = db.query(Part).filter(
        Part.part_code == part_data.part_code
    ).first()

    if existing_part:
        raise HTTPException(
            status_code=400,
            detail="Part code already exists"
        )

    part = Part(**part_data.model_dump())

    db.add(part)
    db.commit()
    db.refresh(part)

    return {
        "id": part.id,
        "name": part.name,
        "part_code": part.part_code,
        "description": part.description,
        "quantity": part.quantity,
        "minimum_quantity": part.minimum_quantity,
        "site_id": part.site_id,
        "available": part.quantity > 0,
        "low_stock": is_part_low_stock(part)
    }


@router.get("/parts", response_model=list[PartResponse])
def get_parts(db: Session = Depends(get_db)):
    parts = db.query(Part).all()

    return [
        {
            "id": part.id,
            "name": part.name,
            "part_code": part.part_code,
            "description": part.description,
            "quantity": part.quantity,
            "minimum_quantity": part.minimum_quantity,
            "site_id": part.site_id,
            "available": part.quantity > 0,
            "low_stock": is_part_low_stock(part)
        }
        for part in parts
    ]


@router.get("/parts/low-stock", response_model=list[PartResponse])
def get_low_stock_parts(db: Session = Depends(get_db)):
    parts = db.query(Part).filter(
        Part.quantity <= Part.minimum_quantity
    ).all()

    return [
        {
            "id": part.id,
            "name": part.name,
            "part_code": part.part_code,
            "description": part.description,
            "quantity": part.quantity,
            "minimum_quantity": part.minimum_quantity,
            "site_id": part.site_id,
            "available": part.quantity > 0,
            "low_stock": True
        }
        for part in parts
    ]


@router.get("/parts/{part_id}", response_model=PartResponse)
def get_part(part_id: int, db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.id == part_id).first()

    if not part:
        raise HTTPException(
            status_code=404,
            detail="Part not found"
        )

    return {
        "id": part.id,
        "name": part.name,
        "part_code": part.part_code,
        "description": part.description,
        "quantity": part.quantity,
        "minimum_quantity": part.minimum_quantity,
        "site_id": part.site_id,
        "available": part.quantity > 0,
        "low_stock": is_part_low_stock(part)
    }


@router.get("/parts/{part_id}/availability")
def check_part_availability(
    part_id: int,
    required_quantity: int = 1,
    db: Session = Depends(get_db)
):
    if required_quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Required quantity must be greater than zero"
        )

    part = db.query(Part).filter(Part.id == part_id).first()

    if not part:
        raise HTTPException(
            status_code=404,
            detail="Part not found"
        )

    available = is_part_available(part, required_quantity)

    return {
        "part_id": part.id,
        "part_name": part.name,
        "required_quantity": required_quantity,
        "available_quantity": part.quantity,
        "available": available,
        "low_stock": is_part_low_stock(part)
    }


@router.put("/parts/{part_id}", response_model=PartResponse)
def update_part(
    part_id: int,
    part_data: PartUpdate,
    db: Session = Depends(get_db)
):
    part = db.query(Part).filter(Part.id == part_id).first()

    if not part:
        raise HTTPException(
            status_code=404,
            detail="Part not found"
        )

    update_data = part_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(part, key, value)

    db.commit()
    db.refresh(part)

    return {
        "id": part.id,
        "name": part.name,
        "part_code": part.part_code,
        "description": part.description,
        "quantity": part.quantity,
        "minimum_quantity": part.minimum_quantity,
        "site_id": part.site_id,
        "available": part.quantity > 0,
        "low_stock": is_part_low_stock(part)
    }


@router.post("/resources", response_model=ResourceResponse)
def create_resource(
    resource_data: ResourceCreate,
    db: Session = Depends(get_db)
):
    resource = Resource(
        name=resource_data.name,
        resource_type=resource_data.resource_type,
        description=resource_data.description,
        quantity=resource_data.quantity,
        available_quantity=resource_data.quantity,
        site_id=resource_data.site_id,
        status="AVAILABLE" if resource_data.quantity > 0 else "UNAVAILABLE"
    )

    db.add(resource)
    db.commit()
    db.refresh(resource)

    return {
        "id": resource.id,
        "name": resource.name,
        "resource_type": resource.resource_type,
        "description": resource.description,
        "quantity": resource.quantity,
        "available_quantity": resource.available_quantity,
        "site_id": resource.site_id,
        "status": resource.status,
        "available": resource.available_quantity > 0
    }


@router.get("/resources", response_model=list[ResourceResponse])
def get_resources(db: Session = Depends(get_db)):
    resources = db.query(Resource).all()

    return [
        {
            "id": resource.id,
            "name": resource.name,
            "resource_type": resource.resource_type,
            "description": resource.description,
            "quantity": resource.quantity,
            "available_quantity": resource.available_quantity,
            "site_id": resource.site_id,
            "status": resource.status,
            "available": resource.available_quantity > 0
        }
        for resource in resources
    ]


@router.get("/resources/{resource_id}", response_model=ResourceResponse)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db)
):
    resource = db.query(Resource).filter(
        Resource.id == resource_id
    ).first()

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    return {
        "id": resource.id,
        "name": resource.name,
        "resource_type": resource.resource_type,
        "description": resource.description,
        "quantity": resource.quantity,
        "available_quantity": resource.available_quantity,
        "site_id": resource.site_id,
        "status": resource.status,
        "available": resource.available_quantity > 0
    }


@router.get("/resources/{resource_id}/availability")
def check_resource_availability(
    resource_id: int,
    required_quantity: int = 1,
    db: Session = Depends(get_db)
):
    if required_quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Required quantity must be greater than zero"
        )

    resource = db.query(Resource).filter(
        Resource.id == resource_id
    ).first()

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    available = is_resource_available(
        resource,
        required_quantity
    )

    return {
        "resource_id": resource.id,
        "resource_name": resource.name,
        "required_quantity": required_quantity,
        "available_quantity": resource.available_quantity,
        "available": available
    }


@router.put("/resources/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: int,
    resource_data: ResourceUpdate,
    db: Session = Depends(get_db)
):
    resource = db.query(Resource).filter(
        Resource.id == resource_id
    ).first()

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    update_data = resource_data.model_dump(exclude_unset=True)

    if "quantity" in update_data:
        new_quantity = update_data.pop("quantity")

        try:
            resource = update_resource_stock(
                db,
                resource,
                new_quantity
            )
        except ValueError as error:
            raise HTTPException(
                status_code=400,
                detail=str(error)
            )

    for key, value in update_data.items():
        setattr(resource, key, value)

    if resource.available_quantity > 0:
        resource.status = "AVAILABLE"
    else:
        resource.status = "RESERVED"

    db.commit()
    db.refresh(resource)

    return {
        "id": resource.id,
        "name": resource.name,
        "resource_type": resource.resource_type,
        "description": resource.description,
        "quantity": resource.quantity,
        "available_quantity": resource.available_quantity,
        "site_id": resource.site_id,
        "status": resource.status,
        "available": resource.available_quantity > 0
    }
