from __future__ import annotations

from pydantic import BaseModel, Field


# ---------- Requests ----------
class PredictReq(BaseModel):
    user_id: str = Field(..., description="ID ผู้ใช้")
    item_id: str = Field(..., description="ID ข้อ/ไอเทม")
    skill_id: str = Field(..., description="ทักษะหลักของข้อนี้")


class UpdateReq(BaseModel):
    user_id: str
    item_id: str
    skill_id: str
    correct: int = Field(..., ge=0, le=1, description="0/1")


# ---------- Responses ----------
class PredictRes(BaseModel):
    p_correct: float = Field(..., ge=0.0, le=1.0)
    p_mastery: float = Field(..., ge=0.0, le=1.0)


class UpdateRes(BaseModel):
    p_mastery_next: float = Field(..., ge=0.0, le=1.0)
    p_correct_next: float = Field(..., ge=0.0, le=1.0)
