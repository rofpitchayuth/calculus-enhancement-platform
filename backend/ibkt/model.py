from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Dict, Tuple
import math


def _sigmoid(x: float) -> float:
    # ป้องกัน overflow เล็กน้อย
    if x >= 35:
        return 1.0
    if x <= -35:
        return 0.0
    return 1.0 / (1.0 + math.exp(-x))


def _clip01(p: float) -> float:
    return max(0.0, min(1.0, p))


@dataclass
class SkillParams:
    """พารามิเตอร์ต่อทักษะ"""
    p_init: float = 0.2      # prior mastery
    learn: float = 0.15      # P(M=1|prev=0)
    forget: float = 0.0      # P(M=0|prev=1)
    alpha: float = -2.0      # base slip logit
    beta: float = -2.0       # base guess logit

    def as_dict(self) -> Dict[str, float]:
        return asdict(self)


@dataclass
class IBKTModel:
    """
    iBKT รุ่นเบา ใช้งานได้จริง:
    - เก็บ params ต่อ skill
    - personalization แบบง่าย: student_bias, item_diff
    - เก็บ posterior mastery (online state) ในหน่วยความจำ
      (ภายหลังย้ายไป DB ได้)
    """
    skills: Dict[str, SkillParams] = field(default_factory=dict)
    student_bias: Dict[str, float] = field(default_factory=dict)
    item_diff: Dict[str, float] = field(default_factory=dict)
    posterior: Dict[Tuple[str, str], float] = field(default_factory=dict)

    # ---------- Utilities ----------
    def _get_params(self, skill_id: str) -> SkillParams:
        if skill_id not in self.skills:
            self.skills[skill_id] = SkillParams()
        return self.skills[skill_id]

    @staticmethod
    def _key(user_id: str, skill_id: str) -> Tuple[str, str]:
        return (str(user_id), str(skill_id))

    def get_posterior(self, user_id: str, skill_id: str) -> float:
        """อ่าน posterior mastery ปัจจุบัน (ยังไม่ apply transition รอบใหม่)"""
        key = self._key(user_id, skill_id)
        if key not in self.posterior:
            self.posterior[key] = self._get_params(skill_id).p_init
        return self.posterior[key]

    def set_posterior(self, user_id: str, skill_id: str, p: float) -> None:
        self.posterior[self._key(user_id, skill_id)] = _clip01(p)

    # ---------- Core ----------
    def predict_correct_prob(self, user_id: str, item_id: str, skill_id: str) -> float:
        """P(correct) จาก posterior ปัจจุบัน (ก่อนเห็นคำตอบใหม่)"""
        p = self.get_posterior(user_id, skill_id)
        sp = self._get_params(skill_id)

        sb = self.student_bias.get(str(user_id), 0.0)
        idiff = self.item_diff.get(str(item_id), 0.0)

        slip = _sigmoid(sp.alpha + sb - idiff)
        guess = _sigmoid(sp.beta  - sb + idiff)

        # P(correct) = p*(1-slip) + (1-p)*guess
        pcorr = p * (1.0 - slip) + (1.0 - p) * guess
        return _clip01(pcorr)

    def update_with_result(self, user_id: str, item_id: str, skill_id: str, correct: int) -> float:
        """
        อัปเดต posterior หลังเห็นผลลัพธ์ correct ∈ {0,1}
        แล้ว apply transition ไปยัง timestep ถัดไป
        """
        correct = 1 if int(correct) == 1 else 0

        p_prior = self.get_posterior(user_id, skill_id)
        sp = self._get_params(skill_id)

        sb = self.student_bias.get(str(user_id), 0.0)
        idiff = self.item_diff.get(str(item_id), 0.0)

        slip = _sigmoid(sp.alpha + sb - idiff)
        guess = _sigmoid(sp.beta  - sb + idiff)

        # likelihoods
        pc_m = 1.0 - slip    # P(correct|master)
        pc_nm = guess        # P(correct|not master)

        if correct == 1:
            num = p_prior * pc_m
            den = num + (1.0 - p_prior) * pc_nm
        else:
            num = p_prior * (1.0 - pc_m)
            den = num + (1.0 - p_prior) * (1.0 - pc_nm)

        p_posterior = 0.0 if den == 0.0 else (num / den)
        p_posterior = _clip01(p_posterior)

        # transition
        p_next = p_posterior * (1.0 - sp.forget) + (1.0 - p_posterior) * sp.learn
        p_next = _clip01(p_next)

        self.set_posterior(user_id, skill_id, p_next)
        return p_next

    # ---------- (Optional) Param helpers ----------
    def set_skill_params(self, skill_id: str, params: SkillParams) -> None:
        self.skills[str(skill_id)] = params

    def set_student_bias(self, user_id: str, bias: float) -> None:
        self.student_bias[str(user_id)] = float(bias)

    def set_item_diff(self, item_id: str, difficulty: float) -> None:
        self.item_diff[str(item_id)] = float(difficulty)

    # ---------- Serialization ----------
    def to_dict(self) -> Dict:
        return {
            "skills": {k: v.as_dict() for k, v in self.skills.items()},
            "student_bias": dict(self.student_bias),
            "item_diff": dict(self.item_diff),
            "posterior": {f"{u}|{s}": p for (u, s), p in self.posterior.items()},
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "IBKTModel":
        skills = {k: SkillParams(**v) for k, v in data.get("skills", {}).items()}
        student_bias = {str(k): float(v) for k, v in data.get("student_bias", {}).items()}
        item_diff = {str(k): float(v) for k, v in data.get("item_diff", {}).items()}

        post_raw = data.get("posterior", {})
        posterior: Dict[Tuple[str, str], float] = {}
        for key, p in post_raw.items():
            if "|" in key:
                u, s = key.split("|", 1)
                posterior[(u, s)] = _clip01(float(p))

        return cls(skills=skills, student_bias=student_bias, item_diff=item_diff, posterior=posterior)
