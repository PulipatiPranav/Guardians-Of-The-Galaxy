import React, { useState, useEffect } from 'react';
import Globe from './components/Globe';
import SatelliteLayer from './components/SatelliteLayer';
import CollisionAlert from './components/CollisionAlert';
import ManeuverPanel from './components/ManeuverPanel';
import SatelliteOrbit from "./components/SatelliteOrbit";
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * App — root layout component for Orbital Guardian dashboard.
 *
 * Layout:
 *   Header
 *   ┌─────────────────┬─────────────────┐
 *   │  3-D Globe      │  CollisionAlert │
 *   │  + Satellites   │  ManeuverPanel  │
 *   └─────────────────┴─────────────────┘
 */
export default function App() {
  const [satellites, setSatellites] = useState([]);
  const [satA, setSatA] = useState(null);
  const [satB, setSatB] = useState(null);
  const [collisionResult, setCollisionResult] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/satellites?limit=500`)
      .then(res => res.json())
      .then(data => setSatellites(data))
      .catch(err => console.error("Failed to fetch satellites:", err));
  }, []);

  const selectedSatA = satellites.find(s => s.name === satA);
  const selectedSatB = satellites.find(s => s.name === satB);

  const threatParams = collisionResult && collisionResult.closest_event && selectedSatA ? {
    line1: selectedSatA.line1,
    line2: selectedSatA.line2,
    threat_direction_x: collisionResult.closest_event.position_b.x - collisionResult.closest_event.position_a.x,
    threat_direction_y: collisionResult.closest_event.position_b.y - collisionResult.closest_event.position_a.y,
    threat_direction_z: collisionResult.closest_event.position_b.z - collisionResult.closest_event.position_a.z,
    threat_distance_km: collisionResult.min_distance_km
  } : null;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-content">
          <span className="header-icon">🛰</span>
          <div>
            <h1 className="header-title">Orbital Guardian</h1>
            <p className="header-subtitle">
              AI-Powered Space Debris Collision Prediction &amp; Avoidance System
            </p>
          </div>
        </div>
        <div className="header-status">
          <span className="status-dot" />
          <span className="status-text">LIVE</span>
        </div>
      </header>

      {/* ── Dashboard grid ── */}
      <main className="dashboard">
        {/* Left column — 3-D globe */}
        <section className="globe-section">
          <div className="globe-container">
            <Globe>
              <SatelliteLayer group="active" limit={60} />
            </Globe>
          </div>
          <p className="globe-hint">
            Drag to rotate · Scroll to zoom · Hover a dot for satellite info
          </p>
        </section>

        {/* Right column — control panels */}
        <aside className="panels-column">
          <CollisionAlert 
            satellites={satellites}
            satA={satA}
            satB={satB}
            setSatA={setSatA}
            setSatB={setSatB}
            selectedSatA={selectedSatA}
            selectedSatB={selectedSatB}
            alertData={collisionResult}
            onDataChange={setCollisionResult}
          />
          <ManeuverPanel 
            threatParams={threatParams}
            onDataChange={() => {}}
          />
        </aside>
      </main>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <span>Orbital Guardian &copy; {new Date().getFullYear()}</span>
        <span className="footer-sep">·</span>
        <span>Data: Celestrak / NORAD TLE</span>
        <span className="footer-sep">·</span>
        <span>IIT Hyderabad Hackathon</span>
      </footer>
    </div>
  );
}
