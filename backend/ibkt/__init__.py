"""
iBKT package

โครงเบา ๆ สำหรับใช้งานทันที:
- IBKTModel: ตรรกะ iBKT (predict/update)
- Storage: joblib ไฟล์ง่าย ๆ (เปลี่ยนเป็น DB ได้ภายหลัง)
- Schemas: Pydantic models สำหรับ FastAPI
"""

from .model import IBKTModel, SkillParams
from .storage import load_model, save_model, MODEL_PATH
from . import schemas  # noqa: F401

__all__ = [
    "IBKTModel",
    "SkillParams",
    "load_model",
    "save_model",
    "MODEL_PATH",
    "schemas",
]
