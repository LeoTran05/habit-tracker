import { useEffect, useMemo, useState } from "react";
import {
  getHabitSummary,
  createHabit,
  completeHabit,
  uncompleteHabit,
} from "../api/habits.api";

// Turn YYYY-MM-DD into "Mon" etc (local display only)
function weekdayShort(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString(undefined, { weekday: "short" });
}

// A single day dot in the UI, showing weekday, date, and done/not done. Also highlights if it’s the current “asOf” date you’re looking at. Used in the habit summary list below. You can make this fancier with icons or colors if you like!
function DayDot({ date, done, isAsOf }) {
  return (
    <div style={{ textAlign: "center", width: 34 }}>
      <div style={{ fontSize: 12, color: "#9ca3af" }}>{weekdayShort(date)}</div>
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

// The main dashboard page, showing the habit summary and allowing creating/toggling habits. This is the default page after login. It uses the API functions defined in ../api/habits.api.js to interact with the backend.
export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // DEV “pretend today” date (defaults to backend “today” if empty)
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

  // Toggle done/not done for the given habit and current asOf date. If asOf is empty, backend treats it as today. 
  async function toggleDoneForAsOf(habit) {
    setError("");
    try {
      const date = asOf || undefined; // if empty, backend defaults to today
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

  if (!summary) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>Dashboard</h1>
        <p>Loading…</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  const asOfLabel = asOf ? asOf : summary.range.to; // display what you’re using

  return (
    <div style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Dashboard</h1>

      {/* DEV DATE CONTROL */}
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
          <div style={{ fontWeight: 700 }}>Dev date (pretend “today”)</div>
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

      <div style={{ marginBottom: 10, color: "#ffffff" }}>
        Range: {summary.range.from} → {summary.range.to} (asOf: {asOfLabel})
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

      <div style={{ display: "grid", gap: 12 }}>
        {summary.habits.map((h) => (
          <div
            key={h.id}
            style={{
              padding: 12,
              borderRadius: 10,
              background: "#5D737E",
              color: "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{h.name}</div>

              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
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

            <button
              onClick={() => toggleDoneForAsOf(h)}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #374151",
                background: h.doneToday ? "#16a34a" : "#7D4E57",
                color: "#fff",
                minWidth: 140,
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