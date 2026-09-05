from fastapi import FastAPI
from app.api.auth_routes import router as auth_router

app = FastAPI(title="InfraAI API")

app.include_router(auth_router)


@app.get("/")
async def root():
    return {"message": "InfraAI API is running"}
