from pathlib import Path
from ultralytics import YOLO


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = Path(__file__).parent / "weights" / "best.pt"

model = YOLO(str(MODEL_PATH))


def detect_defects(image_path: str) -> list[dict]:
    """
    Run YOLO inference on an inspection image.

    Returns detected defects with confidence scores
    and bounding box coordinates.
    """

    full_image_path = BASE_DIR / image_path

    if not full_image_path.exists():
        raise FileNotFoundError(
            f"Inspection image not found: {full_image_path}"
        )

    results = model(str(full_image_path))

    detections = []

    for result in results:
        if result.boxes is None:
            continue

        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            class_name = result.names[class_id]

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append(
                {
                    "defectType": class_name,
                    "confidence": round(confidence, 4),
                    "boundingBox": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2),
                    },
                }
            )

    return detections