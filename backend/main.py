from fastapi import FastAPI
from ibkt.model import IBKTModel
from ibkt.schemas import PredictReq, PredictRes, UpdateReq, UpdateRes
from ibkt.storage import load_model, save_model

app = FastAPI(title="Learning Analytics API")
model: IBKTModel = load_model()

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/ibkt/predict", response_model=PredictRes)
def ibkt_predict(req: PredictReq):
    p_corr = model.predict_correct_prob(req.user_id, req.item_id, req.skill_id)
    p_m = model.get_posterior(req.user_id, req.skill_id)
    return PredictRes(p_correct=p_corr, p_mastery=p_m)

@app.post("/ibkt/update", response_model=UpdateRes)
def ibkt_update(req: UpdateReq):
    p_next = model.update_with_result(req.user_id, req.item_id, req.skill_id, req.correct)
    p_corr_next = model.predict_correct_prob(req.user_id, req.item_id, req.skill_id)
    save_model(model)
    return UpdateRes(p_mastery_next=p_next, p_correct_next=p_corr_next)
