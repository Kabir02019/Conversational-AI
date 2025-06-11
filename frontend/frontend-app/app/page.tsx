"use client";
import { useState } from "react";

export default function Home() {
  const [role, setRole] = useState("Software Engineer");
  const [datetime, setDatetime] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  async function schedule() {
    setMessage("Scheduling...");
    try {
      const res = await fetch("http://localhost:4000/schedule-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, datetime, phone }),
      });
      const data = await res.json();
      if (res.ok) setMessage("Interview scheduled!");
      else setMessage(data.error || "Error");
    } catch (err) {
      setMessage("Request failed");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>AI Interview Scheduler</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Software Engineer</option>
            <option>Product Manager</option>
            <option>Marketing Specialist</option>
          </select>
        </label>
        <label>
          Interview Time:
          <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
        </label>
        <label>
          Phone Number:
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <button onClick={schedule}>Schedule Interview</button>
        {message && <p>{message}</p>}
      </div>
    </main>
  );
}
