from pydantic import BaseModel, ConfigDict, Field


class PartCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    part_code: str = Field(min_length=1, max_length=50)
    description: str | None = None
    quantity: int = Field(default=0, ge=0)
    minimum_quantity: int = Field(default=0, ge=0)
    site_id: int = Field(gt=0)


class PartUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    quantity: int | None = Field(default=None, ge=0)
    minimum_quantity: int | None = Field(default=None, ge=0)
    site_id: int | None = Field(default=None, gt=0)


class PartResponse(BaseModel):
    id: int
    name: str
    part_code: str
    description: str | None
    quantity: int
    minimum_quantity: int
    site_id: int
    available: bool
    low_stock: bool

    model_config = ConfigDict(from_attributes=True)
