import { useEffect, useState } from "react";
import {
  getHabitSummary,
  createHabit,
  completeHabit,
  uncompleteHabit,
} from "../api/habits.api";

function DayDot({ done }) {
  return (
    <span
      title={done ? "Done" : "Not done"}
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: 999,
        marginRight: 6,
        background: done ? "#22c55e" : "#374151",
      }}
    />
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const data = await getHabitSummary();
    setSummary(data);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);

  async function handleAddHabit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createHabit(newName);
      setNewName("");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleDoneToday(habit) {
    setError("");
    try {
      if (habit.doneToday) {
        await uncompleteHabit(habit.id);
      } else {
        await completeHabit(habit.id);
      }
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  if (!summary) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>Dashboard</h1>
        <p>Loading…</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Dashboard</h1>

      <div style={{ marginBottom: 10, color: "#9ca3af" }}>
        Range: {summary.range.from} → {summary.range.to}
      </div>

      <form onSubmit={handleAddHabit} style={{ marginBottom: 16 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New habit name (e.g., Gym)"
          style={{ padding: 8, width: 280 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ marginLeft: 8, padding: "8px 12px" }}
        >
          Add
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {summary.habits.map((h) => (
          <div
            key={h.id}
            style={{
              padding: 12,
              borderRadius: 10,
              background: "#111827",
              color: "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{h.name}</div>
              <div style={{ marginTop: 6 }}>
                {h.last7.map((d) => (
                  <DayDot key={d.date} done={d.done} />
                ))}
              </div>
            </div>

            <button
              onClick={() => toggleDoneToday(h)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #374151",
                background: h.doneToday ? "#16a34a" : "#1f2937",
                color: "#fff",
              }}
            >
              {h.doneToday ? "Done ✅" : "Mark done"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}