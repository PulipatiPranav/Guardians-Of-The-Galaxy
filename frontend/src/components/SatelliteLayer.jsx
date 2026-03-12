import React, { useEffect, useState } from 'react';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Convert geodetic lat/lon/alt to Three.js Cartesian coordinates.
 */
function latLonAltToVec3(lat, lon, altKm) {
  const EARTH_RADIUS_KM = 6371;
  const GLOBE_RADIUS = 1;

  const r = GLOBE_RADIUS * (1 + altKm / EARTH_RADIUS_KM);

  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;

  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Individual satellite marker
 */
function SatelliteDot({ satellite, isHovered, onHover, onUnhover }) {

  const pos = latLonAltToVec3(
    satellite.lat,
    satellite.lon,
    satellite.alt_km
  );

  const color = isHovered ? '#ffeb3b' : '#00e5ff';

  const size = isHovered ? 0.02 : 0.013;

  return (
    <group position={pos}>

      {/* Main satellite sphere */}
      <Sphere
        args={[size, 10, 10]}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover();
        }}
        onPointerLeave={() => onUnhover()}
      >
        <meshBasicMaterial color={color} />
      </Sphere>

      {/* Satellite glow halo */}
      <Sphere args={[size * 2.2, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
        />
      </Sphere>

      {/* Hover tooltip */}
      {isHovered && (
        <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>

          <div
            style={{
              background: 'rgba(10,10,20,0.92)',
              border: '1px solid #00e5ff',
              borderRadius: 6,
              padding: '6px 10px',
              color: '#e0f7fa',
              fontSize: 12,
              whiteSpace: 'nowrap',
              transform: 'translate(-50%, -140%)',
              backdropFilter: 'blur(6px)'
            }}
          >
            <strong style={{ color: '#00e5ff' }}>
              {satellite.name}
            </strong>
            <br />
            Alt: {satellite.alt_km?.toFixed(0)} km
            <br />
            Lat: {satellite.lat?.toFixed(2)}° Lon: {satellite.lon?.toFixed(2)}°
          </div>
        </Html>
      )}

    </group>
  );
}

/**
 * SatelliteLayer — fetches satellites and renders them
 */
export default function SatelliteLayer({ group = 'active', limit = 50 }) {

  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {

    let cancelled = false;

    async function loadSatellites() {

      try {

        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_URL}/satellites?group=${group}&limit=${limit}`
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const tleList = await res.json();

        const withPositions = await Promise.all(

          tleList.map(async (sat) => {

            try {

              const pRes = await fetch(
                `${API_URL}/propagate?line1=${encodeURIComponent(sat.line1)}&line2=${encodeURIComponent(sat.line2)}&hours=1&step_minutes=60`
              );

              if (!pRes.ok) return null;

              const positions = await pRes.json();

              if (!positions.length) return null;

              const p = positions[0];

              return {
                name: sat.name,
                lat: p.lat,
                lon: p.lon,
                alt_km: p.alt_km
              };

            } catch {
              return null;
            }

          })
        );

        if (!cancelled) {
          setSatellites(withPositions.filter(Boolean));
        }

      } catch (err) {

        if (!cancelled) setError(err.message);

      } finally {

        if (!cancelled) setLoading(false);

      }

    }

    loadSatellites();

    return () => { cancelled = true; };

  }, [group, limit]);

  if (loading) return null;

  if (error) {
    console.warn("Satellite fetch error:", error);
  }

  return (
    <group>

      {satellites.map((sat, i) => (

        <SatelliteDot
          key={`${sat.name}-${i}`}
          satellite={sat}
          isHovered={hoveredIndex === i}
          onHover={() => setHoveredIndex(i)}
          onUnhover={() => setHoveredIndex(null)}
        />

      ))}

    </group>
  );
}