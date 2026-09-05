from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db

users_collection = db.users


async def get_user_by_email(email: str) -> dict | None:
    user = await users_collection.find_one({"email": email})
    return user


async def create_user(user_data: dict) -> dict:
    now = datetime.now(timezone.utc)
    user_data["createdAt"] = now
    user_data["updatedAt"] = now

    result = await users_collection.insert_one(user_data)
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    return created_user


async def get_user_by_id(user_id: str) -> dict | None:
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        return None

    user = await users_collection.find_one({"_id": object_id})
    return user