import { useState, useEffect } from "react";

const STORAGE_KEY = "idle_loot_boss_runs";

export default function useBossRuns() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setRuns(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  }, [runs]);

  function addRun(run) {
    setRuns((prev) => [...prev, { ...run, id: Date.now() }]);
  }
  function removeRun(id) {
    setRuns((prev) => prev.filter((r) => r.id !== id));
  }
  function clearRuns() {
    setRuns([]);
  }

  return { runs, addRun, removeRun, clearRuns, setRuns };
}
