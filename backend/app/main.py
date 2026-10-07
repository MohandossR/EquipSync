from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.database.connection import Base, engine
from app.models.user import User

app = FastAPI(
    title="EquipSync API",
    description="Industrial Equipment Service Management Platform",
    version="1.0.0",
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)


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