from pathlib import Path
from ultralytics import YOLO


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = Path(__file__).parent / "weights" / "best.pt"

# --- Inference settings ---
# CONF_THRESHOLD: replace 0.40 with the peak of BoxF1_curve.png from your
# validation run (runs/detect/val/). That peak is the confidence where precision
# and recall balance best for this model.
CONF_THRESHOLD = 0.40
IOU_THRESHOLD = 0.50     # NMS overlap; reduces duplicate boxes on the same crack
IMAGE_SIZE = 640         # must match training resolution
MIN_BOX_AREA = 400       # px^2; drops tiny boxes that are almost always noise

MODEL_VERSION = "yolov8n-concrete-crack-v1"   # update if you retrain

model = YOLO(str(MODEL_PATH))


def _normalize_class_name(raw_name: str) -> str:
    """The Roboflow export leaks its project name into the class label.
    This model has a single class, so map anything crack-like to a clean label."""
    if "crack" in raw_name.lower():
        return "concrete-crack"
    return raw_name


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

    results = model.predict(
        source=str(full_image_path),
        conf=CONF_THRESHOLD,
        iou=IOU_THRESHOLD,
        imgsz=IMAGE_SIZE,
        verbose=False,
    )

    detections = []

    for result in results:
        if result.boxes is None:
            continue

        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            if (x2 - x1) * (y2 - y1) < MIN_BOX_AREA:
                continue

            class_name = _normalize_class_name(result.names[class_id])

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