from fastapi import APIRouter
from .endpoints import auth

api_router = APIRouter()

@api_router.get("/test")
async def test_endpoint():
    return {"message": "API v1 is working!", "status": "success"}

@api_router.get("/status")
async def status():
    return {
        "api_version": "v1",
        "status": "operational",
        "endpoints": ["/test", "/status", "/auth/*"]
    }

# Include auth router
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])