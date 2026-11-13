from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from extractor import extract_barcode_from_bytes

app = FastAPI(
    title="DARKIM Barcode Extraction API",
    description="Mikroservis Computer Vision (YOLOv8n + OpenCV + pyzbar + EasyOCR + GS1 Checksum)",
    version="5.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return extract_barcode_from_bytes(image_bytes, fast_mode=is_fast_mode)