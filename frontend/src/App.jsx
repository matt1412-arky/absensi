import React, { useState } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([{ id: 1, name: "Budi", point: 0 }]);
  const [classes, setClasses] = useState([{ id: 1, name: "XI RPL 1" }]);
  const [newClass, setNewClass] = useState("");
  const [newStudent, setNewStudent] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [day, setDay] = useState("Senin");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [selectedClass, setSelectedClass] = useState("");

  const addStudent = () => {
    if (!newStudent) return;
    const newId = students.length + 1;
    setStudents([...students, { id: newId, name: newStudent, point: 0 }]);
    setNewStudent("");
  };

  const addClass = () => {
    if (!newClass) return;
    const newId = classes.length + 1;
    setClasses([...classes, { id: newId, name: newClass }]);
    setNewClass("");
  };

  const addSchedule = () => {
    if (!selectedClass) return;
    setSchedule([
      ...schedule,
      { day, startTime, endTime, className: selectedClass },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-400">
        📘 Absensi Guru
      </h1>

      {/* Input Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">👩‍🏫 Tambah Siswa</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nama siswa"
              value={newStudent}
              onChange={(e) => setNewStudent(e.target.value)}
              className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:ring-2 ring-indigo-400"
            />
            <button
              onClick={addStudent}
              className="bg-indigo-500 px-4 py-2 rounded-lg hover:bg-indigo-600"
            >
              Tambah
            </button>
          </div>

          <table className="w-full mt-4 text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-600">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Poin</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-gray-700">
                  <td className="p-2">{s.id}</td>
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.point}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">📅 Jadwal Mengajar</h2>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <select
              className="bg-gray-700 text-white p-2 rounded-lg"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option>Senin</option>
              <option>Selasa</option>
              <option>Rabu</option>
              <option>Kamis</option>
              <option>Jumat</option>
            </select>

            <select
              className="bg-gray-700 text-white p-2 rounded-lg"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Pilih Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-lg"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-lg"
            />
          </div>

          <button
            onClick={addSchedule}
            className="w-full bg-indigo-500 py-2 rounded-lg hover:bg-indigo-600"
          >
            Tambah Jadwal
          </button>

          <ul className="mt-4 text-sm space-y-1">
            {schedule.map((s, i) => (
              <li key={i} className="bg-gray-700 p-2 rounded-lg">
                {s.day} | {s.startTime} - {s.endTime} | {s.className}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Kelas Section */}
      <div className="bg-gray-800 p-6 mt-8 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">🏫 Daftar Kelas</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Nama kelas"
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:ring-2 ring-indigo-400"
          />
          <button
            onClick={addClass}
            className="bg-indigo-500 px-4 py-2 rounded-lg hover:bg-indigo-600"
          >
            Tambah
          </button>
        </div>

        <ul className="text-sm space-y-1">
          {classes.map((cls) => (
            <li key={cls.id} className="bg-gray-700 p-2 rounded-lg">
              {cls.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
