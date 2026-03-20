# Codebase Context: Orbital Guardian (Guardians-Of-The-Galaxy)

## 🌌 Overview
**Orbital Guardian** is an AI-powered space debris collision prediction and avoidance system. It ingests live TLE (Two-Line Element) data, simulates orbital trajectories in real-time, identifies collision risks, and recommends optimal avoidance maneuvers. It visualizes these processes in a 3D interface.

**Repository:** `PulipatiPranav/Guardians-Of-The-Galaxy`
**Primary Languages:** Python (41.5%), JavaScript (29%), CSS, HTML, PowerShell, Dockerfile

---

## 🏗 System Architecture & Tech Stack

The application is split into a separated backend and frontend.

### 1. Backend (API & Processing Engine)
- **Framework:** FastAPI, Uvicorn (Python 3.11+)
- **Domain Libraries:** `sgp4` (SGP4 Orbital Propagation), `NumPy`
- **Data Sources:** Celestrak TLE feeds, Space-Track, NORAD satellite catalog
- **Containerization:** Docker (Dockerfile provided in the backend folder)
- **Key Modules (`backend/app/`):**
  - `main.py`: FastAPI entry point and routing.
  - `tle_fetcher.py`: Ingests and parses live orbital elements from Celestrak.
  - `propagator.py`: Implements SGP4 orbital mechanics equations to predict positions based on drag and Earth's oblateness.
  - `collision_detector.py`: Pairwise closest-approach analysis to classify events as `CRITICAL` (<10 km), `WARNING` (<50 km), or `SAFE`.
  - `maneuver_engine.py`: AI-driven maneuver advisor calculating delta-v, optimal cross-track burn directions, fuel cost percentages, and confidence scores.

### 2. Frontend (3D Visualization & UI)
- **Framework:** React 18
- **3D Rendering:** Three.js (via `@react-three/fiber` and `@react-three/drei`)
- **Key Components (`frontend/src/components/`):**
  - `Globe.jsx`: Interactive spinning Earth.
  - `SatelliteLayer.jsx`: Real-time satellite orbit visualization.
  - `CollisionAlert.jsx`: Risk warning panel displaying critical close-approaches.
  - `ManeuverPanel.jsx`: Displays AI-recommended avoidance burns.

---

## 📁 Repository Structure

```text
orbital-guardian/
├── frontend/                  # React + Three.js Client
│   ├── public/index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Globe.jsx
│   │   │   ├── SatelliteLayer.jsx
│   │   │   ├── CollisionAlert.jsx
│   │   │   └── ManeuverPanel.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── .env.example
├── backend/                   # FastAPI Server
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               
│   │   ├── tle_fetcher.py        
│   │   ├── propagator.py         
│   │   ├── collision_detector.py 
│   │   └── maneuver_engine.py    
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── data/
│   └── sample_tle.txt            # Sample TLE data for offline fallback
├── .gitignore
└── README.md
```

---

## 📡 API Reference Reference (FastAPI endpoints)

The backend provides the following core endpoints:
- `GET /health`: Health check (`{ "status": "ok" }`).
- `GET /satellites?group=active&limit=50`: Fetches live TLE data from Celestrak.
- `GET /propagate?line1={...}&line2={...}&hours=24&step_minutes=10`: Propagates an orbit using SGP4 returning position/velocity matrices, lat, lon, and alt.
- `GET /collision-check?line1_a={...}&line2_b={...}&hours=24`: Checks collision risk between satellite pairs, finding the closest approach.
- `GET /maneuver-recommend`: Generates AI recommendations based on threat vectors, returning the optimal burn direction and delta-v (e.g., "Cross-Track Avoidance Burn").

---

## 🚀 Deployment Considerations & Future Roadmap
When making improvements or deploying, consider the following current roadmap goals:
1. **Real-time updates:** Implementation of WebSockets for live satellite position streams.
2. **Data Integration:** Integration with the Space-Track authenticated API.
3. **High-fidelity physics:** Upgrading to Orekit-based propagation for more precise conjunctions.
4. **Deployment:** The backend already has a Dockerfile (`docker build -t orbital-guardian-api .`), but the frontend requires containerization or static hosting setup (e.g., Vercel, Netlify, or an Nginx Docker container) to complete a full-stack deployment pipeline.