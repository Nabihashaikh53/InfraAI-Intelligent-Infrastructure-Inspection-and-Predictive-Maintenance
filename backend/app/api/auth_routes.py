from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.schemas.user_schema import UserCreate, UserLogin, UserOut, TokenResponse
from app.auth.password import hash_password, verify_password
from app.auth.jwt_handler import create_access_token, decode_access_token
from app.database.user_repository import get_user_by_email, create_user, get_user_by_id

router = APIRouter(tags=["auth"])
security = HTTPBearer()


def _to_user_out(user_doc: dict) -> UserOut:
    return UserOut(
        id=str(user_doc["_id"]),
        name=user_doc["name"],
        email=user_doc["email"],
        role=user_doc.get("role", "inspector"),
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Reusable dependency. Other routers (assets, inspections, etc.)
    will import this to require a logged-in user.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = await get_user_by_id(payload["sub"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )
    return user


@router.post("/api/auth/register", response_model=TokenResponse, status_code=201)
async def register(payload: UserCreate):
    existing = await get_user_by_email(payload.email)
    if existing is not None:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "passwordHash": hash_password(payload.password),
        "role": "inspector",  # default role; admin promotion happens separately
    }
    created = await create_user(user_doc)

    token = create_access_token({"sub": str(created["_id"]), "role": created.get("role")})
    return TokenResponse(access_token=token, user=_to_user_out(created))


@router.post("/api/auth/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    user = await get_user_by_email(payload.email)
    if user is None or not verify_password(payload.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"]), "role": user.get("role")})
    return TokenResponse(access_token=token, user=_to_user_out(user))


@router.get("/api/users/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return _to_user_out(current_user)