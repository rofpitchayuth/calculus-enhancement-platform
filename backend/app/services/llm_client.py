import httpx
import logging
from typing import List, Optional
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class QuestionAnalysisResult(BaseModel):
    difficulty: float
    main_topic: str
    skill_tags: List[str]
    bloom_level: str

async def auto_tag_question(question_text: str):
    """
    Calls the LLM Classifier microservice to analyze a calculus question.
    Returns structured data containing the difficulty, topic, skill tags, and bloom level.
    """
    url = "http://localhost:8001/api/v1/classify"
    
    # Send dummy choices as expected by llm_service.py endpoint
    payload = {
        "question_text": question_text,
        "choice_a": "N/A",
        "choice_b": "N/A",
        "choice_c": "N/A",
        "choice_d": "N/A",
        "choice_e": "N/A"
    }
    
    timeout = httpx.Timeout(300.0)
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            return QuestionAnalysisResult(
                difficulty=data.get("difficulty", 0.5),
                main_topic=data.get("main_topic", "Unknown"),
                skill_tags=data.get("skill_tags", []),
                bloom_level=data.get("bloom_level", "Unknown")
            )
            
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        logger.error(f"Error communicating with LLM microservice: {str(e)}")
        return "LLM Microservice is currently unreachable."
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error from LLM microservice: {e.response.text}")
        return "LLM Microservice is currently unreachable."
    except Exception as e:
        logger.error(f"Unexpected error in auto_tag_question: {str(e)}")
        return "LLM Microservice is currently unreachable."
