import time
import shutil
import tempfile
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple, Iterator

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
ONNX_PATH = BASE_DIR / "models" / "best.onnx"
WEIGHTS_PATH = BASE_DIR / "models" / "best.pt"

SAFE_TEMP_DIR = Path(tempfile.gettempdir())
if ONNX_PATH.exists():
    SAFE_MODEL_PATH = SAFE_TEMP_DIR / "darkim_best.onnx"
    shutil.copy2(ONNX_PATH, SAFE_MODEL_PATH)
    YOLO_DETECTOR = YOLO(str(SAFE_MODEL_PATH), task="detect")
elif WEIGHTS_PATH.exists():
    SAFE_MODEL_PATH = SAFE_TEMP_DIR / "darkim_best.pt"
    shutil.copy2(WEIGHTS_PATH, SAFE_MODEL_PATH)
    YOLO_DETECTOR = YOLO(str(SAFE_MODEL_PATH))
else:
    YOLO_DETECTOR = YOLO("yolov8n.pt")

USE_GPU = torch.cuda.is_available()
OCR_READER = easyocr.Reader(["en"], gpu=USE_GPU, verbose=False)

try:
    OPENCV_BARCODE_DETECTOR = cv2.barcode.BarcodeDetector()
except Exception:
    OPENCV_BARCODE_DETECTOR = None

# =====================================================================
# 2. FUNGSI VALIDASI GS1, PENJAGA FRAME KOSONG & PENGOLAHAN CITRA
# =====================================================================
def is_blank_or_low_variance(img_bgr: np.ndarray, min_std: float = 10.0) -> bool:
    """Deteksi instan (<2 ms) jika kamera ditutup, gelap total, atau gambar polos."""
    small = cv2.resize(img_bgr, (160, 160), interpolation=cv2.INTER_NEAREST)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    return float(np.std(gray)) < min_std

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

def get_smart_angles(w: int, h: int) -> List[int]:
    """Urutkan sudut rotasi berdasarkan rasio aspek kotak agar tidak membuang waktu."""
    if w >= h:
        return [0, 180, 90, 270]
    return [90, 270, 0, 180]

def iter_image_variations(img_bgr: np.ndarray, include_thresh: bool = True) -> Iterator[Tuple[str, np.ndarray]]:
    """Lazy generator: hanya menghitung filter berikutnya jika filter sebelumnya gagal."""
    yield ("Original", img_bgr)

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    yield ("Grayscale", gray)

    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(gray)
    yield ("CLAHE", clahe)

    sharp = cv2.addWeighted(clahe, 1.8, cv2.GaussianBlur(clahe, (0, 0), 2.0), -0.8, 0)
    yield ("Sharpened", sharp)

    if include_thresh:
        thresh = cv2.adaptiveThreshold(
            sharp, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 10
        )
        yield ("AdaptiveThreshold", thresh)

def localize_barcode_candidates_cv(img_bgr: np.ndarray, fast_mode: bool = False) -> List[Tuple[int, int, int, int]]:
    H, W = img_bgr.shape[:2]
    max_dim = max(H, W)
    scale = 960.0 / max_dim if max_dim > 960 else 1.0
    small = cv2.resize(img_bgr, (int(W * scale), int(H * scale)), interpolation=cv2.INTER_AREA) if scale < 1.0 else img_bgr
    inv_scale = 1.0 / scale

    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    gradX = cv2.Sobel(gray, ddepth=cv2.CV_32F, dx=1, dy=0, ksize=-1)
    gradY = cv2.Sobel(gray, ddepth=cv2.CV_32F, dx=0, dy=1, ksize=-1)
    boxes = []
    max_contours = 1 if fast_mode else 2

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
            if w > 20 and h > 20 and (w * h) > 0.004 * (small.shape[0] * small.shape[1]):
                boxes.append((
                    int(x * inv_scale),
                    int(y * inv_scale),
                    int((x + w) * inv_scale),
                    int((y + h) * inv_scale),
                ))

    if not fast_mode:
        boxes.append((int(W * 0.45), int(H * 0.50), W, H))
        boxes.append((0, int(H * 0.50), W, H))
    return boxes

