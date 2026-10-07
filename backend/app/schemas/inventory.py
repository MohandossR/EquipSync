from pydantic import BaseModel, ConfigDict, Field


class PartCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    part_code: str = Field(min_length=1, max_length=50)
    description: str | None = None
    quantity: int = Field(default=0, ge=0)
    minimum_stock: int = Field(default=0, ge=0)


class PartUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    quantity: int | None = Field(default=None, ge=0)
    minimum_stock: int | None = Field(default=None, ge=0)


class PartResponse(BaseModel):
    id: int
    name: str
    part_code: str
    description: str | None
    quantity: int
    minimum_stock: int
    available: bool
    low_stock: bool

    model_config = ConfigDict(from_attributes=True)


class ResourceCreate(BaseModel):
    resource_code: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=150)
    resource_type: str = Field(min_length=1, max_length=50)
    quantity: int = Field(default=1, ge=0)


class ResourceUpdate(BaseModel):
    resource_code: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=150)
    resource_type: str | None = Field(default=None, min_length=1, max_length=50)
    quantity: int | None = Field(default=None, ge=0)
    is_available: bool | None = None


class ResourceResponse(BaseModel):
    id: int
    resource_code: str
    name: str
    resource_type: str
    quantity: int
    is_available: bool
    available: bool

    model_config = ConfigDict(from_attributes=True)
