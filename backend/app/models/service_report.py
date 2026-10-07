from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class ServiceReport(Base):
    __tablename__ = "service_reports"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    service_request_id: Mapped[int] = mapped_column(
        ForeignKey("service_requests.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    technician_id: Mapped[int] = mapped_column(
        ForeignKey("technicians.id"),
        nullable=False,
    )

    work_summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    findings: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    recommendations: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    service_request = relationship("ServiceRequest")
    technician = relationship("Technician")