from __future__ import annotations

import os
import threading
from typing import Optional

import joblib

from .model import IBKTModel

# path เก็บโมเดล (ไฟล์เดียวพอเริ่มต้น)
MODEL_PATH = os.getenv("IBKT_MODEL_PATH", "ibkt_model.joblib")

# กัน concurrent read/write ง่าย ๆ
_LOCK = threading.RLock()


def load_model() -> IBKTModel:
    """โหลดโมเดลจากไฟล์ ถ้าไม่พบไฟล์ จะสร้างโมเดลใหม่"""
    with _LOCK:
        if os.path.exists(MODEL_PATH):
            data = joblib.load(MODEL_PATH)
            # รองรับทั้ง object เดิมหรือ dict
            if isinstance(data, IBKTModel):
                return data
            if isinstance(data, dict):
                return IBKTModel.from_dict(data)
        return IBKTModel()


def save_model(model: IBKTModel) -> None:
    """บันทึกโมเดลลงไฟล์ (atomic พอควร)"""
    tmp_path = f"{MODEL_PATH}.tmp"
    with _LOCK:
        joblib.dump(model.to_dict(), tmp_path)
        os.replace(tmp_path, MODEL_PATH)


# ---------- Hooks สำหรับภายหลัง ถ้าจะย้ายไป DB ----------
def reset_state(model: Optional[IBKTModel] = None) -> IBKTModel:
    """ล้าง posterior ทั้งหมด (เริ่มใหม่)"""
    with _LOCK:
        m = model or load_model()
        m.posterior.clear()
        save_model(m)
        return m
