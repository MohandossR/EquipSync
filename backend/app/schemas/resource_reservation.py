from datetime import datetime

from pydantic import BaseModel, Field


class ResourceReservationCreate(BaseModel):
    service_request_id: int
    quantity: int = Field(gt=0)


class ResourceReservationRelease(BaseModel):
    reservation_id: int


class ResourceReservationResponse(BaseModel):
    id: int
    resource_id: int
    service_request_id: int
    quantity: int
    status: str
    reserved_at: datetime

    class Config:
        from_attributes = True
