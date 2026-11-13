import time
import shutil
import tempfile
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

import cv2
import torch
import easyocr
import numpy as np
from pyzbar.pyzbar import decode as pyzbar_decode, ZBarSymbol
from ultralytics import YOLO

# =====================================================================
# 1. INISIALISASI MODEL SEKALI SAAT SERVER STARTUP (SINGLETON)
# =====================================================================
BASE_DIR = Path(__file__).resolve().parent
WEIGHTS_PATH = BASE_DIR / "models" / "best.pt"

# Salin best.pt ke folder Temp agar terhindar dari bug tanda petik pada "Arya's FILE"
SAFE_WEIGHTS_PATH = Path(tempfile.gettempdir()) / "darkim_best.pt"
if WEIGHTS_PATH.exists():
    shutil.copy2(WEIGHTS_PATH, SAFE_WEIGHTS_PATH)
    YOLO_DETECTOR = YOLO(str(SAFE_WEIGHTS_PATH))
else:
    YOLO_DETECTOR = YOLO("yolov8n.pt")

USE_GPU = torch.cuda.is_available()
OCR_READER = easyocr.Reader(["en", "id"], gpu=USE_GPU, verbose=False)

try:
    OPENCV_BARCODE_DETECTOR = cv2.barcode.BarcodeDetector()
except Exception:
    OPENCV_BARCODE_DETECTOR = None

OCR_CHAR_MAP = str.maketrans({
    "O": "0", "o": "0", "D": "0", "Q": "0",
    "I": "1", "l": "1", "|": "1", "!": "1",
    "Z": "2", "z": "2",
    "S": "5", "s": "5",
    "G": "6", "b": "6",
    "B": "8",
    "g": "9", "q": "9"
})

# =====================================================================
# 2. FUNGSI VALIDASI GS1 & PENGOLAHAN CITRA
# =====================================================================
def normalize_and_validate_gtin(code_str: str) -> Tuple[bool, str, str]:
    cleaned = "".join(ch for ch in str(code_str) if ch.isdigit())
    fmt = "EAN-13"
    if len(cleaned) == 12:
        fmt = "UPC-A (Normalized EAN-13)"
        cleaned = "0" + cleaned
    if len(cleaned) != 13 or len(set(cleaned)) == 1:
        return False, cleaned, fmt

    digits = [int(d) for d in cleaned]
    odd_sum = sum(digits[0:12:2])
    even_sum = sum(digits[1:12:2]) * 3
    calc_check = (10 - ((odd_sum + even_sum) % 10)) % 10
    return (calc_check == digits[12]), cleaned, fmt

def get_named_image_variations(img_bgr: np.ndarray) -> List[Tuple[str, np.ndarray]]:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(gray)
    sharp = cv2.addWeighted(clahe, 1.8, cv2.GaussianBlur(clahe, (0, 0), 2.0), -0.8, 0)
    thresh = cv2.adaptiveThreshold(
        sharp, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 10
    )
    return [
        ("Original", img_bgr),
        ("Grayscale", gray),
        ("CLAHE", clahe),
        ("Sharpened", sharp),
        ("AdaptiveThreshold", thresh),
    ]

def localize_barcode_candidates_cv(img_bgr: np.ndarray, fast_mode: bool = False) -> List[Tuple[int, int, int, int]]:
    H, W = img_bgr.shape[:2]
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gradX = cv2.Sobel(gray, ddepth=cv2.CV_32F, dx=1, dy=0, ksize=-1)
    gradY = cv2.Sobel(gray, ddepth=cv2.CV_32F, dx=0, dy=1, ksize=-1)
    boxes = []
    max_contours = 1 if fast_mode else 3

    for diff, ksize in [(cv2.subtract(gradX, gradY), (21, 7)), (cv2.subtract(gradY, gradX), (7, 21))]:
        grad = cv2.convertScaleAbs(diff)
        blurred = cv2.blur(grad, (5, 5))
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, ksize)
        closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        closed = cv2.erode(closed, None, iterations=2)
        closed = cv2.dilate(closed, None, iterations=3)
        cnts, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cnts = sorted(cnts, key=cv2.contourArea, reverse=True)[:max_contours]
        for c in cnts:
            x, y, w, h = cv2.boundingRect(c)
            if w > 25 and h > 25 and (w * h) > 0.005 * (W * H):
                boxes.append((x, y, x + w, y + h))

    if not fast_mode:
        boxes.append((int(W * 0.45), int(H * 0.50), W, H))
        boxes.append((0, int(H * 0.25), int(W * 0.60), H))
        boxes.append((0, int(H * 0.50), W, H))
    return boxes

