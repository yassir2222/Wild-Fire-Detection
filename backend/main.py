from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from PIL import Image
import io
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

app = FastAPI(title="WildfireGuard AI API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Add frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
MODEL_PATH = "mobilenetv2_fire_detector.h5"
try:
    model = load_model(MODEL_PATH)
    print(f"✅ Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"⚠️ Error loading model: {e}")
    model = None

# Class labels from the notebook
CLASS_NAMES = {0: 'Smoke', 1: 'Fire', 2: 'Non Fire'}

@app.get("/")
def read_root():
    return {"message": "WildfireGuard AI System Online", "status": "active"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return {"error": "Model not loaded"}
    
    try:
        # Read and preprocess image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image = image.resize((224, 224))
        img_array = np.array(image)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        # Predict
        predictions = model.predict(img_array)
        score = tf.nn.softmax(predictions[0]) # Depending on model output, this might be redundant if last layer is already softmax
        # With loaded .h5 having softmax, predictions[0] are probs. 
        # But let's check notebook: "predictions = Dense(3, activation='softmax')(x)"
        # So raw output IS probabilities.
        
        class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        predicted_class = CLASS_NAMES.get(class_idx, "Unknown")

        return {
            "prediction": predicted_class,
            "confidence": confidence,
            "raw_scores": {CLASS_NAMES[i]: float(predictions[0][i]) for i in range(3)}
        }
    except Exception as e:
        return {"error": str(e)}


from fastapi.responses import StreamingResponse
from yolo_service import yolo_service

# ... (existing code: imports, app setup, model loading)

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(yolo_service.generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")


import shutil
import os
from fastapi.responses import FileResponse

@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        return {"error": "File must be an image"}
    
    contents = await file.read()
    encoded_image, detections = yolo_service.process_image(contents)
    
    if encoded_image is None:
        return {"error": detections.get("error", "Unknown error")}
        
    return {
        "image": encoded_image,
        "detections": detections,
        "count": len(detections)
    }

@app.post("/detect/video")
async def detect_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        return {"error": "File must be a video"}
        
    # Save temp input file
    temp_input = f"temp_{file.filename}"
    with open(temp_input, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Output path
    output_filename = f"processed_{file.filename}"
    
    success, message = yolo_service.process_video(temp_input, output_filename)
    
    # Clean up input
    os.remove(temp_input)
    
    if not success:
        return {"error": message}
        
    return FileResponse(output_filename, media_type="video/mp4", filename=output_filename)


from prediction_service import prediction_service
from firms_service import firms_service
from pydantic import BaseModel

class PredictionRequest(BaseModel):
    latitude: float
    longitude: float
    brightness: float
    confidence: str

@app.post("/predict/wildfire")
def predict_wildfire(data: PredictionRequest):
    result = prediction_service.calculate_spread(data.brightness, data.confidence)
    return {
        "location": {"lat": data.latitude, "lng": data.longitude},
        "prediction": result
    }

@app.get("/api/wildfire/realtime")
def get_realtime_wildfire(region: str = "global"):
    """
    Get real-time wildfire data from NASA FIRMS.
    """
    return firms_service.get_realtime_data(region)


# ============================================================
# SATELLITE MONITORING ENDPOINTS
# ============================================================

from sentinel_service import sentinel_service
from email_service import email_service
from monitoring_service import monitoring_service
from typing import Optional, List

class SatelliteScanRequest(BaseModel):
    zone_name: Optional[str] = None
    use_fire_script: bool = True

class MonitoringStartRequest(BaseModel):
    interval_hours: float = 6.0
    
class EmailTestRequest(BaseModel):
    recipient: str

@app.get("/api/satellite/status")
def get_satellite_status():
    """Get satellite monitoring status and service availability."""
    return monitoring_service.get_status()

@app.get("/api/satellite/zones")
def get_satellite_zones():
    """Get list of available Morocco scan zones."""
    return {
        "zones": sentinel_service.get_zones(),
        "service_available": sentinel_service.is_available()
    }

@app.post("/api/satellite/scan")
def scan_satellite(request: SatelliteScanRequest = None):
    """
    Manually trigger a satellite scan.
    If zone_name provided, scans single zone. Otherwise scans all zones.
    """
    if not sentinel_service.is_available():
        return {"error": "Sentinel Hub not configured. Check credentials in .env"}
    
    if request and request.zone_name:
        result = monitoring_service.scan_zone_for_fire(request.zone_name)
        return {"scan_type": "single", "result": result}
    else:
        results = monitoring_service.run_full_scan()
        fires_detected = [r for r in results if r.get("is_fire")]
        return {
            "scan_type": "full",
            "zones_scanned": len(results),
            "fires_detected": len(fires_detected),
            "results": results
        }

@app.post("/api/satellite/start")
def start_satellite_monitoring(request: MonitoringStartRequest = None):
    """Start automated satellite monitoring."""
    interval = request.interval_hours if request else 6.0
    return monitoring_service.start_monitoring(interval_hours=interval)

@app.post("/api/satellite/stop")
def stop_satellite_monitoring():
    """Stop automated satellite monitoring."""
    return monitoring_service.stop_monitoring()

@app.get("/api/satellite/history")
def get_satellite_history(limit: int = 10):
    """Get recent detection history."""
    return {
        "history": monitoring_service.get_history(limit),
        "total_scans": len(monitoring_service.detection_history)
    }

@app.post("/api/satellite/test-email")
def test_email_notification(request: EmailTestRequest):
    """Send a test email to verify notification settings."""
    if not email_service.is_available():
        return {"error": "Email service not configured. Check SMTP settings in .env"}
    return email_service.send_test_email(request.recipient)

@app.get("/api/satellite/image/{zone_name}")
def get_zone_image(zone_name: str, fire_script: bool = False):
    """Get satellite image for a specific zone."""
    if not sentinel_service.is_available():
        return {"error": "Sentinel Hub not configured"}
    
    result = sentinel_service.scan_zone(zone_name, use_fire_script=fire_script)
    
    if "error" in result:
        return result
    
    return {
        "zone": zone_name,
        "image_base64": result.get("image_base64"),
        "metadata": result.get("metadata")
    }

# ============================================================
# TEST NOTIFICATION ENDPOINTS
# ============================================================

@app.post("/api/test/telegram")
def test_telegram_notification():
    """
    Send a mock fire alert to Telegram for testing purposes.
    Uses simulated data to verify notification formatting.
    """
    from datetime import datetime
    
    # Create mock detection result
    mock_result = {
        "zone": "Rif (TEST)",
        "prediction": "Fire",
        "confidence": 0.923,
        "coordinates": (35.1234, -4.5678),
        "timestamp": datetime.now().isoformat(),
        "brightness": 356.7,
        "spread_radius": 5.2,
        "image_base64": None  # No image for quick test
    }
    
    # Use the monitoring service's telegram method
    monitoring_service._send_telegram_alert(mock_result)
    
    return {
        "success": True,
        "message": "Mock Telegram alert sent. Check your Telegram bot.",
        "mock_data": mock_result
    }

@app.post("/api/test/email")
def test_email_mock_alert():
    """
    Send a mock fire alert email for testing purposes.
    """
    if not email_service.is_available():
        return {"error": "Email service not configured. Check SMTP settings in .env"}
    
    # Create mock detection result
    mock_result = {
        "zone": "Middle Atlas (TEST)",
        "prediction": "Fire",
        "confidence": 0.876,
        "coordinates": (33.5000, -5.0000),
        "image_base64": None
    }
    
    result = email_service.send_alert(
        zone_name=mock_result["zone"],
        coordinates=mock_result["coordinates"],
        confidence=mock_result["confidence"],
        prediction=mock_result["prediction"],
        image_base64=mock_result.get("image_base64")
    )
    
    return {
        "success": result.get("success", False),
        "message": "Mock email alert sent." if result.get("success") else result.get("error"),
        "recipients": result.get("recipients"),
        "mock_data": mock_result
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

