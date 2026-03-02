import { useEffect, useState } from "react";
import { getArchivedHabits } from "../api/habits.api";

export default function ArchivedPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArchived() {
      try {
        setError("");
        const data = await getArchivedHabits();
        setHabits(data.habits || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadArchived();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>Archived Habits</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "system-ui" }}>
      
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!error && habits.length === 0 && (
        <p style={{ color: "#ffffff" }}>No archived habits yet.</p>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {habits.map((h) => (
          <div
            key={h.id}
              style={{
                position: "relative", // add
                width: "min(100%, 700px)",
                padding: 10,
                borderRadius: 10,
                background: "#5D737E",
                color: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>{h.name}</div>
            <div style={{ fontSize: 12, marginTop: 6, color: "#e5e7eb" }}>
              Archived at:{" "}
              {h.archived_at ? new Date(h.archived_at).toLocaleString() : "Unknown"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
