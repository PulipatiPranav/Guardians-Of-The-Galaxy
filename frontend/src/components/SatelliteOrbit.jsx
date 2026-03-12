import React, { useMemo } from "react";
import * as THREE from "three";

export default function SatelliteOrbit({ positions }) {

  const geometry = useMemo(() => {
    const points = positions.map(
      p => new THREE.Vector3(p.x, p.y, p.z)
    );

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [positions]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#4fc3f7" opacity={0.6} transparent />
    </line>
  );
}