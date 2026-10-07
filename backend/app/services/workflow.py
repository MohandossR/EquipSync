from fastapi import HTTPException, status


WORKFLOW_STATES = {
    "CREATED",
    "VALIDATING",
    "PENDING_APPROVAL",
    "APPROVED",
    "ASSIGNED",
    "ACCEPTED",
    "TRAVELLING",
    "IN_PROGRESS",
    "COMPLETED",
    "VERIFICATION_PENDING",
    "VERIFIED",
    "CLOSED",
    "REASSIGNMENT_REQUIRED",
    "PART_UNAVAILABLE",
    "SLA_BREACHED",
    "CANCELLED",
}


ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "CREATED": {"VALIDATING", "CANCELLED"},
    "VALIDATING": {"PENDING_APPROVAL", "PART_UNAVAILABLE", "CANCELLED"},
    "PENDING_APPROVAL": {"APPROVED", "CANCELLED"},
    "APPROVED": {
        "ASSIGNED",
        "REASSIGNMENT_REQUIRED",
        "PART_UNAVAILABLE",
        "SLA_BREACHED",
        "CANCELLED",
    },
    "ASSIGNED": {
        "ACCEPTED",
        "REASSIGNMENT_REQUIRED",
        "SLA_BREACHED",
        "CANCELLED",
    },
    "ACCEPTED": {
        "TRAVELLING",
        "REASSIGNMENT_REQUIRED",
        "SLA_BREACHED",
        "CANCELLED",
    },
    "TRAVELLING": {
        "IN_PROGRESS",
        "REASSIGNMENT_REQUIRED",
        "SLA_BREACHED",
        "CANCELLED",
    },
    "IN_PROGRESS": {
        "COMPLETED",
        "REASSIGNMENT_REQUIRED",
        "PART_UNAVAILABLE",
        "SLA_BREACHED",
        "CANCELLED",
    },
    "COMPLETED": {
        "VERIFICATION_PENDING",
    },
    "VERIFICATION_PENDING": {
        "VERIFIED",
        "CANCELLED",
    },
    "VERIFIED": {
        "CLOSED",
    },
    "CLOSED": set(),
    "REASSIGNMENT_REQUIRED": {
        "ASSIGNED",
        "CANCELLED",
    },
    "PART_UNAVAILABLE": {
        "APPROVED",
        "ASSIGNED",
        "CANCELLED",
    },
    "SLA_BREACHED": {
        "REASSIGNMENT_REQUIRED",
        "CANCELLED",
    },
    "CANCELLED": set(),
}


def validate_transition(current_status: str, new_status: str) -> None:
    current_status = current_status.upper()
    new_status = new_status.upper()

    if new_status not in WORKFLOW_STATES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown workflow status: {new_status}",
        )

    allowed = ALLOWED_TRANSITIONS.get(current_status, set())

    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Invalid workflow transition: "
                f"{current_status} -> {new_status}"
            ),
        )
