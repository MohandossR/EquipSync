from fastapi import HTTPException, status


VALID_PRIORITIES = {
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
}


def validate_service_request_data(
    machine_id: int,
    description: str,
    priority: str,
    required_skill: str | None,
) -> None:
    if machine_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid machine_id",
        )

    if not description or not description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description is required",
        )

    normalized_priority = priority.upper()

    if normalized_priority not in VALID_PRIORITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid priority. Allowed values: "
                f"{', '.join(sorted(VALID_PRIORITIES))}"
            ),
        )

    if required_skill is not None and not required_skill.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="required_skill cannot be empty",
        )
