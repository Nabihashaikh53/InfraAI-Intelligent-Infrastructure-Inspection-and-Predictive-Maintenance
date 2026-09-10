import os
import tempfile
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, UploadFile

from app.database.connection import db


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

images_collection = db.inspectionImages


async def store_image(
    file: UploadFile,
) -> str:
    filename = file.filename or "image"

    _, extension = os.path.splitext(filename)
    extension = extension.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format.",
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty.",
        )

    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Image exceeds the 10 MB limit.",
        )

    image_id = uuid.uuid4().hex

    await images_collection.insert_one(
        {
            "imageId": image_id,
            "filename": filename,
            "contentType": file.content_type
            or "application/octet-stream",
            "data": contents,
            "size": len(contents),
            "createdAt": datetime.now(timezone.utc),
        }
    )

    return image_id


async def get_image(
    image_id: str,
) -> dict | None:
    return await images_collection.find_one(
        {
            "imageId": image_id,
        }
    )


async def create_temp_image_file(
    image_id: str,
) -> str:
    image = await get_image(image_id)

    if image is None:
        raise FileNotFoundError(
            f"Image {image_id} was not found."
        )

    suffix = os.path.splitext(
        image.get("filename", "image.jpg")
    )[1]

    temp_file = tempfile.NamedTemporaryFile(
        suffix=suffix,
        delete=False,
    )

    try:
        temp_file.write(image["data"])
        temp_file.flush()
        return temp_file.name
    finally:
        temp_file.close()