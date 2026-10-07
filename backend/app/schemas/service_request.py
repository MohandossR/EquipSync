from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceRequestCreate(BaseModel):
    machine_id: int = Field(gt=0)
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5, max_length=5000)
    priority: str = Field(default="MEDIUM", min_length=1, max_length=20)
    required_skill: str | None = Field(default=None, max_length=100)
    sla_deadline: datetime | None = None


class ServiceRequestStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=40)
    reason: str | None = Field(default=None, max_length=1000)


class ServiceRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_code: str
    machine_id: int
    requested_by: int
    title: str
    description: str | None
    priority: str
    required_skill: str | None
    sla_deadline: datetime | None
    status: str
    created_at: datetime
    updated_at: datetime
