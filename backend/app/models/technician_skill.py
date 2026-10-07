from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class TechnicianSkill(Base):
    __tablename__ = "technician_skills"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    technician_id: Mapped[int] = mapped_column(
        ForeignKey("technicians.id"),
        nullable=False,
        index=True,
    )

    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id"),
        nullable=False,
        index=True,
    )

    proficiency_level: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    technician = relationship("Technician")
    skill = relationship("Skill")