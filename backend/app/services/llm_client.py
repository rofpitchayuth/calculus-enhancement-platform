import httpx
import logging
from typing import List, Optional
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)

class QuestionAnalysisResult(BaseModel):
    step_by_step_analysis: str
    main_topic: str
    sub_topic: str
    skill_tags: List[str]
    bloom_level: str
    difficulty: float
    discrimination: float
    error_code_A: str
    error_code_B: str
    error_code_C: str
    error_code_D: str
    error_code_E: str

async def auto_tag_question(
    question_text: str,
    choice_a: str,
    choice_b: str,
    choice_c: str,
    choice_d: str,
    choice_e: str
):
    """
    Calls the LLM Classifier microservice to analyze a calculus question.
    Returns structured data containing the full 12-field analysis.
    """
    url = f"{settings.LLM_SERVICE_URL}/api/v1/classify"
    
    payload = {
        "question_text": question_text,
        "choice_a": choice_a,
        "choice_b": choice_b,
        "choice_c": choice_c,
        "choice_d": choice_d,
        "choice_e": choice_e
    }
    
    timeout = httpx.Timeout(300.0)
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            return QuestionAnalysisResult(**data)
            
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        logger.error(f"Error communicating with LLM microservice: {str(e)}")
        return "LLM Microservice is currently unreachable."
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error from LLM microservice: {e.response.text}")
        return "LLM Microservice is currently unreachable."
    except Exception as e:
        logger.error(f"Unexpected error in auto_tag_question: {str(e)}")
        return "LLM Microservice is currently unreachable."

async def extract_latex_from_image(base64_image: str) -> dict:
    """
    Calls the LLM Vision microservice to extract LaTeX and choices from an image.
    """
    url = f"{settings.LLM_SERVICE_URL}/api/v1/vision/extract-latex"
    payload = {"base64_image": base64_image}
    timeout = httpx.Timeout(180.0)
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data
    except Exception as e:
        logger.error(f"Failed to extract LaTeX from image: {e}")
        return {"error": "ERROR: ML Service Vision pipeline is unreachable."}
