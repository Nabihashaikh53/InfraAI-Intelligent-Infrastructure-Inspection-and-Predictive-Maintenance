from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel


class AssetModel(BaseModel):
    assetId: str
    name: str
    type: str
    description: Optional[str] = None
    location: Optional[str] = None
    status: str = "active"
    currentRisk: Optional[float] = None
    currentCondition: str = "unknown"
    createdAt: datetime = datetime.now(timezone.utc)
    updatedAt: datetime = datetime.now(timezone.utc)