import React, { useState } from 'react';
import SatelliteSelector from "./SatelliteSelector";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/** Risk-level → accent colour mapping */
const RISK_COLORS = {
  CRITICAL: '#f44336',
  WARNING: '#ff9800',
  SAFE: '#4caf50',
};

export default function CollisionAlert({ 
  satellites = [],
  satA,
  satB,
  setSatA,
  setSatB,
  selectedSatA,
  selectedSatB,
  alertData, 
  onDataChange 
}) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(alertData || null);

  async function runCollisionCheck() {
    if (!selectedSatA || !selectedSatB) {
      setError("Please select both satellites first.");
      return;
    }
    setLoading(true);
    setError(null);

    try {

      const params = new URLSearchParams({
        line1_a: selectedSatA.line1,
        line2_a: selectedSatA.line2,
        line1_b: selectedSatB.line1,
        line2_b: selectedSatB.line2,
        hours: '24',
      });

      const res = await fetch(`${API_URL}/collision-check?${params}`);

      if (!res.ok)
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);

      const data = await res.json();

      setResult(data);
      onDataChange && onDataChange(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const riskColor = result
    ? (RISK_COLORS[result.risk_level] || '#9e9e9e')
    : '#9e9e9e';

  const isCritical = result?.risk_level === 'CRITICAL';

  return (
    <div className="panel collision-panel">

      <h2 className="panel-title">
        🛰 Collision Risk Monitor
      </h2>

    <div className="satellite-selector-wrapper">
      <SatelliteSelector
        satellites={satellites}
        satA={satA}
        satB={satB}
        setSatA={setSatA}
        setSatB={setSatB}
    />
    </div>

      <button
        className="action-btn"
        onClick={runCollisionCheck}
        disabled={loading}
      >
        {loading ? '⏳ Analysing…' : '🔍 Check Collision'}
      </button>

      {error && (
        <div className="error-box">⚠ {error}</div>
      )}

      {result && (
        <div
          className={`risk-card ${isCritical ? 'pulse' : ''}`}
          style={{ borderColor: riskColor }}
        >

          <div className="risk-badge" style={{ background: riskColor }}>
            {result.risk_level}
          </div>

          <div className="risk-detail">
            <span className="detail-label">Closest Approach</span>
            <span className="detail-value">
              {result.min_distance_km != null
                ? `${Number(result.min_distance_km).toFixed(2)} km`
                : '—'}
            </span>
          </div>

          {result.closest_event && (
            <>
              <div className="risk-detail">
                <span className="detail-label">Event Time</span>
                <span className="detail-value">
                  {new Date(result.closest_event.time).toUTCString()}
                </span>
              </div>

              <div className="risk-detail">
                <span className="detail-label">Sat A Position</span>
                <span className="detail-value detail-mono">
                  ({result.closest_event.position_a.x.toFixed(0)},&nbsp;
                  {result.closest_event.position_a.y.toFixed(0)},&nbsp;
                  {result.closest_event.position_a.z.toFixed(0)}) km
                </span>
              </div>

              <div className="risk-detail">
                <span className="detail-label">Sat B Position</span>
                <span className="detail-value detail-mono">
                  ({result.closest_event.position_b.x.toFixed(0)},&nbsp;
                  {result.closest_event.position_b.y.toFixed(0)},&nbsp;
                  {result.closest_event.position_b.z.toFixed(0)}) km
                </span>
              </div>
            </>
          )}

          <p className="risk-hint">
            {result.risk_level === 'CRITICAL' && '🚨 Immediate maneuver required!'}
            {result.risk_level === 'WARNING' && '⚠ Elevated risk — monitor closely.'}
            {result.risk_level === 'SAFE' && '✅ No immediate collision threat detected.'}
          </p>

        </div>
      )}

      {!result && !loading && (
        <p className="placeholder-text">
          Press "Check Collision" to run a conjunction analysis between two satellites.
        </p>
      )}

    </div>
  );
}