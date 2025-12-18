from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn

from classifier.llama31_classifier import get_classifier

app = FastAPI(title="ML Question Tagger - Llama3.1 8B", version="2.0.0")

class QuestionRequest(BaseModel):
    question_text: str

class TopicResponse(BaseModel):
    main_topic: str

class SkillsResponse(BaseModel):
    skill_tags: List[str]

class BloomResponse(BaseModel):
    bloom_level: str

class DifficultyRequest(BaseModel):
    question_text: str
    bloom_level: str

class DifficultyResponse(BaseModel):
    difficulty: float

class FullTaggingResponse(BaseModel):
    main_topic: str
    skill_tags: List[str]
    bloom_level: str
    difficulty: float

# Lazy-load classifier
classifier = None

def init_classifier():
    global classifier
    if classifier is None:
        classifier = get_classifier()
    return classifier

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    print("🔥 Initializing Mistral-7B classifier...")
    init_classifier()
    print("✅ Ready to classify!")

@app.get("/")
async def root():
    return {
        "message": "ML Question Tagger API",
        "endpoints": ["/classify/topic", "/classify/skills", "/classify/bloom", "/classify/difficulty", "/classify/full"]
    }

@app.post("/classify/topic", response_model=TopicResponse)
async def classify_topic(request: QuestionRequest):
    """Classify question main topic"""
    try:
        clf = init_classifier()
        topic = clf.classify_topic(request.question_text)
        return TopicResponse(main_topic=topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify/skills", response_model=SkillsResponse)
async def classify_skills(request: QuestionRequest):
    """Extract skill tags"""
    try:
        clf = init_classifier()
        skills = clf.extract_skills(request.question_text)
        return SkillsResponse(skill_tags=skills)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify/bloom", response_model=BloomResponse)
async def classify_bloom(request: QuestionRequest):
    """Detect Bloom's taxonomy level"""
    try:
        clf = init_classifier()
        bloom = clf.detect_bloom(request.question_text)
        return BloomResponse(bloom_level=bloom)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify/difficulty", response_model=DifficultyResponse)
async def classify_difficulty(request: DifficultyRequest):
    """Score difficulty (0.0-1.0)"""
    try:
        clf = init_classifier()
        diff = clf.score_difficulty(request.question_text, request.bloom_level)
        return DifficultyResponse(difficulty=diff)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify/full", response_model=FullTaggingResponse)
async def classify_full(request: QuestionRequest):
    """Full auto-tagging (all fields at once)"""
    try:
        clf = init_classifier()
        
        # Run all classifiers
        topic = clf.classify_topic(request.question_text)
        skills = clf.extract_skills(request.question_text)
        bloom = clf.detect_bloom(request.question_text)
        difficulty = clf.score_difficulty(request.question_text, bloom)
        
        return FullTaggingResponse(
            main_topic=topic,
            skill_tags=skills,
            bloom_level=bloom,
            difficulty=difficulty
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