def progressive_upscale(crop_img: np.ndarray, iter_level: int = 1) -> np.ndarray:
    h, w = crop_img.shape[:2]
    scale = 1.0
    if iter_level == 1 and min(h, w) < 380:
        scale = min(3.0, max(2.0, 380 / max(1, min(h, w))))
    elif iter_level == 2:
        scale = 3.5
    elif iter_level == 3:
        scale = 4.0
    if scale > 1.0:
        return cv2.resize(crop_img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    return crop_img

def rotate_image_by_angle(img_in: np.ndarray, angle: int) -> np.ndarray:
    if angle == 90:
        return cv2.rotate(img_in, cv2.ROTATE_90_CLOCKWISE)
    elif angle == 270:
        return cv2.rotate(img_in, cv2.ROTATE_90_COUNTERCLOCKWISE)
    elif angle == 180:
        return cv2.rotate(img_in, cv2.ROTATE_180)
    return img_in

def decode_bars_multi_engine(img_input: np.ndarray) -> Optional[Tuple[str, str]]:
    try:
        decoded_list = pyzbar_decode(img_input, symbols=[ZBarSymbol.EAN13, ZBarSymbol.UPCA])
    except Exception:
        decoded_list = pyzbar_decode(img_input)
    for obj in decoded_list:
        raw_c = obj.data.decode("utf-8", errors="ignore").strip()
        is_ok, norm_c, fmt = normalize_and_validate_gtin(raw_c)
        if is_ok:
            return norm_c, fmt
    if OPENCV_BARCODE_DETECTOR is not None:
        try:
            img_for_cv = cv2.cvtColor(img_input, cv2.COLOR_GRAY2BGR) if len(img_input.shape) == 2 else img_input
            res_cv = OPENCV_BARCODE_DETECTOR.detectAndDecode(img_for_cv)
            if res_cv and res_cv[0]:
                is_ok, norm_c, fmt = normalize_and_validate_gtin(str(res_cv[0]).strip())
                if is_ok:
                    return norm_c, fmt
        except Exception:
            pass
    return None

def extract_ean13_from_ocr_tokens(ocr_result) -> Optional[Tuple[str, str]]:
    cleaned_tokens = []
    for _, text, conf in ocr_result:
        if conf < 0.40:
            continue
        mapped = str(text).translate(OCR_CHAR_MAP)
        digits = "".join(ch for ch in mapped if ch.isdigit())
        if digits:
            cleaned_tokens.append(digits)
    n = len(cleaned_tokens)
    for i in range(n):
        for w in range(1, min(5, n - i + 1)):
            cand_str = "".join(cleaned_tokens[i : i + w])
            for length_target in [13, 12]:
                if len(cand_str) >= length_target:
                    for s_idx in range(len(cand_str) - length_target + 1):
                        sub = cand_str[s_idx : s_idx + length_target]
                        is_ok, norm_c, fmt = normalize_and_validate_gtin(sub)
                        if is_ok:
                            return norm_c, fmt
    return None

def strict_ocr_barcode_progressive(img_crop: np.ndarray, iter_level: int = 1) -> Optional[Tuple[str, str]]:
    upscaled = progressive_upscale(img_crop, iter_level)
    for angle in [0, 90, 270, 180]:
        rot = rotate_image_by_angle(upscaled, angle)
        gray = cv2.cvtColor(rot, cv2.COLOR_BGR2GRAY) if len(rot.shape) == 3 else rot
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(gray)
        for ocr_in in [rot, clahe]:
            ocr_texts = OCR_READER.readtext(ocr_in, detail=1)
            found = extract_ean13_from_ocr_tokens(ocr_texts)
            if found:
                return found
    return None

# =====================================================================
# 3. FUNGSI UTAMA EKSTRAKSI DARI BYTES GAMBAR
# =====================================================================
def extract_barcode_from_bytes(image_bytes: bytes, fast_mode: bool = False) -> Dict[str, Any]:
    t0 = time.time()
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {
            "success": False,
            "barcode": None,
            "format": None,
            "method_used": "Invalid Image Bytes",
            "confidence_score": 0.0,
            "bbox": [],
            "processing_time_ms": 0.0,
        }

    H, W = img.shape[:2]
    candidate_boxes = []
    res = YOLO_DETECTOR.predict(img, conf=0.20, verbose=False)
    for r in res:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            candidate_boxes.append(("YOLOv8n Crop", [x1, y1, x2, y2]))

    for (mx1, my1, mx2, my2) in localize_barcode_candidates_cv(img, fast_mode=fast_mode):
        candidate_boxes.append(("Morfologi Sobel 2-Arah", [mx1, my1, mx2, my2]))
    candidate_boxes.append(("Full Image Scan", [0, 0, W, H]))

    # TAHAP A1: Uji 4 Filter Bersih (Original, Grayscale, CLAHE, Sharpened) di 4 Sudut Rotasi
    for stage_label, (x1, y1, x2, y2) in candidate_boxes:
        pad = 20 if stage_label != "Full Image Scan" else 0
        crop = img[max(0, y1 - pad) : min(H, y2 + pad), max(0, x1 - pad) : min(W, x2 + pad)]
        if crop.size == 0:
            continue
        crop_up = progressive_upscale(crop, iter_level=1)

        for angle in [0, 90, 270, 180]:
            crop_rot = rotate_image_by_angle(crop_up, angle)
            for filt_name, var_img in get_named_image_variations(crop_rot)[:4]:
                decoded = decode_bars_multi_engine(var_img)
                if decoded:
                    code, fmt = decoded
                    return {
                        "success": True,
                        "barcode": code,
                        "format": fmt,
                        "method_used": f"{stage_label} + Rotasi {angle}° + {filt_name} + pyzbar",
                        "confidence_score": 99.8,
                        "bbox": [x1, y1, x2, y2] if stage_label != "Full Image Scan" else [],
                        "processing_time_ms": round((time.time() - t0) * 1000, 1),
                    }

        # TAHAP A2: Uji filter ke-5 (AdaptiveThreshold) jika 4 filter bersih belum berhasil
        if not fast_mode:
            for angle in [0, 90, 270, 180]:
                crop_rot = rotate_image_by_angle(crop_up, angle)
                filt_name, var_img = get_named_image_variations(crop_rot)[4]
                decoded = decode_bars_multi_engine(var_img)
                if decoded:
                    code, fmt = decoded
                    return {
                        "success": True,
                        "barcode": code,
                        "format": fmt,
                        "method_used": f"{stage_label} + Rotasi {angle}° + {filt_name} + pyzbar",
                        "confidence_score": 99.1,
                        "bbox": [x1, y1, x2, y2] if stage_label != "Full Image Scan" else [],
                        "processing_time_ms": round((time.time() - t0) * 1000, 1),
                    }

    # Jika mode="fast" (streaming kamera otomatis), hentikan di sini agar respons instan (<100 ms)
    if fast_mode:
        return {
            "success": False,
            "barcode": None,
            "format": None,
            "method_used": "Fast Stream (Belum Terdeteksi)",
            "confidence_score": 0.0,
            "bbox": candidate_boxes[0][1] if candidate_boxes and candidate_boxes[0][0] == "YOLOv8n Crop" else [],
            "processing_time_ms": round((time.time() - t0) * 1000, 1),
        }

    # TAHAP B: Mode "deep" (Unggah Foto / Jepret Detail) -> EasyOCR + Progressive Zoom + GS1 Checksum
    for iter_lvl in [1, 2, 3]:
        for stage_label, (x1, y1, x2, y2) in candidate_boxes:
            if stage_label == "Full Image Scan" and iter_lvl > 1:
                continue
            pad = 20 if stage_label != "Full Image Scan" else 0
            crop = img[max(0, y1 - pad) : min(H, y2 + pad), max(0, x1 - pad) : min(W, x2 + pad)]
            if crop.size == 0:
                continue
            ocr_found = strict_ocr_barcode_progressive(crop, iter_level=iter_lvl)
            if ocr_found:
                code, fmt = ocr_found
                return {
                    "success": True,
                    "barcode": code,
                    "format": fmt,
                    "method_used": f"{stage_label} + EasyOCR (Zoom Lvl {iter_lvl}) + GS1 Checksum",
                    "confidence_score": round(99.5 - (iter_lvl * 1.5), 1),
                    "bbox": [x1, y1, x2, y2] if stage_label != "Full Image Scan" else [],
                    "processing_time_ms": round((time.time() - t0) * 1000, 1),
                }

    return {
        "success": False,
        "barcode": None,
        "format": None,
        "method_used": "Gagal Terbaca",
        "confidence_score": 0.0,
        "bbox": [],
        "processing_time_ms": round((time.time() - t0) * 1000, 1),
    }