def progressive_upscale(crop_img: np.ndarray, iter_level: int = 1) -> np.ndarray:
    h, w = crop_img.shape[:2]
    scale = 1.0
    if iter_level == 1 and min(h, w) < 380:
        scale = min(3.0, max(2.0, 380 / max(1, min(h, w))))
    elif iter_level == 2:
        scale = 3.5
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
        digits = "".join(ch for ch in str(text) if ch.isdigit())
        if digits:
            cleaned_tokens.append(digits)
    n = len(cleaned_tokens)
    for i in range(n):
        for w in range(1, min(5, n - i + 1)):
            cand_str = "".join(cleaned_tokens[i : i + w])
            for length_target in (13, 12):
                if len(cand_str) >= length_target:
                    for s_idx in range(len(cand_str) - length_target + 1):
                        sub = cand_str[s_idx : s_idx + length_target]
                        is_ok, norm_c, fmt = normalize_and_validate_gtin(sub)
                        if is_ok:
                            return norm_c, fmt
    return None

def strict_ocr_barcode_progressive(
    img_crop: np.ndarray, iter_level: int = 1, deadline: Optional[float] = None
) -> Optional[Tuple[str, str]]:
    upscaled = progressive_upscale(img_crop, iter_level)
    h, w = upscaled.shape[:2]
    angles_order = get_smart_angles(w, h)[:2]  # Uji 2 orientasi utama agar OCR tidak boros waktu

    for angle in angles_order:
        if deadline and time.perf_counter() > deadline:
            return None
        rot = rotate_image_by_angle(upscaled, angle)
        gray = cv2.cvtColor(rot, cv2.COLOR_BGR2GRAY) if len(rot.shape) == 3 else rot
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(gray)

        for ocr_in in (rot, clahe):
            if deadline and time.perf_counter() > deadline:
                return None
            ocr_texts = OCR_READER.readtext(ocr_in, detail=1, allowlist="0123456789")
            found = extract_ean13_from_ocr_tokens(ocr_texts)
            if found:
                return found
    return None

