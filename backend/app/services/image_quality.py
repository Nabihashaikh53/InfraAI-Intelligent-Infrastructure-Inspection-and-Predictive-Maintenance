import cv2
import numpy as np

# --- Configurable thresholds (documented, not magic numbers) ---
BLUR_THRESHOLD = 100.0        # Laplacian variance below this = too blurry
BRIGHTNESS_MIN = 50.0         # mean pixel value below this = too dark (0-255 scale)
BRIGHTNESS_MAX = 200.0        # mean pixel value above this = too bright
CONTRAST_THRESHOLD = 30.0     # std deviation below this = low contrast

SUITABLE_SCORE_THRESHOLD = 50  # overall score >= this => "suitable"


def compute_blur_score(gray_image: np.ndarray) -> float:
    """Higher value = sharper image. Uses variance of the Laplacian."""
    return cv2.Laplacian(gray_image, cv2.CV_64F).var()


def compute_brightness_score(gray_image: np.ndarray) -> float:
    """Mean pixel intensity, 0 (black) to 255 (white)."""
    return float(np.mean(gray_image))


def compute_contrast_score(gray_image: np.ndarray) -> float:
    """Standard deviation of pixel intensities. Higher = more contrast."""
    return float(np.std(gray_image))


def assess_image_quality(image_path: str) -> dict:
    """
    Loads an image from disk and returns a quality assessment dict:
    { "score": int (0-100), "status": "suitable"|"unsuitable", "issues": [str, ...] }
    """
    image = cv2.imread(image_path)
    if image is None:
        return {
            "score": 0,
            "status": "unsuitable",
            "issues": ["unreadable_image"],
        }

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    blur = compute_blur_score(gray)
    brightness = compute_brightness_score(gray)
    contrast = compute_contrast_score(gray)

    issues = []

    if blur < BLUR_THRESHOLD:
        issues.append("excessive_blur")

    if brightness < BRIGHTNESS_MIN:
        issues.append("low_brightness")
    elif brightness > BRIGHTNESS_MAX:
        issues.append("excessive_brightness")

    if contrast < CONTRAST_THRESHOLD:
        issues.append("low_contrast")

    # --- Combine into a single 0-100 score ---
    # Each factor contributes up to ~33 points, scaled and capped.
    blur_component = min(33.0, (blur / BLUR_THRESHOLD) * 33.0)

    # Brightness: full marks at the midpoint of the acceptable range,
    # tapering off toward the edges.
    brightness_mid = (BRIGHTNESS_MIN + BRIGHTNESS_MAX) / 2
    brightness_range = (BRIGHTNESS_MAX - BRIGHTNESS_MIN) / 2
    brightness_distance = abs(brightness - brightness_mid)
    brightness_component = max(0.0, 33.0 * (1 - brightness_distance / brightness_range))

    contrast_component = min(34.0, (contrast / CONTRAST_THRESHOLD) * 34.0)

    total_score = round(blur_component + brightness_component + contrast_component)
    total_score = max(0, min(100, total_score))

    status = "suitable" if total_score >= SUITABLE_SCORE_THRESHOLD and not issues else "unsuitable"

    return {
        "score": total_score,
        "status": status,
        "issues": issues,
    }