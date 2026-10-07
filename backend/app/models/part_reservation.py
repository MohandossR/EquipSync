from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class PartReservation(Base):
    __tablename__ = "part_reservations"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    part_id: Mapped[int] = mapped_column(
        ForeignKey("parts.id"),
        nullable=False,
        index=True,
    )

    service_request_id: Mapped[int] = mapped_column(
        ForeignKey("service_requests.id"),
        nullable=False,
        index=True,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="RESERVED",
    )

    reserved_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    part = relationship("Part")
    service_request = relationship("ServiceRequest")