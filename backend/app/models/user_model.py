from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr


class UserModel(BaseModel):
    name: str
    email: EmailStr
    passwordHash: str
    role: str = "inspector"
    createdAt: datetime = datetime.now(timezone.utc)
    updatedAt: datetime = datetime.now(timezone.utc)