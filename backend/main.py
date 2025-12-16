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

# ... (existing code: root, health, predict)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

