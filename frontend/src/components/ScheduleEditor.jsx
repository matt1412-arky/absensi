import React, { useState, useEffect } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const dayNames = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
  7: "Minggu",
};

export default function ScheduleEditor() {
  const [schedules, setSchedules] = useState([]);
  const [day, setDay] = useState(1);
  const [time, setTime] = useState("08:00");

  useEffect(() => fetchSchedules(), []);

  function fetchSchedules() {
    axios.get(API + "/schedules").then((r) => setSchedules(r.data));
  }

  function addSchedule(e) {
    e.preventDefault();
    axios
      .post(API + "/schedules", { day: Number(day), time })
      .then(fetchSchedules);
  }

  function remove(id) {
    if (!confirm("Hapus jadwal?")) return;
    axios.delete(API + "/schedules/" + id).then(fetchSchedules);
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <h2>Jadwal Mengajar</h2>
      <form onSubmit={addSchedule} style={{ marginBottom: 8 }}>
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {Object.entries(dayNames).map(([k, v]) => (
            <option value={k} key={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ marginLeft: 8 }}
        />
        <button style={{ marginLeft: 8 }}>Tambah</button>
      </form>
      <ul>
        {schedules.map((s) => (
          <li key={s.id}>
            {dayNames[s.day] || s.day} - {s.time}{" "}
            <button onClick={() => remove(s.id)}>Hapus</button>
          </li>
        ))}
      </ul>
      <small>
        Contoh default yang umum: Senin/Tues/Kamis/Jumat — gunakan tombol
        tambah/hapus untuk atur.
      </small>
    </div>
  );
}
