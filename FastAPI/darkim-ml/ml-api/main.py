from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from extractor import extract_barcode_from_bytes

app = FastAPI(
    title="DARKIM Barcode Extraction API",
    description="Mikroservis Computer Vision (YOLOv8n + OpenCV + pyzbar + EasyOCR + GS1 Checksum)",
    version="5.0.0",
)

# Izinkan akses dari server Next.js di dalam monorepo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "DARKIM ML Barcode Extractor"}

@app.post("/api/v1/extract-barcode")
async def extract_barcode_endpoint(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File yang diunggah harus berupa gambar (.jpg, .png, .webp).")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="File gambar kosong.")

    result = extract_barcode_from_bytes(image_bytes)
    return result