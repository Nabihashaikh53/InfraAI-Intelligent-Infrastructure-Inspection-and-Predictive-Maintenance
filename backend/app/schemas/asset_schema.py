from pydantic import BaseModel
from typing import Optional


class AssetCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    location: Optional[str] = None


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    currentRisk: Optional[float] = None
    currentCondition: Optional[str] = None


class AssetOut(BaseModel):
    id: str
    assetId: str
    name: str
    type: str
    description: Optional[str] = None
    location: Optional[str] = None
    status: str
    currentRisk: Optional[float] = None
    currentCondition: Optional[str] = None