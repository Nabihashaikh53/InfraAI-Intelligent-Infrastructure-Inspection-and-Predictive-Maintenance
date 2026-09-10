from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request

from app.api.auth_routes import router as auth_router
from app.api.asset_routes import router as asset_router
from app.api.inspection_routes import router as inspection_router
from app.api.defect_routes import router as defect_router
from app.api.dashboard_routes import router as dashboard_router

app = FastAPI(title="InfraAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(asset_router)
app.include_router(inspection_router)
app.include_router(defect_router)
app.include_router(dashboard_router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."},
    )


@app.get("/")
async def root():
    return {"message": "InfraAI API is running"}

app = FastAPI(title="InfraAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(asset_router)
app.include_router(inspection_router)
app.include_router(defect_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."},
    )


@app.get("/")
async def root():
    return {"message": "InfraAI API is running"}