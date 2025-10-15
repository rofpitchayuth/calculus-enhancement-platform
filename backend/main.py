from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def read_root():
    return {"message": "Hello from backend"}


@app.get("/health")
async def health():
    return {"status": "ok"}
