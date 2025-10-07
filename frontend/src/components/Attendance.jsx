import React, { useEffect, useState } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(() => {
    const t = new Date();
    return t.toISOString().slice(0, 10);
  });

  useEffect(() => fetchStudents(), []);

  function fetchStudents() {
    axios.get(API + "/students").then((r) => setStudents(r.data));
  }

  const statusToPoints = {
    present: 1,
    absent: 0,
    sick: 0,
    permission: 0,
  };

  function mark(studentId, status) {
    const points = statusToPoints[status] ?? 0;
    axios
      .post(API + "/attendance", {
        student_id: studentId,
        date,
        status,
        points,
      })
      .then(() => fetchStudents()); // refresh points shown in student list
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <h2>Absensi</h2>
      <div>
        <label>
          Tanggal:{" "}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>
      <table border="1" cellPadding="6" style={{ width: "100%", marginTop: 8 }}>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Poin</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.points}</td>
              <td>
                <button onClick={() => mark(s.id, "present")}>Hadir</button>
                <button
                  onClick={() => mark(s.id, "absent")}
                  style={{ marginLeft: 6 }}
                >
                  Absen
                </button>
                <button
                  onClick={() => mark(s.id, "sick")}
                  style={{ marginLeft: 6 }}
                >
                  Sakit
                </button>
                <button
                  onClick={() => mark(s.id, "permission")}
                  style={{ marginLeft: 6 }}
                >
                  Izin
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
