from fastapi import HTTPException, status


VALID_PRIORITIES = {
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
}


def validate_service_request_data(
    machine_id: int,
    site_id: int,
    description: str,
    priority: str,
    required_skills: list[str],
) -> None:
    if machine_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid machine_id",
        )

    if site_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid site_id",
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

    if not isinstance(required_skills, list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="required_skills must be a list",
        )

    if any(
        not isinstance(skill, str) or not skill.strip()
        for skill in required_skills
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Each required skill must be a non-empty string",
        )
