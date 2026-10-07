from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceRequestCreate(BaseModel):
    machine_id: int = Field(gt=0)
    site_id: int = Field(gt=0)
    description: str = Field(min_length=5, max_length=5000)
    priority: str = Field(default="MEDIUM", min_length=1, max_length=20)
    required_skills: list[str] = Field(default_factory=list)


class ServiceRequestStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=40)
    reason: str | None = Field(default=None, max_length=1000)


class ServiceRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    machine_id: int
    site_id: int
    description: str
    priority: str
    required_skills: list[str]
    status: str
    created_by: int
    created_at: datetime
    updated_at: datetime
