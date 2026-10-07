from pydantic import BaseModel, ConfigDict, Field


class ResourceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    resource_type: str = Field(min_length=1, max_length=50)
    description: str | None = None
    quantity: int = Field(default=1, ge=0)
    site_id: int = Field(gt=0)


class ResourceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    resource_type: str | None = Field(default=None, min_length=1, max_length=50)
    description: str | None = None
    quantity: int | None = Field(default=None, ge=0)
    available_quantity: int | None = Field(default=None, ge=0)
    site_id: int | None = Field(default=None, gt=0)
    status: str | None = None


class ResourceResponse(BaseModel):
    id: int
    name: str
    resource_type: str
    description: str | None
    quantity: int
    available_quantity: int
    site_id: int
    status: str
    available: bool

    model_config = ConfigDict(from_attributes=True)
