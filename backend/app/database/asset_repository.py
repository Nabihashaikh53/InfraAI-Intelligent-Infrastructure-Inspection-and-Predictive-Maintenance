"""
STUB FILE — placeholder functions for the assets collection.
Teammate will replace these with real MongoDB (motor) queries on feature/database-setup.
Do not change these function names or signatures without telling the other person.
"""


async def create_asset(asset_data: dict) -> dict:
    raise NotImplementedError("create_asset: waiting on database implementation")


async def get_asset_by_id(asset_id: str) -> dict | None:
    raise NotImplementedError("get_asset_by_id: waiting on database implementation")


async def get_all_assets(filters: dict | None = None) -> list[dict]:
    raise NotImplementedError("get_all_assets: waiting on database implementation")


async def update_asset(asset_id: str, update_data: dict) -> dict | None:
    raise NotImplementedError("update_asset: waiting on database implementation")


async def delete_asset(asset_id: str) -> bool:
    raise NotImplementedError("delete_asset: waiting on database implementation")