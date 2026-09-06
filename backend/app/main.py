from fastapi import FastAPI
from app.api.auth_routes import router as auth_router
from app.api.asset_routes import router as asset_router
from app.api.inspection_routes import router as inspection_router
 feature/image-quality
main
app = FastAPI(title="InfraAI API")

app.include_router(auth_router)
app.include_router(asset_router)
app.include_router(inspection_router)


@app.get("/")
async def root():
    return {"message": "InfraAI API is running"}