# =====================================================================
# 3. FUNGSI UTAMA EKSTRAKSI DARI BYTES GAMBAR (SUPPORT FAST & DEEP MODE)
# =====================================================================
def extract_barcode_from_bytes(image_bytes: bytes, fast_mode: bool = False) -> Dict[str, Any]:
    t0 = time.perf_counter()
    # Batas waktu ketat: 1.2 detik untuk fast_mode, 4.5 detik untuk deep_mode
    deadline = t0 + (1.2 if fast_mode else 4.5)

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

    # PENGAMAN 1: Tolak instan jika kamera ditutup / gelap / gambar polos (< 2 ms)
    if is_blank_or_low_variance(img):
        return {
            "success": False,
            "barcode": None,
            "format": None,
            "method_used": "Frame Kosong / Kamera Tertutup",
            "confidence_score": 0.0,
            "bbox": [],
            "processing_time_ms": round((time.perf_counter() - t0) * 1000, 1),
        }

    H, W = img.shape[:2]
    candidate_boxes: List[Tuple[str, List[int]]] = []

    # 1. Deteksi YOLOv8n (urutkan dari confidence tertinggi)
    yolo_candidates = []
    res = YOLO_DETECTOR.predict(img, conf=0.20, imgsz=640, verbose=False)
    for r in res:
        for box in r.boxes:
            conf_val = float(box.conf[0].item())
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            yolo_candidates.append((conf_val, "YOLOv8n Crop", [x1, y1, x2, y2]))
    yolo_candidates.sort(key=lambda x: x[0], reverse=True)

    for _, lbl, box in yolo_candidates[:2]:
        candidate_boxes.append((lbl, box))

    # Short-circuit Sobel pada fast_mode jika YOLO sudah sangat yakin (conf >= 0.55)
    has_strong_yolo = bool(yolo_candidates and yolo_candidates[0][0] >= 0.55)
    if not (fast_mode and has_strong_yolo) and time.perf_counter() < deadline:
        for (mx1, my1, mx2, my2) in localize_barcode_candidates_cv(img, fast_mode=fast_mode):
            candidate_boxes.append(("Morfologi Sobel 2-Arah", [mx1, my1, mx2, my2]))

    candidate_boxes.append(("Full Image Scan", [0, 0, W, H]))

    # 2. TAHAP A: Dekode Garis 1D (pyzbar + OpenCV + Smart Angles + Lazy Filters)
    for stage_label, (x1, y1, x2, y2) in candidate_boxes:
        if time.perf_counter() > deadline:
            break

        pad = 30 if stage_label != "Full Image Scan" else 0
        crop = img[max(0, y1 - pad) : min(H, y2 + pad), max(0, x1 - pad) : min(W, x2 + pad)]
        if crop.size == 0:
            continue

        if stage_label == "Full Image Scan" and max(crop.shape[:2]) > 1600:
            s = 1600.0 / max(crop.shape[:2])
            crop_up = cv2.resize(crop, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        else:
            crop_up = progressive_upscale(crop, iter_level=1)

        ch, cw = crop_up.shape[:2]
        angles_order = get_smart_angles(cw, ch)
        if fast_mode:
            angles_order = angles_order[:2]

        for angle in angles_order:
            if time.perf_counter() > deadline:
                break
            crop_rot = rotate_image_by_angle(crop_up, angle)
            for filt_name, var_img in iter_image_variations(crop_rot, include_thresh=False):
                if time.perf_counter() > deadline:
                    break
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
                        "processing_time_ms": round((time.perf_counter() - t0) * 1000, 1),
                    }

        if not fast_mode and time.perf_counter() < deadline:
            for angle in angles_order:
                if time.perf_counter() > deadline:
                    break
                crop_rot = rotate_image_by_angle(crop_up, angle)
                gray = cv2.cvtColor(crop_rot, cv2.COLOR_BGR2GRAY)
                clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(gray)
                sharp = cv2.addWeighted(clahe, 1.8, cv2.GaussianBlur(clahe, (0, 0), 2.0), -0.8, 0)
                thresh = cv2.adaptiveThreshold(
                    sharp, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 10
                )
                decoded = decode_bars_multi_engine(thresh)
                if decoded:
                    code, fmt = decoded
                    return {
                        "success": True,
                        "barcode": code,
                        "format": fmt,
                        "method_used": f"{stage_label} + Rotasi {angle}° + AdaptiveThreshold + pyzbar",
                        "confidence_score": 99.1,
                        "bbox": [x1, y1, x2, y2] if stage_label != "Full Image Scan" else [],
                        "processing_time_ms": round((time.perf_counter() - t0) * 1000, 1),
                    }

    # Jika mode="fast" (auto-scan kamera realtime), langsung kembalikan hasil agar siap memproses frame berikutnya
    if fast_mode:
        return {
            "success": False,
            "barcode": None,
            "format": None,
            "method_used": "Fast Stream (Belum Terdeteksi)",
            "confidence_score": 0.0,
            "bbox": candidate_boxes[0][1] if candidate_boxes and candidate_boxes[0][0] == "YOLOv8n Crop" else [],
            "processing_time_ms": round((time.perf_counter() - t0) * 1000, 1),
        }

    # 3. TAHAP B: Cadangan EasyOCR dengan batas waktu (hanya untuk mode="deep")
    ocr_candidates = [c for c in candidate_boxes if c[0] != "Full Image Scan"][:2]
    if not ocr_candidates:
        ocr_candidates = candidate_boxes[:1]

    for iter_lvl in (1, 2):
        if time.perf_counter() > deadline:
            break
        for stage_label, (x1, y1, x2, y2) in ocr_candidates:
            if time.perf_counter() > deadline:
                break
            pad = 30 if stage_label != "Full Image Scan" else 0
            crop = img[max(0, y1 - pad) : min(H, y2 + pad), max(0, x1 - pad) : min(W, x2 + pad)]
            if crop.size == 0:
                continue
            ocr_found = strict_ocr_barcode_progressive(crop, iter_level=iter_lvl, deadline=deadline)
            if ocr_found:
                code, fmt = ocr_found
                return {
                    "success": True,
                    "barcode": code,
                    "format": fmt,
                    "method_used": f"{stage_label} + EasyOCR (Zoom Lvl {iter_lvl}) + GS1 Checksum",
                    "confidence_score": round(99.5 - (iter_lvl * 1.5), 1),
                    "bbox": [x1, y1, x2, y2] if stage_label != "Full Image Scan" else [],
                    "processing_time_ms": round((time.perf_counter() - t0) * 1000, 1),
                }

    return {
        "success": False,
        "barcode": None,
        "format": None,
        "method_used": "Gagal Terbaca",
        "confidence_score": 0.0,
        "bbox": [],
        "processing_time_ms": round((time.perf_counter() - t0) * 1000, 1),
    }