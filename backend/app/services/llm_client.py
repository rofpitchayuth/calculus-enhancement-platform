import httpx
import logging
from typing import List, Dict, Optional, Any
from app.core.config import settings
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class QuestionAnalysisResult(BaseModel):
    difficulty_score: float
    main_topic: str
    skill_tags: List[str]
    reasoning: str

async def auto_tag_question(question_text: str) -> Optional[QuestionAnalysisResult]:
    """
    Calls the LLM Classifier microservice to analyze a calculus question.
    Returns structured data containing the difficulty, topic, skill tags, and reasoning.
    """
    url = f"{settings.LLM_SERVICE_URL}/analyze_question"
    payload = {"question_text": question_text}
    
    # Timeout set to 30 seconds as local LLM inference can be slow
    timeout = httpx.Timeout(30.0)
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            return QuestionAnalysisResult(**data)
            
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error from LLM microservice: {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Request error communicating with LLM microservice: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in auto_tag_question: {str(e)}")
        
    return None
