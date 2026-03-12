import React from "react";

export default function SatelliteSelector({
  satellites,
  satA,
  satB,
  setSatA,
  setSatB
}) {

  return (
    <div style={{ display: "flex", gap: 12 }}>

      <select
        value={satA || ""}
        onChange={(e) => setSatA(e.target.value)}
      >
        <option value="">Select Satellite A</option>

        {satellites.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}

      </select>

      <select
        value={satB || ""}
        onChange={(e) => setSatB(e.target.value)}
      >
        <option value="">Select Satellite B</option>

        {satellites.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}

      </select>

    </div>
  );
}