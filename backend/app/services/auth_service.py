from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.technician import Technician
from app.schemas.auth import UserRegister
from app.utils.security import hash_password, verify_password


def register_user(db: Session, user_data: UserRegister) -> User:
    existing_user = db.scalar(
        select(User).where(User.email == user_data.email)
    )

    if existing_user:
        raise ValueError("Email is already registered")

    role = user_data.role.upper()

    # Public registration is allowed only for customers and technicians
    if role not in ["CUSTOMER", "TECHNICIAN"]:
        raise ValueError(
            "Only CUSTOMER and TECHNICIAN accounts can be registered publicly"
        )

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=role,
    )

    db.add(user)
    db.flush()

    # Automatically create technician profile
    if role == "TECHNICIAN":
        technician = Technician(
            user_id=user.id,
            employee_code=f"TECH-{user.id:04d}",
            availability_status="AVAILABLE",
            workload=0,
            is_active=True,
        )

        db.add(technician)

    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    user = db.scalar(
        select(User).where(User.email == email)
    )

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    if not user.is_active:
        return None

    return user