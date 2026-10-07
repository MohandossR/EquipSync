from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.database.connection import Base, engine
from app.models.user import User
from app.models.site import Site
from app.models.machine import Machine
from app.models.service_request import ServiceRequest
from app.models.technician import Technician
from app.models.skill import Skill
from app.models.technician_skill import TechnicianSkill
from app.models.part import Part
from app.models.resource import Resource
from app.models.resource_reservation import ResourceReservation
from app.models.part_reservation import PartReservation
from app.models.service_request_assignment import ServiceRequestAssignment
from app.models.service_request_status_history import ServiceRequestStatusHistory
from app.models.service_report import ServiceReport
from app.models.service_photo import ServicePhoto
from app.models.notification import Notification
from app.routers.resource_reservation import router as resource_reservation_router
from app.routers.inventory import router as inventory_router
from app.api.routes.service_requests import router as service_requests_router

app = FastAPI(
    title="EquipSync API",
    description="Industrial Equipment Service Management Platform",
    version="1.0.0",
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(inventory_router)
app.include_router(service_requests_router)
app.include_router(resource_reservation_router)


@app.get("/")
def root():
    return {
        "message": "EquipSync API is running",
        "status": "ok",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }

