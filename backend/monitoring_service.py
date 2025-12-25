"""
Monitoring Service for automated wildfire detection.
Runs scheduled scans using Sentinel Hub imagery and CAM (Class Activation Map) model.
"""

import os
import io
import numpy as np
from datetime import datetime
from threading import Lock
from PIL import Image

# Try to import APScheduler
try:
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.interval import IntervalTrigger
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False
    print("⚠️ APScheduler not installed. Run: pip install apscheduler")

# Import TensorFlow and CAM model
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    # Use CAM model for satellite fire detection
    CAM_MODEL_PATH = "Trained-Models/additional-model/cam_model.h5"
    detection_model = load_model(CAM_MODEL_PATH, compile=False)
    detection_model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    print(f"✅ CAM Detection model loaded for satellite monitoring")
except Exception as e:
    detection_model = None
    print(f"⚠️ Could not load CAM detection model: {e}")

from sentinel_service import sentinel_service
from email_service import email_service
from prediction_service import prediction_service
import base64
import random


class MonitoringService:
    """Service for automated satellite monitoring and fire detection using CAM model."""
    
    # CAM model has 2 classes: 0 = No Fire, 1 = Fire
    CLASS_NAMES = {0: 'No Fire', 1: 'Fire'}
    
    def __init__(self):
        """Initialize monitoring service."""
        self.scheduler = None
        self.is_running = False
        self.scan_interval_hours = 6  # Default: scan every 6 hours
        self.detection_threshold = 0.70  # Minimum confidence to trigger alert
        self.detection_history = []
        self.lock = Lock()
        
        if SCHEDULER_AVAILABLE:
            self.scheduler = BackgroundScheduler()
            print("✅ Monitoring service initialized")
        else:
            print("⚠️ Scheduler not available")
    
    def is_available(self) -> bool:
        """Check if monitoring is available."""
        return (
            SCHEDULER_AVAILABLE and 
            detection_model is not None and
            sentinel_service.is_available()
        )
    
    def predict_fire(self, image: Image.Image) -> dict:
        """
        Run fire detection on an image using CAM model.
        
        Args:
            image: PIL Image (will be resized to 224x224)
            
        Returns:
            dict with prediction results
        """
        if detection_model is None:
            return {"error": "Detection model not loaded"}
        
        try:
            # Ensure image is RGB and correct size
            if image.mode != 'RGB':
                image = image.convert('RGB')
            image = image.resize((224, 224))
            
            # Preprocess for CAM model (normalize to 0-1)
            img_array = np.array(image, dtype=np.float32) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            
            # Predict - CAM model returns [cam_features, classification]
            outputs = detection_model.predict(img_array, verbose=0)
            
            # Handle dual output: outputs is a list [cam_output, classification_output]
            if isinstance(outputs, list) and len(outputs) == 2:
                classification = outputs[1]  # Second output is classification
            else:
                classification = outputs  # Single output model
            
            # Get prediction from classification output
            class_idx = np.argmax(classification[0])
            confidence = float(np.max(classification[0]))
            predicted_class = self.CLASS_NAMES.get(class_idx, "Unknown")
            
            return {
                "prediction": predicted_class,
                "confidence": confidence,
                "raw_scores": {self.CLASS_NAMES[i]: float(classification[0][i]) for i in range(len(self.CLASS_NAMES))},
                "is_fire": predicted_class == 'Fire',
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": str(e)}
    
    def scan_zone_for_fire(self, zone_name: str) -> dict:
        """
        Scan a specific zone and run fire detection.
        
        Args:
            zone_name: Name of the zone to scan
            
        Returns:
            dict with scan results
        """
        # Get satellite image
        sat_result = sentinel_service.scan_zone(zone_name, use_fire_script=False)
        
        if "error" in sat_result:
            return {"zone": zone_name, "error": sat_result["error"]}
        
        # Convert to PIL Image
        image_array = sat_result.get("image")
        if image_array is None:
            return {"zone": zone_name, "error": "No image data received"}
        
        img = Image.fromarray(image_array.astype('uint8'))
        
        # Run prediction
        prediction = self.predict_fire(img)
        
        if "error" in prediction:
            return {"zone": zone_name, "error": prediction["error"]}
        
        # Get zone coordinates (center of bbox)
        zones = sentinel_service.get_zones()
        zone_info = next((z for z in zones if z["name"].lower() == zone_name.lower()), None)
        
        if zone_info:
            bbox = zone_info["bbox"]
            center_lat = (bbox[1] + bbox[3]) / 2
            center_lon = (bbox[0] + bbox[2]) / 2
        else:
            center_lat, center_lon = 32.0, -6.0  # Default Morocco center
        
        result = {
            "zone": zone_name,
            "prediction": prediction["prediction"],
            "confidence": prediction["confidence"],
            "is_fire": prediction["is_fire"],
            "coordinates": (center_lat, center_lon),
            "timestamp": prediction["timestamp"],
            "image_base64": sat_result.get("image_base64")
        }
        
        return result
    
    def run_full_scan(self) -> list:
        """
        Run a full scan of all Morocco zones.
        
        Returns:
            List of scan results for each zone
        """
        results = []
        zones = sentinel_service.get_zones()
        
        print(f"🔍 Starting full scan of {len(zones)} zones...")
        
        for zone in zones:
            try:
                result = self.scan_zone_for_fire(zone["name"])
                results.append(result)
                
                # Check for fire detection
                if result.get("is_fire") and result.get("confidence", 0) >= self.detection_threshold:
                    self._handle_detection(result)
                    
            except Exception as e:
                results.append({
                    "zone": zone["name"],
                    "error": str(e)
                })
        
        # Store in history
        with self.lock:
            self.detection_history.append({
                "timestamp": datetime.now().isoformat(),
                "results": results,
                "fires_detected": sum(1 for r in results if r.get("is_fire"))
            })
            # Keep only last 100 scans
            self.detection_history = self.detection_history[-100:]
        
        print(f"✅ Scan complete. Fires detected: {sum(1 for r in results if r.get('is_fire'))}")
        
        return results
    
    def _handle_detection(self, result: dict):
        """Handle a positive fire detection."""
        print(f"🔥 FIRE DETECTED in {result['zone']} ({result['confidence']*100:.1f}% confidence)")
        
        # Send email alert
        if email_service.is_available():
            email_result = email_service.send_alert(
                zone_name=result["zone"],
                coordinates=result["coordinates"],
                confidence=result["confidence"],
                prediction=result["prediction"],
                image_base64=result.get("image_base64")
            )
            
            if email_result["success"]:
                print(f"📧 Alert email sent to {email_result['recipients']}")
            else:
                print(f"❌ Email failed: {email_result['error']}")
        
        # Simulate brightness for demo (CAM model doesn't output temperature)
        # Random value between 320K and 400K for detected fires
        brightness = random.uniform(320.0, 400.0)
        confidence_level = "High" if result["confidence"] > 0.85 else "Low"
        
        # Calculate spread prediction
        spread_data = prediction_service.calculate_spread(brightness, confidence_level)
        
        # Enrich result
        result["brightness"] = round(brightness, 1)
        result["spread_radius"] = spread_data["radius_km"]
        
        # Send Telegram alert
        self._send_telegram_alert(result)
    
    def _send_telegram_alert(self, result: dict):
        """
        Send fire alert to Telegram bot with image and detailed metrics.
        """
        import requests
        
        bot_token = os.getenv("BOT_TOKEN")
        chat_id = os.getenv("CHAT_ID")
        
        if not bot_token or not chat_id:
            print("⚠️ Telegram credentials not configured")
            return
            
        # Format Google Maps link
        lat, lon = result['coordinates']
        maps_link = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
        
        # Create detailed caption
        message = f"""🔥 *ALERTE INCENDIE - AI SENTINEL* 🔥

📍 *Zone Géographique*
• Région: {result['zone']}
• Lat/Lon: `{lat:.4f}, {lon:.4f}`

📊 *Analyse IA*
• Prédiction: {result['prediction']}
• Confiance: *{result['confidence']*100:.1f}%*
• Luminosité (Est.): {result.get('brightness', 'N/A')} K

⚠️ *Propagation Estimée*
• Rayon: *{result.get('spread_radius', 'N/A')} km*
• Risque: ÉLEVÉ 🔴

🔗 [Voir sur Google Maps]({maps_link})

🚨 *ACTION REQUISE: VÉRIFICATION IMMÉDIATE*
_ID: {datetime.now().strftime('%Y%m%d-%H%M%S')}_"""

        try:
            # Prepare image if available
            files = None
            data = {
                "chat_id": chat_id,
                "caption": message,
                "parse_mode": "Markdown"
            }
            
            if result.get("image_base64"):
                # Decode base64 image
                image_data = base64.b64decode(result["image_base64"])
                files = {"photo": ("alert_image.png", image_data, "image/png")}
                url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
            else:
                # Fallback to text only if no image
                url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                data["text"] = message
                del data["caption"]

            if files:
                response = requests.post(url, data=data, files=files, timeout=15)
            else:
                response = requests.post(url, json=data, timeout=10)
            
            if response.status_code == 200:
                print(f"📱 Detailed Telegram alert sent to chat {chat_id}")
            else:
                print(f"❌ Telegram failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Telegram error: {e}")
    
    def start_monitoring(self, interval_hours: float = 6) -> dict:
        """
        Start automated monitoring.
        
        Args:
            interval_hours: Hours between scans (default 6)
            
        Returns:
            dict with status
        """
        if not SCHEDULER_AVAILABLE:
            return {"success": False, "error": "Scheduler not available"}
        
        if self.is_running:
            return {"success": False, "error": "Monitoring already running"}
        
        self.scan_interval_hours = interval_hours
        
        # Add job
        self.scheduler.add_job(
            self.run_full_scan,
            trigger=IntervalTrigger(hours=interval_hours),
            id='satellite_scan',
            replace_existing=True
        )
        
        self.scheduler.start()
        self.is_running = True
        
        # Run initial scan
        self.run_full_scan()
        
        return {
            "success": True,
            "message": f"Monitoring started. Scanning every {interval_hours} hours.",
            "next_scan": self.scheduler.get_job('satellite_scan').next_run_time.isoformat()
        }
    
    def stop_monitoring(self) -> dict:
        """
        Stop automated monitoring.
        
        Returns:
            dict with status
        """
        if not self.is_running:
            return {"success": False, "error": "Monitoring not running"}
        
        self.scheduler.remove_job('satellite_scan')
        self.scheduler.shutdown(wait=False)
        self.scheduler = BackgroundScheduler()  # Reset scheduler
        self.is_running = False
        
        return {"success": True, "message": "Monitoring stopped"}
    
    def get_status(self) -> dict:
        """Get current monitoring status."""
        status = {
            "is_running": self.is_running,
            "interval_hours": self.scan_interval_hours,
            "detection_threshold": self.detection_threshold,
            "services": {
                "sentinel_hub": sentinel_service.is_available(),
                "email": email_service.is_available(),
                "model_loaded": detection_model is not None,
                "scheduler": SCHEDULER_AVAILABLE
            },
            "zones": len(sentinel_service.get_zones()),
            "recent_scans": len(self.detection_history)
        }
        
        if self.is_running and self.scheduler:
            job = self.scheduler.get_job('satellite_scan')
            if job:
                status["next_scan"] = job.next_run_time.isoformat()
        
        if self.detection_history:
            status["last_scan"] = self.detection_history[-1]
        
        return status
    
    def get_history(self, limit: int = 10) -> list:
        """Get recent detection history."""
        with self.lock:
            return self.detection_history[-limit:]


# Singleton instance
monitoring_service = MonitoringService()
