from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database.connection import Base


class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    part_code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    quantity = Column(Integer, nullable=False, default=0)
    minimum_quantity = Column(Integer, nullable=False, default=0)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
