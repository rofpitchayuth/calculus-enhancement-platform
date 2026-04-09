from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from contextlib import asynccontextmanager

# Import the classifier logic
from classifier.LLM_classifier import get_classifier, QuestionAnalysis

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load the local LLM model into VRAM when the FastAPI server starts.
    This prevents loading Delays on the first request.
    """
    print("Initializing LLM model on startup...")
    get_classifier()
    print("LLM model successfully initialized.")
    yield


app = FastAPI(title="LLM Question Classifier Service", lifespan=lifespan)

class QuestionInput(BaseModel):
    question_text: str
    choice_a: str
    choice_b: str
    choice_c: str
    choice_d: str
    choice_e: str

@app.post("/analyze_question", response_model=QuestionAnalysis)
async def analyze_question(request: QuestionInput):
    """
    Receives a calculus question and choices, runs it through the local Llama model via `outlines`,
    and returns a strictly formatted JSON response determining difficulty, topic, and skills.
    """
    try:
        classifier = get_classifier()
        # The result is already a validated pydantic QuestionAnalysis object!
        result = classifier.analyze_question(
            request.question_text,
            request.choice_a,
            request.choice_b,
            request.choice_c,
            request.choice_d,
            request.choice_e
        )
        return result
    except Exception as e:
        print(f"Error analyzing question: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during LLM inference.")

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8002
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
