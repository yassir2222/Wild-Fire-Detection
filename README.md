# Wild-Fire-Detection

An end-to-end wildfire monitoring and detection platform combining computer vision, satellite data, and alerting workflows.

## Overview

This repository contains a full-stack system for:

- **Image/video fire detection** using trained deep learning models (MobileNetV2 + YOLO workflows)
- **Real-time wildfire hotspot tracking** from NASA FIRMS datasets
- **Spread estimation** using brightness, confidence, and wind-based factors
- **Satellite-based monitoring** (Sentinel Hub integration with demo fallback mode)
- **Operational alerts** through email and Telegram test/notification flows
- **Interactive dashboard UI** built with React + TypeScript + Vite

## Repository Structure

```text
Wild-Fire-Detection/
├── backend/            # FastAPI services, model inference, satellite/alert integrations
├── frontend/           # React web interface and operational dashboards
├── docs/               # Academic/project documentation (.tex sources)
└── FireSight-main/     # Archived/extended project package and supporting docs
```

## System Architecture

- **Frontend (Vite + React + TypeScript)**
  - Multiple dashboards for detection, prevention, prediction, and satellite workflows
  - Uses map visualizations (Leaflet) and backend API polling
- **Backend (FastAPI + Python ML stack)**
  - Hosts REST endpoints for predictions, uploads, realtime feeds, and monitoring controls
  - Loads local trained models and orchestrates external data/service calls
- **External Services**
  - NASA FIRMS (active fire hotspots)
  - Open-Meteo (wind data enrichment)
  - Sentinel Hub (satellite imagery)
  - SMTP/Telegram (notifications)

## Key Features

### 1) Upload Detection (Image/Video)
- Upload an image to detect fire/smoke objects and get annotated output.
- Upload a video for processed fire-detection output.

### 2) Classification API
- MobileNetV2-based classification endpoint for classes like `Fire`, `Smoke`, `Non Fire`.

### 3) Realtime Prevention Dashboard
- Pulls hotspot data from FIRMS datasets.
- Filters by region (`morocco`, `california`, `australia`, `global`).
- Adds wind and spread-radius estimates for operational decision support.

### 4) Satellite Monitoring
- Zone-based scans over Morocco regions.
- Manual scan and scheduled monitoring controls.
- Sentinel Hub mode when configured, demo mode fallback otherwise.

### 5) Notification Testing
- Includes API endpoints to test Telegram and email alert channels.

## Prerequisites

### General
- **Git**
- **Python 3.10+** (recommended for backend ML libraries)
- **Node.js 18+** and **npm** (for frontend)

### Backend runtime dependencies
Installed from `backend/requirements.txt`, including:
- `fastapi`, `uvicorn`, `pydantic`
- `tensorflow`, `numpy`, `pillow`
- `ultralytics`, `opencv-python`
- `requests`, `sentinelhub`, `apscheduler`

## Quick Start

### 1) Clone and enter project
```bash
git clone <repo-url>
cd Wild-Fire-Detection
```

### 2) Run backend
```bash
cd /home/runner/work/Wild-Fire-Detection/Wild-Fire-Detection/backend
python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### 3) Run frontend
```bash
cd /home/runner/work/Wild-Fire-Detection/Wild-Fire-Detection/frontend
npm install
npm run dev
```

Frontend default URL:
- `http://localhost:5173`

## Environment Configuration

Create a `backend/.env` file and define only the variables you need:

```env
# Sentinel Hub
SENTINEL_CLIENT_ID=
SENTINEL_CLIENT_SECRET=

# Telegram alerts
BOT_TOKEN=
CHAT_ID=

# Email alerts
SMTP_EMAIL=
SMTP_PASSWORD=
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
ALERT_RECIPIENTS=
```

> Keep secrets out of source control. Use local env files or secret managers.

## API Overview (Main Endpoints)

### Health and base
- `GET /` – service status message
- `GET /health` – health + model-loaded state

### Classification / detection
- `POST /predict` – image classification (multipart file)
- `GET /video_feed` – streaming detection feed
- `POST /detect/image` – object detection on image
- `POST /detect/video` – object detection on video

### Fire prediction and realtime data
- `POST /predict/wildfire` – spread prediction by location/brightness/confidence
- `GET /api/wildfire/realtime?region=<region>` – realtime FIRMS hotspots

### Satellite monitoring
- `GET /api/satellite/status`
- `GET /api/satellite/zones`
- `POST /api/satellite/scan`
- `POST /api/satellite/start`
- `POST /api/satellite/stop`
- `GET /api/satellite/history`
- `POST /api/satellite/test-email`
- `GET /api/satellite/image/{zone_name}`

### Notification tests
- `POST /api/test/telegram`
- `POST /api/test/email`

## Frontend Routes

The app includes route-level pages such as:
- `/` (landing)
- `/dashboard`
- `/detection`
- `/realtime`
- `/upload`
- `/prevention`
- `/prediction`
- `/fwi`
- `/satellite`

## Development Notes

- Frontend currently targets backend URLs at `http://localhost:8000`.
- CORS is configured in backend for common local frontend ports.
- Model and external API availability can affect endpoint behavior.
- Sentinel service supports a demo mode fallback when credentials are missing.

## Validation / Checks

### Frontend
```bash
cd /home/runner/work/Wild-Fire-Detection/Wild-Fire-Detection/frontend
npm run lint
npm run build
```

### Backend
Use API smoke tests/manual checks via:
- `http://localhost:8000/docs`
- basic curl/postman requests for relevant endpoints

## Troubleshooting

- **Model not loaded**: verify model files exist in `backend/` and dependencies are installed.
- **Sentinel unavailable**: verify `sentinelhub` install and `SENTINEL_CLIENT_ID/SECRET` values.
- **Email failures**: check SMTP credentials, app passwords, and allowed sender settings.
- **Frontend fetch errors**: confirm backend is running on port `8000`.

## License

No explicit license file is currently included in this repository. Add one if distribution terms are required.
