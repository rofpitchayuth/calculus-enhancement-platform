from typing import Optional, Dict
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.result import StudentKnowledge

class StudentKnowledgeRepository(BaseRepository[StudentKnowledge]):
    def get_or_create(self, user_id: int) -> StudentKnowledge:
        sk = self.db.query(StudentKnowledge).filter(
            StudentKnowledge.user_id == user_id
        ).first()
        if not sk:
            sk = self.create({
                "user_id": user_id,
                "skill_mastery": {}
            })
        return sk
    
    def update_skill_mastery(self, user_id: int, skill_tag: str, mastery: float):
        sk = self.get_or_create(user_id)
        mastery_dict = dict(sk.skill_mastery or {})
        mastery_dict[skill_tag] = mastery
        return self.update(sk, {"skill_mastery": mastery_dict})
    
    def get_skill_mastery(self, user_id: int, skill_tag: str) -> float:
        sk = self.get_or_create(user_id)
        return sk.skill_mastery.get(skill_tag, 0.2)