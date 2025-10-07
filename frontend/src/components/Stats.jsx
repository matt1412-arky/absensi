import React, { useState } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function Stats() {
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);

  function fetchStats(e) {
    if (e) e.preventDefault();
    axios
      .get(API + `/stats?start=${start}&end=${end}`)
      .then((r) => setData(r.data));
  }

  return (
    <div>
      <h2>Statistik Kehadiran</h2>
      <form onSubmit={fetchStats}>
        <label>
          Start{" "}
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: 8 }}>
          End{" "}
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <button style={{ marginLeft: 8 }}>Tampilkan</button>
      </form>

      {data && (
        <div style={{ marginTop: 10 }}>
          <div>Total sesi terjadwal: {data.total_sessions}</div>
          <table
            border="1"
            cellPadding="6"
            style={{ width: "100%", marginTop: 8 }}
          >
            <thead>
              <tr>
                <th>Nama</th>
                <th>Poin</th>
                <th>Hadir</th>
                <th>Total Sesi</th>
                <th>Persentase</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s) => (
                <tr key={s.student_id}>
                  <td>{s.name}</td>
                  <td>{s.points}</td>
                  <td>{s.present_count}</td>
                  <td>{s.total_sessions}</td>
                  <td>{s.attendance_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
