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
from app.routers.inventory import router as inventory_router
from app.api.routes.service_requests import router as service_requests_router
from app.api.routes.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.technicians import router as technicians_router
from app.api.routes.service_reports import router as service_reports_router
from app.api.routes.verification import router as verification_router


app = FastAPI(
    title="EquipSync API",
    description="Industrial Equipment Service Management Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(inventory_router)
app.include_router(service_requests_router)
app.include_router(dashboard_router)
app.include_router(technicians_router)
app.include_router(service_reports_router)
app.include_router(verification_router)

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
