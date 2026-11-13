import asyncio
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from extractor import extract_barcode_from_bytes

app = FastAPI(
    title="DARKIM Barcode Extraction API",
    description="Mikroservis Computer Vision (YOLOv8n + OpenCV + pyzbar + EasyOCR + GS1 Checksum)",
    version="5.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kunci pengaman agar frame auto-scan tidak menumpuk di antrean CPU
SCAN_LOCK = asyncio.Lock()

@app.get("/")
async def root():
    return {"status": "online", "message": "DARKIM ML API aktif. Buka /docs untuk menguji endpoint."}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "DARKIM ML Barcode Extractor"}

@app.post("/api/v1/extract-barcode")
async def extract_barcode_endpoint(
    file: UploadFile = File(...),
    mode: str = Form("deep"),  # "fast" untuk auto-scan kamera realtime, "deep" untuk upload/jepret manual
):
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="File gambar kosong.")

    is_fast_mode = mode.strip().lower() == "fast"

    # Jika mode="fast" dan server masih sibuk memproses frame sebelumnya,
    # langsung lewati (skip) agar tidak terjadi antrean 9k-30k ms
    if is_fast_mode and SCAN_LOCK.locked():
        return {
            "success": False,
            "barcode": None,
            "format": None,
            "method_used": "Fast Stream (Skip - Server Masih Memproses Frame Sebelumnya)",
            "confidence_score": 0.0,
            "bbox": [],
            "processing_time_ms": 0.1,
        }

    async with SCAN_LOCK:
        # Jalankan fungsi CPU-bound di thread terpisah agar event loop FastAPI tidak pernah macet
        return await asyncio.to_thread(extract_barcode_from_bytes, image_bytes, is_fast_mode)