from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth_routes import router as auth_router
from app.api.asset_routes import router as asset_router
from app.api.inspection_routes import router as inspection_router

app = FastAPI(title="InfraAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(asset_router)
app.include_router(inspection_router)


@app.get("/")
async def root():
    return {"message": "InfraAI API is running"}