import cv2
import os
from ultralytics import YOLO
import requests
from dotenv import load_dotenv
import time
from threading import Thread
import numpy as np
import base64

load_dotenv()

MODEL_PATH = "best.pt"
BOT_TOKEN = os.getenv("BOT_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")

class YoloService:
    def __init__(self):
        self.model = None
        self.last_alert_time = 0
        self.alert_cooldown = 30  # seconds
        try:
            self.model = YOLO(MODEL_PATH)
            print(f"✅ YOLOv8 Model loaded from {MODEL_PATH}")
        except Exception as e:
            print(f"⚠️ Error loading YOLO model: {e}")

    def send_telegram_alert(self, message):
        if not BOT_TOKEN or not CHAT_ID:
            print("⚠️ Telegram credentials not set")
            return

        current_time = time.time()
        if current_time - self.last_alert_time < self.alert_cooldown:
            return

        def _send():
            url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
            payload = {
                'chat_id': CHAT_ID,
                'text': message
            }
            try:
                requests.post(url, data=payload)
                self.last_alert_time = current_time
                print("✅ Telegram alert sent")
            except Exception as e:
                print(f"❌ Telegram alert failed: {e}")

        Thread(target=_send).start()

    def generate_frames(self):
        # Open webcam
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Could not open webcam")
            return

        while True:
            success, frame = cap.read()
            if not success:
                break

            if self.model:
                results = self.model(frame, verbose=False)
                
                fire_detected = False
                for result in results:
                    boxes = result.boxes
                    for box in boxes:
                        cls = int(box.cls[0])
                        # Assuming 0: Smoke, 1: Fire based on previous app.py
                        # But YOLO typically uses COCO classes unless trained.
                        # The user provided a custom model 'best.pt' which is likely trained on Fire/Smoke.
                        # Let's trust the model's classes.
                        class_name = self.model.names[cls]
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        conf = float(box.conf[0])

                        # Draw box
                        color = (0, 0, 255) if 'Fire' in class_name or 'fire' in class_name else (255, 165, 0)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                        cv2.putText(frame, f"{class_name} {conf:.2f}", (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                        if 'Fire' in class_name or 'fire' in class_name:
                            fire_detected = True

                if fire_detected:
                    self.send_telegram_alert("🔥 FIRE DETECTED! Immediate action required.")

            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

        cap.release()

    def process_image(self, image_bytes):
        if not self.model:
            return None, {"error": "Model not loaded"}
        
        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return None, {"error": "Could not decode image"}

        # Run inference
        results = self.model(frame)
        
        detections = []
        fire_detected = False
        
        # Override class names if needed (Fix for inverted labels)
        # Assuming model sees class 1 as Fire, but metadata says Smoke
        CUSTOM_NAMES = {0: 'Smoke', 1: 'Fire'}

        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls = int(box.cls[0])
                # class_name = self.model.names[cls] # Original
                class_name = CUSTOM_NAMES.get(cls, self.model.names[cls])
                
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                
                detections.append({
                    "class": class_name,
                    "confidence": conf,
                    "box": [x1, y1, x2, y2]
                })

                # Draw box
                color = (0, 0, 255) if 'Fire' in class_name or 'fire' in class_name else (0, 255, 0)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"{class_name} {conf:.2f}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                
                if 'Fire' in class_name or 'fire' in class_name:
                    fire_detected = True

        if fire_detected:
            self.send_telegram_alert("🔥 FIRE DETECTED in uploaded image!")

        # Encode back to jpg
        _, buffer = cv2.imencode('.jpg', frame)
        encoded_image = base64.b64encode(buffer).decode('utf-8')
        
        return encoded_image, detections

    def process_video(self, video_path, output_path):
        if not self.model:
            return False, "Model not loaded"
            
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return False, "Could not open video"
            
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        # Define codec and create VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*'mp4v') 
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        frame_count = 0
        fire_frames = 0
        
        # Override class names
        CUSTOM_NAMES = {0: 'Smoke', 1: 'Fire'}

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            results = self.model(frame, verbose=False)
            
            frame_fire_detected = False
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    cls = int(box.cls[0])
                    # class_name = self.model.names[cls]
                    class_name = CUSTOM_NAMES.get(cls, self.model.names[cls])

                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    
                    color = (0, 0, 255) if 'Fire' in class_name or 'fire' in class_name else (0, 255, 0)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, f"{class_name} {conf:.2f}", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                                
                    if 'Fire' in class_name or 'fire' in class_name:
                        frame_fire_detected = True
            
            if frame_fire_detected:
                fire_frames += 1
                
            out.write(frame)
            
        cap.release()
        out.release()
        
        if fire_frames > 0:
            self.send_telegram_alert(f"🔥 FIRE DETECTED in uploaded video! ({fire_frames} frames)")
            
        return True, "Video processed successfully"

yolo_service = YoloService()
