"""
STUB FILE — placeholder functions for the users collection.
[Friend's name] will replace the bodies of these with real MongoDB (motor) queries.
Do not change these function names or signatures without telling the other person.
"""


async def get_user_by_email(email: str) -> dict | None:
    """
    Should return the user document (dict) matching this email, or None if not found.
    Expected document shape:
    {
        "_id": ..., "name": ..., "email": ...,
        "passwordHash": ..., "role": ..., "createdAt": ..., "updatedAt": ...
    }
    """
    raise NotImplementedError("get_user_by_email: waiting on database implementation")


async def create_user(user_data: dict) -> dict:
    """
    Should insert user_data into the users collection and return the created document
    (including its generated _id as a string).
    """
    raise NotImplementedError("create_user: waiting on database implementation")


async def get_user_by_id(user_id: str) -> dict | None:
    """
    Should return the user document matching this _id, or None if not found.
    """
    raise NotImplementedError("get_user_by_id: waiting on database implementation")