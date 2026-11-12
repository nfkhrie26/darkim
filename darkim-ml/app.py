import io
import time
import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from PIL import Image

app = FastAPI(
    title="DARKIM Vision Engine API",
    description="Stateless extraction engine for packaging barcodes using YOLOv8, Morphology, and Multi-stage decoders.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "best.pt")
yolo_model = None

# Attempt to load YOLO model if best.pt is placed
if os.path.exists(MODEL_PATH):
    try:
        from ultralytics import YOLO
        yolo_model = YOLO(MODEL_PATH)
        print(f"[ML-Engine] Loaded YOLOv8 weights from {MODEL_PATH}")
    except Exception as e:
        print(f"[ML-Engine] Note: Could not load YOLO model: {e}")
else:
    print(f"[ML-Engine] best.pt not found at {MODEL_PATH}. Using OpenCV / Multi-angle morphology fallback.")

def verify_gs1_checksum(code: str) -> bool:
    """Validate GS1 Checksum for EAN-13 or UPC-A"""
    digits = [int(c) for c in code if c.isdigit()]
    if len(digits) not in [8, 12, 13, 14]:
        return False

    check_digit = digits[-1]
    payload = digits[:-1]
    
    # Calculate checksum from right to left
    total = 0
    multiplier = 3
    for d in reversed(payload):
        total += d * multiplier
        multiplier = 1 if multiplier == 3 else 3
        
    calculated_check = (10 - (total % 10)) % 10
    return calculated_check == check_digit

def decode_barcode_image(cv_img: np.ndarray) -> Optional[Dict[str, Any]]:
    """Decode barcode with multi-angle rotation, pyzbar and OpenCV"""
    # Try pyzbar if available
    try:
        from pyzbar.pyzbar import decode, ZBarSymbol
        # Check standard angles: 0, 90, 180, 270
        for angle in [0, 90, 270, 180]:
            if angle == 0:
                rotated = cv_img
            elif angle == 90:
                rotated = np.rot90(cv_img, 1)
            elif angle == 180:
                rotated = np.rot90(cv_img, 2)
            else:
                rotated = np.rot90(cv_img, 3)

            decoded = decode(rotated, symbols=[ZBarSymbol.EAN13, ZBarSymbol.UPCA, ZBarSymbol.EAN8, ZBarSymbol.CODE128])
            for item in decoded:
                code_str = item.data.decode("utf-8", errors="ignore").strip()
                if code_str:
                    return {
                        "barcode": code_str,
                        "stage": f"pyzbar_rot_{angle}",
                        "confidence": 0.95 if verify_gs1_checksum(code_str) else 0.80,
                    }
    except Exception:
        pass

    # Try OpenCV Barcode detector if pyzbar is not installed or didn't find
    try:
        import cv2
        detector = cv2.barcode_BarcodeDetector()
        ok, decoded_info, decoded_type, points = detector.detectAndDecode(cv_img)
        if ok and decoded_info:
            first_val = decoded_info[0] if isinstance(decoded_info, (list, tuple)) else decoded_info
            if first_val and str(first_val).strip():
                return {
                    "barcode": str(first_val).strip(),
                    "stage": "opencv_barcode_detector",
                    "confidence": 0.90,
                }
    except Exception:
        pass

    return None

@app.get("/")
def root():
    return {
        "service": "DARKIM ML Vision Engine",
        "status": "ready",
        "yolo_active": yolo_model is not None,
    }

@app.post("/api/v1/extract-barcode")
async def extract_barcode(file: UploadFile = File(...)):
    start_time = time.time()
    try:
        contents = await file.read()
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
        cv_img = np.array(pil_image)

        boxes = []
        best_barcode = None
        best_stage = "direct_pass"
        best_conf = 0.0

        # Step 1: Run YOLO if available to crop region
        if yolo_model is not None:
            results = yolo_model(cv_img, verbose=False)
            for r in results:
                if len(r.boxes) > 0:
                    for b in r.boxes:
                        xyxy = b.xyxy[0].cpu().numpy().tolist()
                        conf = float(b.conf[0].cpu().numpy())
                        boxes.append({"xyxy": xyxy, "confidence": conf})

                        # Crop barcode ROI
                        x1, y1, x2, y2 = map(int, xyxy)
                        h, w, _ = cv_img.shape
                        x1, y1 = max(0, x1 - 10), max(0, y1 - 10)
                        x2, y2 = min(w, x2 + 10), min(h, y2 + 10)
                        cropped = cv_img[y1:y2, x1:x2]

                        decoded = decode_barcode_image(cropped)
                        if decoded:
                            best_barcode = decoded["barcode"]
                            best_stage = "yolo_roi_" + decoded["stage"]
                            best_conf = decoded["confidence"]
                            break
                if best_barcode:
                    break

        # Step 2: Fallback to full frame multi-angle decoding
        if not best_barcode:
            decoded = decode_barcode_image(cv_img)
            if decoded:
                best_barcode = decoded["barcode"]
                best_stage = decoded["stage"]
                best_conf = decoded["confidence"]

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        if best_barcode:
            return {
                "success": True,
                "barcode": best_barcode,
                "boxes": boxes,
                "confidence": best_conf,
                "stage": best_stage,
                "time_ms": elapsed_ms,
            }
        else:
            return {
                "success": False,
                "barcode": None,
                "boxes": boxes,
                "confidence": 0.0,
                "stage": "not_detected",
                "time_ms": elapsed_ms,
                "message": "Barcode tidak terdeteksi pada citra. Harap ulangi foto dengan barcode lebih jelas dan tegak lurus.",
            }
    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return {
          "success": False,
          "error": str(e),
          "time_ms": elapsed_ms,
          "message": f"Terjadi kesalahan saat memproses gambar: {str(e)}",
        }

