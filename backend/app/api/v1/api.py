from fastapi import APIRouter

from .endpoints import auth, quiz, dashboard, grader, admin, recommendation

api_router = APIRouter()

@api_router.get("/test")
async def test_endpoint():
    return {"message": "API v1 is working!", "status": "success"}

@api_router.get("/status")
async def status():
    return {
        "api_version": "v1",
        "status": "operational",
        "endpoints": ["/test", "/status", "/auth/*", "/quiz/*", "/dashboard/*", "/grader/*"]
    }

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["Quiz & IBKT"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
# LLM Grader — powered by QwenMath (Ollama) + Gemini-2.5-Flash
api_router.include_router(grader.router, prefix="/grader", tags=["LLM Grader"])
api_router.include_router(admin.router, prefix="/admin", tags=["HITL Admin"])
api_router.include_router(recommendation.router, prefix="/recommendations", tags=["Adaptive Learning"])