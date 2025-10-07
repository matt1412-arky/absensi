import React, { useState, useEffect } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => fetchStudents(), []);

  function fetchStudents() {
    axios.get(API + "/students").then((r) => setStudents(r.data));
  }

  function addStudent(e) {
    e.preventDefault();
    if (!name) return;
    axios.post(API + "/students", { name, points: 0 }).then(() => {
      setName("");
      fetchStudents();
    });
  }

  function remove(id) {
    if (!confirm("Hapus siswa?")) return;
    axios.delete(API + "/students/" + id).then(fetchStudents);
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <h2>Siswa</h2>
      <form onSubmit={addStudent} style={{ marginBottom: 10 }}>
        <input
          placeholder="Nama siswa"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" style={{ marginLeft: 8 }}>
          Tambah
        </button>
      </form>
      <table border="1" cellPadding="6" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Poin</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.points}</td>
              <td>
                <button onClick={() => remove(s.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
