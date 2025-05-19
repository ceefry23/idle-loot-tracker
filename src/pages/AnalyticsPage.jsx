import { useState, useMemo, useEffect } from "react";
import useDungeonRuns from "../hooks/useDungeonRuns";
import useBossRuns from "../hooks/useBossRuns";

function AverageRunsPerDrop({ runs, type }) {
  const uniqueEntities = useMemo(() => {
    const set = new Set(runs.map((r) => (type === "dungeon" ? r.dungeon : r.boss)));
    return Array.from(set);
  }, [runs, type]);

  const allLootItems = useMemo(() => {
    const lootSet = new Set();
    runs.forEach((run) => {
      if (run.loot && run.loot.length) {
        run.loot.forEach(({ name }) => lootSet.add(name));
      }
    });
    return Array.from(lootSet);
  }, [runs]);

  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedDrop, setSelectedDrop] = useState("any");

  // Initialize selectedEntity when uniqueEntities changes
  useEffect(() => {
    if (uniqueEntities.length > 0 && !uniqueEntities.includes(selectedEntity)) {
      setSelectedEntity(uniqueEntities[0]);
    }
  }, [uniqueEntities, selectedEntity]);

  // Reset selectedDrop to "any" when loot items change
  useEffect(() => {
    setSelectedDrop("any");
  }, [allLootItems]);

  const averageRunsPerDrop = useMemo(() => {
    if (!selectedEntity) return null;

    const filteredRuns = runs.filter((r) =>
      type === "dungeon" ? r.dungeon === selectedEntity : r.boss === selectedEntity
    );

    const totalRuns = filteredRuns.length;

    if (selectedDrop === "any") {
      const dropRunsCount = filteredRuns.filter((run) => run.loot && run.loot.length > 0).length;
      return {
        totalRuns,
        averages: [
          {
            item: "Any Drop",
            avgRunsPerDrop: dropRunsCount ? (totalRuns / dropRunsCount).toFixed(2) : "N/A",
          },
        ],
      };
    } else {
      const dropCounts = {};
      filteredRuns.forEach((run) => {
        if (run.loot && run.loot.length) {
          run.loot.forEach(({ name }) => {
            dropCounts[name] = (dropCounts[name] || 0) + 1;
          });
        }
      });

      const count = dropCounts[selectedDrop] || 0;

      return {
        totalRuns,
        averages: [
          {
            item: selectedDrop,
            avgRunsPerDrop: count ? (totalRuns / count).toFixed(2) : "N/A",
          },
        ],
      };
    }
  }, [runs, selectedEntity, selectedDrop, type]);

  if (!selectedEntity) return <div className="text-yellow-300">No {type}s found.</div>;

  return (
    <div className="mt-6 p-4 rounded-xl bg-gray-800 bg-opacity-40 text-yellow-300 flex-1">
      <label className="block mb-2 font-semibold">
        Select {type.charAt(0).toUpperCase() + type.slice(1)}:
        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="ml-2 bg-gray-900 text-yellow-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {uniqueEntities.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </select>
      </label>

      <label className="block mb-4 font-semibold">
        Select Drop:
        <select
          value={selectedDrop}
          onChange={(e) => setSelectedDrop(e.target.value)}
          className="ml-2 bg-gray-900 text-yellow-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="any">Any Drop</option>
          {allLootItems.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <div>
        <div>Total Runs: {averageRunsPerDrop.totalRuns}</div>
        <div className="mt-2 font-semibold">Average Runs per Drop:</div>
        {averageRunsPerDrop.averages[0].avgRunsPerDrop === "N/A" ? (
          <div>No drops recorded for this selection.</div>
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

  const [selectedEntity, setSelectedEntity] = useState("");

  // Initialize selectedEntity when uniqueEntities changes
  useEffect(() => {
    if (uniqueEntities.length > 0 && !uniqueEntities.includes(selectedEntity)) {
      setSelectedEntity(uniqueEntities[0]);
    }
  }, [uniqueEntities, selectedEntity]);

  const stats = useMemo(() => {
    if (!selectedEntity) return null;

    const filteredRuns = runs
      .filter((r) => (type === "dungeon" ? r.dungeon === selectedEntity : r.boss === selectedEntity))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

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

    let currentRunsWithoutDrop = 0;
    for (let i = filteredRuns.length - 1; i >= 0; i--) {
      if (!filteredRuns[i].loot || filteredRuns[i].loot.length === 0) {
        currentRunsWithoutDrop++;
      } else {
        break;
      }
    }

    return { currentRunsWithoutDrop, longestStreak };
  }, [runs, selectedEntity, type]);

  if (!selectedEntity) return <div className="text-yellow-300">No {type}s found.</div>;

  return (
    <div className="mt-6 p-4 rounded-xl bg-gray-800 bg-opacity-40 text-yellow-300 flex-1">
      <label className="block mb-2 font-semibold">
        Select {type.charAt(0).toUpperCase() + type.slice(1)}:
        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="ml-2 bg-gray-900 text-yellow-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {uniqueEntities.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </select>
      </label>
      <div>
        <div>Current Runs Without a Drop: {stats.currentRunsWithoutDrop}</div>
        <div>Longest Run Without a Drop: {stats.longestStreak}</div>
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
