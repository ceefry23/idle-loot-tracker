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

  // Persist to localStorage whenever runs change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  }, [runs]);

  /** Add a new run */
  function addRun(run) {
    setRuns((prev) => [...prev, run]);
  }

  /** Remove one run by id */
  function removeRun(id) {
    setRuns((prev) => prev.filter((r) => r.id !== id));
  }

  /** Clear all runs */
  function clearRuns() {
    setRuns([]);
  }

  /**
   * Update specific fields on a run
   * e.g. updateRun(id, { cost: 500, profit: 120 })
   */
  function updateRun(id, updates) {
    setRuns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }

  return { runs, addRun, removeRun, clearRuns, updateRun };
}
