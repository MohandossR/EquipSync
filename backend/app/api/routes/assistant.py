from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.dependencies import get_current_user
from app.models.service_request import ServiceRequest
from app.models.part import Part
from app.models.technician import Technician


router = APIRouter(
    prefix="/api/assistant",
    tags=["AI Assistant"],
)


@router.post("/chat")
def assistant_chat(
    payload: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    message = str(payload.get("message", "")).lower().strip()

    if not message:
        return {
            "reply": "Tell me what you need help with."
        }

    # LOW STOCK
    if "low stock" in message or "low-stock" in message:
        parts = (
            db.query(Part)
            .filter(Part.quantity <= Part.minimum_stock)
            .all()
        )

        if not parts:
            return {
                "reply": "All parts are currently above minimum stock."
            }

        text = "\n".join(
            f"• {p.name}: {p.quantity} units "
            f"(minimum {p.minimum_stock})"
            for p in parts
        )

        return {
            "reply": f"⚠️ Low-stock parts:\n{text}"
        }

    # AT RISK / SLA
    if "sla" in message or "at risk" in message or "breach" in message:
        requests = (
            db.query(ServiceRequest)
            .filter(
                ServiceRequest.status.notin_(
                    ["CLOSED", "VERIFIED"]
                ),
                ServiceRequest.sla_deadline.isnot(None),
            )
            .all()
        )

        now = datetime.utcnow()

        risky = [
            r for r in requests
            if r.sla_deadline and r.sla_deadline <= now
        ]

        if not risky:
            return {
                "reply": "No SLA-breached requests found."
            }

        text = "\n".join(
            f"• {r.request_code} — {r.status}"
            for r in risky
        )

        return {
            "reply": f"🚨 SLA attention required:\n{text}"
        }

    # REQUEST STATUS
    if "status" in message or "where is" in message:
        numbers = [
            word for word in message.split()
            if word.isdigit()
        ]

        if numbers:
            request_id = int(numbers[-1])

            request = (
                db.query(ServiceRequest)
                .filter(ServiceRequest.id == request_id)
                .first()
            )

            if request:
                return {
                    "reply": (
                        f"Request {request.request_code} is currently "
                        f"**{request.status}**.\n"
                        f"Priority: {request.priority}\n"
                        f"Title: {request.title}"
                    )
                }

    # TECHNICIAN SEARCH
    if (
        "best technician" in message
        or "best tech" in message
        or "technician" in message
        or "assign" in message
    ):
        numbers = [
            word for word in message.split()
            if word.isdigit()
        ]

        if numbers:
            request_id = int(numbers[-1])

            request = (
                db.query(ServiceRequest)
                .filter(ServiceRequest.id == request_id)
                .first()
            )

            if request:
                technicians = (
                    db.query(Technician)
                    .filter(
                        Technician.is_active == True,
                        Technician.availability_status == "AVAILABLE",
                    )
                    .all()
                )

                if not technicians:
                    return {
                        "reply": "No technicians are currently available."
                    }

                technicians.sort(
                    key=lambda t: (
                        -(t.workload or 0)
                    )
                )

                best = technicians[0]

                return {
                    "reply": (
                        f"🤖 Recommended technician: "
                        f"**{best.user.full_name}**\n"
                        f"Availability: {best.availability_status}\n"
                        f"Current workload: {best.workload}\n\n"
                        f"For the full explainable ranking, use "
                        f"Smart Dispatch."
                    ),
                    "technician_id": best.id,
                    "request_id": request.id,
                }

    # GENERAL HELP
    return {
        "reply": (
            "🤖 I can help with:\n\n"
            "• Find the best technician\n"
            "• Check SLA risks\n"
            "• Check request status\n"
            "• Find low-stock parts\n"
            "• Explain dispatch decisions\n\n"
            "Try: `Who is the best technician for request 5?`"
        )
    }