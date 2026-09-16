import cv2
import numpy as np
from PIL import Image

def preprocess_image_for_ocr(image_input):
    """
    OpenCV preprocessing pipeline for scanned/degraded documents:
    1. Convert to grayscale
    2. Denoise with Gaussian / Median filter
    3. Contrast stretching / Adaptive thresholding
    4. Deskew image using minAreaRect / Hough lines
    """
    if isinstance(image_input, str):
        cv_img = cv2.imread(image_input)
    elif isinstance(image_input, Image.Image):
        cv_img = cv2.cvtColor(np.array(image_input), cv2.COLOR_RGB2BGR)
    elif isinstance(image_input, np.ndarray):
        cv_img = image_input.copy()
    else:
        raise ValueError("Unsupported image input format")

    if cv_img is None:
        raise ValueError("Could not load image for preprocessing")

    # 1. Grayscale
    if len(cv_img.shape) == 3:
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    else:
        gray = cv_img

    # 2. Denoise
    denoised = cv2.medianBlur(gray, 3)

    # 3. Deskew
    deskewed, angle = deskew_image(denoised)

    # 4. Contrast normalization / Otsu Thresholding
    thresh = cv2.adaptiveThreshold(
        deskewed, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    return thresh, deskewed, angle

def deskew_image(gray_img):
    """Calculates skew angle and rotates image straight"""
    coords = np.column_stack(np.where(gray_img < 128))
    if len(coords) < 50:
        return gray_img, 0.0

    angle = 0.0
    try:
        rect = cv2.minAreaRect(coords)
        angle = rect[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        # If angle is small or negligible, limit rotation
        if abs(angle) > 0.3 and abs(angle) < 45:
            (h, w) = gray_img.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            rotated = cv2.warpAffine(
                gray_img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
            )
            return rotated, angle
    except Exception:
        pass

    return gray_img, 0.0
