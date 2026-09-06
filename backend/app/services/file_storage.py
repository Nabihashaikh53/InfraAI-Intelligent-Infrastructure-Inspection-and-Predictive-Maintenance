import os
import uuid
from fastapi import UploadFile, HTTPException

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

UPLOAD_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")


async def save_uploaded_image(file: UploadFile, asset_id: str) -> str:
    """
    Validates and saves an uploaded image file to backend/uploads/<asset_id>/.
    Returns the relative path to store in the database (e.g. "uploads/AST-0001/abc123_bridge.jpg").
    """
    _, ext = os.path.splitext(file.filename)
    ext = ext.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Please upload a JPG, PNG, or WEBP image.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Image exceeds the maximum allowed size of 10MB.",
        )

    asset_folder = os.path.join(UPLOAD_ROOT, asset_id)
    os.makedirs(asset_folder, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    full_path = os.path.join(asset_folder, unique_name)

    with open(full_path, "wb") as f:
        f.write(contents)

    relative_path = f"uploads/{asset_id}/{unique_name}"
    return relative_path