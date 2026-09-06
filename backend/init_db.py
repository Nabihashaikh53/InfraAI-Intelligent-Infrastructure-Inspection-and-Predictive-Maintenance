import asyncio
from app.database.connection import db


async def init_indexes():
    await db.users.create_index("email", unique=True)
    print("Created unique index on users.email")

    await db.assets.create_index("assetId", unique=True)
    print("Created unique index on assets.assetId")

    await db.inspections.create_index("assetId")
    print("Created index on inspections.assetId")

    print("Index setup complete.")


if __name__ == "__main__":
    asyncio.run(init_indexes())