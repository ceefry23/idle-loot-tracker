import { useState, useMemo } from "react";
import useDungeonRuns from "../hooks/useDungeonRuns";
import useBossRuns from "../hooks/useBossRuns";

function AverageRunsPerDrop({ runs, type }) {
  const uniqueEntities = useMemo(() => {
    const set = new Set(runs.map((r) => (type === "dungeon" ? r.dungeon : r.boss)));
    return Array.from(set);
  }, [runs, type]);

  const [selectedEntity, setSelectedEntity] = useState(uniqueEntities[0] || "");

  const averageRunsPerDrop = useMemo(() => {
    if (!selectedEntity) return null;

    const filteredRuns = runs.filter((r) =>
      type === "dungeon" ? r.dungeon === selectedEntity : r.boss === selectedEntity
    );

    const totalRuns = filteredRuns.length;

    const dropCounts = {};
    filteredRuns.forEach((run) => {
      if (run.loot && run.loot.length) {
        run.loot.forEach(({ name }) => {
          dropCounts[name] = (dropCounts[name] || 0) + 1;
        });
      }
    });

    const averages = Object.entries(dropCounts).map(([item, count]) => ({
      item,
      avgRunsPerDrop: (totalRuns / count).toFixed(2),
    }));

    return { totalRuns, averages };
  }, [runs, selectedEntity, type]);

  if (!selectedEntity) return <div className="text-yellow-300">No {type}s found.</div>;

  return (
    <div className="mt-6 p-4 rounded-xl bg-yellow-900 bg-opacity-20 text-yellow-300 flex-1">
      <label className="block mb-2 font-semibold">
        Select {type.charAt(0).toUpperCase() + type.slice(1)}:
        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="ml-2 bg-gray-800 text-yellow-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {uniqueEntities.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </select>
      </label>
      <div>
        <div>Total Runs: {averageRunsPerDrop.totalRuns}</div>
        <div className="mt-2 font-semibold">Average Runs per Drop:</div>
        {averageRunsPerDrop.averages.length === 0 ? (
          <div>No drops recorded for this {type}.</div>
        ) : (
          <ul className="list-disc list-inside max-h-48 overflow-y-auto">
            {averageRunsPerDrop.averages.map(({ item, avgRunsPerDrop }) => (
              <li key={item}>
                {item}: {avgRunsPerDrop}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function RunsWithoutDrop({ runs, type }) {
  const uniqueEntities = useMemo(() => {
    const set = new Set(runs.map((r) => (type === "dungeon" ? r.dungeon : r.boss)));
    return Array.from(set);
  }, [runs, type]);

  const [selectedEntity, setSelectedEntity] = useState(uniqueEntities[0] || "");

  const stats = useMemo(() => {
    if (!selectedEntity) return null;

    // Filter runs by selected entity and sort by date ascending (assuming run.date is ISO string)
    const filteredRuns = runs
      .filter((r) => (type === "dungeon" ? r.dungeon === selectedEntity : r.boss === selectedEntity))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Count total runs without loot drops
    const runsWithoutDropCount = filteredRuns.filter(run => !run.loot || run.loot.length === 0).length;

    // Find longest consecutive runs without drops
    let longestStreak = 0;
    let currentStreak = 0;

    filteredRuns.forEach(run => {
      if (!run.loot || run.loot.length === 0) {
        currentStreak++;
        if (currentStreak > longestStreak) longestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    return { runsWithoutDropCount, longestStreak };
  }, [runs, selectedEntity, type]);

  if (!selectedEntity) return <div className="text-yellow-300">No {type}s found.</div>;

  return (
    <div className="mt-6 p-4 rounded-xl bg-yellow-900 bg-opacity-20 text-yellow-300 flex-1">
      <label className="block mb-2 font-semibold">
        Select {type.charAt(0).toUpperCase() + type.slice(1)}:
        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="ml-2 bg-gray-800 text-yellow-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {uniqueEntities.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </select>
      </label>
      <div>
        <div>Total Runs Without Drop: {stats.runsWithoutDropCount}</div>
        <div>Longest Run Without Drop: {stats.longestStreak}</div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { runs: dungeonRuns } = useDungeonRuns();
  const { runs: bossRuns } = useBossRuns();

  const [activeTab, setActiveTab] = useState("dungeons");

  function aggregateRuns(runs) {
    const totalRuns = runs.length;
    const totalSpent = runs.reduce((sum, run) => sum + (run.cost ?? 0), 0);
    const totalProfit = runs.reduce((sum, run) => sum + (run.profit ?? 0), 0);
    const totalNet = totalProfit - totalSpent;

    return { totalRuns, totalSpent, totalProfit, totalNet };
  }

  const dungeonStats = useMemo(() => aggregateRuns(dungeonRuns), [dungeonRuns]);
  const bossStats = useMemo(() => aggregateRuns(bossRuns), [bossRuns]);

  return (
    <>
      <img
        src="/images/idle_loot_tracker.png"
        alt="Loot Tracker Banner"
        className="w-full max-w-md mx-auto mb-6 rounded-xl shadow-lg"
      />

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab("dungeons")}
          className={`px-6 py-2 rounded-xl font-semibold transition ${
            activeTab === "dungeons"
              ? "bg-yellow-500 text-gray-900"
              : "bg-gray-800 text-yellow-300"
          }`}
        >
          Dungeons
        </button>
        <button
          onClick={() => setActiveTab("bosses")}
          className={`px-6 py-2 rounded-xl font-semibold transition ${
            activeTab === "bosses"
              ? "bg-yellow-500 text-gray-900"
              : "bg-gray-800 text-yellow-300"
          }`}
        >
          Bosses
        </button>
      </div>

      {activeTab === "dungeons" && (
        <section className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8">
          <div className="flex justify-around text-yellow-300 text-center mb-6 flex-wrap gap-4">
            <div>
              <div className="text-sm">Total Runs</div>
              <div className="text-2xl font-bold">{dungeonStats.totalRuns}</div>
            </div>
            <div>
              <div className="text-sm">Total Spent</div>
              <div className="text-2xl font-bold">${dungeonStats.totalSpent.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm">Total Profit</div>
              <div className="text-2xl font-bold">${dungeonStats.totalProfit.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm">Net</div>
              <div
                className={`text-2xl font-bold ${
                  dungeonStats.totalNet > 0 ? "text-red-500" : "text-green-400"
                }`}
              >
                ${dungeonStats.totalNet.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-6">
            <AverageRunsPerDrop runs={dungeonRuns} type="dungeon" />
            <RunsWithoutDrop runs={dungeonRuns} type="dungeon" />
          </div>
        </section>
      )}

      {activeTab === "bosses" && (
        <section className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8">
          <div className="flex justify-around text-yellow-300 text-center mb-6 flex-wrap gap-4">
            <div>
              <div className="text-sm">Total Runs</div>
              <div className="text-2xl font-bold">{bossStats.totalRuns}</div>
            </div>
            <div>
              <div className="text-sm">Total Spent</div>
              <div className="text-2xl font-bold">${bossStats.totalSpent.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm">Total Profit</div>
              <div className="text-2xl font-bold">${bossStats.totalProfit.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm">Net</div>
              <div
                className={`text-2xl font-bold ${
                  bossStats.totalNet > 0 ? "text-red-500" : "text-green-400"
                }`}
              >
                ${bossStats.totalNet.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-6">
            <AverageRunsPerDrop runs={bossRuns} type="boss" />
            <RunsWithoutDrop runs={bossRuns} type="boss" />
          </div>
        </section>
      )}
    </>
  );
}
