from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database.connection import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Integer, nullable=False, default=1)
    available_quantity = Column(Integer, nullable=False, default=1)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    status = Column(String(30), nullable=False, default="AVAILABLE")
