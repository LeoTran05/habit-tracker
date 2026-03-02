import { useEffect, useState } from "react";
import {
  getHabitSummary,
  createHabit,
  deleteHabit,
  completeHabit,
  uncompleteHabit,
  updateHabitName,
} from "../api/habits.api";

function weekdayShort(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString(undefined, { weekday: "short" });
}

function DayDot({ date, done, isAsOf }) {
  return (
    <div style={{ textAlign: "center", width: 34 }}>
      <div style={{ fontSize: 12, color: done ? "#22c55e" : "#000000" }}>
        {weekdayShort(date)}
      </div>
      <span
        title={date}
        style={{
          display: "inline-block",
          width: 12,
          height: 12,
          borderRadius: 999,
          marginTop: 6,
          background: done ? "#22c55e" : "#11151C",
          outline: isAsOf ? "2px solid #e5e7eb" : "none",
          outlineOffset: 2,
        }}
      />
      <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
        {date.slice(8, 10)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openMenuHabitId, setOpenMenuHabitId] = useState(null);

  const [asOf, setAsOf] = useState(() => localStorage.getItem("dev_asof") || "");

  async function refresh(nextAsOf = asOf) {
    const data = await getHabitSummary(nextAsOf || undefined);
    setSummary(data);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChangeAsOf(value) {
    setAsOf(value);
    localStorage.setItem("dev_asof", value);
    setError("");
    refresh(value).catch((e) => setError(e.message));
  }

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

  async function toggleDoneForAsOf(habit) {
    setError("");
    try {
      const date = asOf || undefined;
      if (habit.doneToday) {
        await uncompleteHabit(habit.id, date);
      } else {
        await completeHabit(habit.id, date);
      }
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteHabit(habitId) {
    const ok = window.confirm("Are you sure you want to delete this habit?");
    if (!ok) return;

    setError("");
    try {
      await deleteHabit(habitId);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleUpdateHabitName(habitId, nextName) {
    setError("");
    try {
      await updateHabitName(habitId, nextName);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRenameFromMenu(habit) {
    const nextName = window.prompt("Rename habit", habit.name);
    if (nextName === null) return;

    const trimmed = nextName.trim();
    if (!trimmed) {
      setError("Habit name is required and must be a non-empty string");
      return;
    }

    if (trimmed === habit.name) {
      setOpenMenuHabitId(null);
      return;
    }

    await handleUpdateHabitName(habit.id, trimmed);
    setOpenMenuHabitId(null);
  }

  if (!summary) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <p>Loading...</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  const asOfLabel = asOf ? asOf : summary.range.to;

  return (
    <div style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1 style={{ color: "#ffffff" }}>Hello, Today is: {asOfLabel}</h1>
      
      <div
        style={{
          marginBottom: 14,
          padding: 12,
          borderRadius: 10,
          background: "#5D737E",
          color: "#11151C",
          border: "1px solid #1f2937",
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 520,
        }}
      >
        <div>
          <div style={{ fontWeight: 700 }}>Dev date (pretend "today")</div>
          <div style={{ fontSize: 12, color: "#ffffff" }}>
            Used for summary + marking done. Leave blank to use real today.
          </div>
        </div>

        <input
          className="habit-input"
          type="date"
          value={asOf}
          onChange={(e) => handleChangeAsOf(e.target.value)}
          style={{ padding: 8, borderRadius: 8 }}
        />
      </div>

      <div style={{ marginBottom: 10, color: "#000000" }}>
        Range: {summary.range.from} - {summary.range.to} (asOf: {asOfLabel})
      </div>

      <form onSubmit={handleAddHabit} style={{ marginBottom: 16 }}>
        <input
          className="habit-input"
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

      <div style={{ display: "grid", gap: 10, justifyItems: "start" }}>
        {summary.habits.map((h) => (
          <div
            key={h.id}
            style={{
              position: "relative",
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
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{h.name}</div>

              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                {h.last7.map((d) => (
                  <DayDot
                    key={d.date}
                    date={d.date}
                    done={d.done}
                    isAsOf={(asOf || summary.range.to) === d.date}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                top: 6,
                right: 8,
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenMenuHabitId((curr) => (curr === h.id ? null : h.id))
                }
                title="Habit settings"
                aria-label={`Open settings for ${h.name}`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: "1px solid #374151",
                  background: "#11151C",
                  color: "#e5e7eb",
                  fontSize: 14,
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  padding: 0,
                }}
              >
                {"\u2699"}
              </button>

              <button
                type="button"
                onClick={() => handleDeleteHabit(h.id)}
                title="Delete habit"
                aria-label={`Delete ${h.name}`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: "none",
                  background: "transparent",
                  color: "#ef4444",
                  fontSize: 24,
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  padding: 0,
                }}
              >
                x
              </button>

              {openMenuHabitId === h.id && (
                <div
                  style={{
                    position: "absolute",
                    top: 34,
                    right: 0,
                    minWidth: 130,
                    borderRadius: 8,
                    border: "1px solid #374151",
                    background: "#11151C",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
                    padding: 6,
                    zIndex: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleRenameFromMenu(h)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "none",
                      background: "transparent",
                      color: "#e5e7eb",
                      cursor: "pointer",
                    }}
                  >
                    Rename
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => toggleDoneForAsOf(h)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #374151",
                background: h.doneToday ? "#16a34a" : "#7D4E57",
                color: "#fff",
                minWidth: 120,
              }}
            >
              {h.doneToday ? "Done" : "Mark done"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
