import { useState, useEffect } from "react";

const STORAGE_KEY = "bossRuns";

export default function useBossRuns() {
  const [runs, setRuns] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  }, [runs]);

  function addRun(run) {
    setRuns((prev) => [...prev, run]);
  }

  function removeRun(id) {
    setRuns((prev) => prev.filter((r) => r.id !== id));
  }

  function clearRuns() {
    setRuns([]);
  }

  return { runs, setRuns, addRun, removeRun, clearRuns };
}
