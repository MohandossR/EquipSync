from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class ServiceRequestAssignment(Base):
    __tablename__ = "service_request_assignments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    service_request_id: Mapped[int] = mapped_column(
        ForeignKey("service_requests.id"),
        nullable=False,
        index=True,
    )

    technician_id: Mapped[int] = mapped_column(
        ForeignKey("technicians.id"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="ASSIGNED",
    )

    assigned_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    service_request = relationship("ServiceRequest")
    technician = relationship("Technician")