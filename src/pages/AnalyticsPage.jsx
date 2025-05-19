import { useState, useMemo } from "react";
import useCharacters from "../hooks/useCharacters";
import useDungeonRuns from "../hooks/useDungeonRuns";
import useBossRuns from "../hooks/useBossRuns";

export default function AnalyticsPage() {
  const { characters } = useCharacters();
  const { runs: dungeonRuns } = useDungeonRuns();
  const { runs: bossRuns } = useBossRuns();

  const [activeTab, setActiveTab] = useState("dungeons");

  // Helper to get character name by id
  function getCharacterName(id) {
    const found = characters.find((c) => c.id === id);
    return found ? found.name : "Unknown";
  }

  // Aggregates profit and spent for given runs
  function aggregateRuns(runs) {
    const totalSpent = runs.reduce((sum, run) => sum + (run.cost ?? 0), 0);
    const totalProfit = runs.reduce((sum, run) => sum + (run.profit ?? 0), 0);
    const totalNet = totalProfit - totalSpent;

    // Aggregate item drop counts
    const dropCounts = {};
    runs.forEach((run) => {
      if (run.loot && run.loot.length) {
        run.loot.forEach(({ name }) => {
          dropCounts[name] = (dropCounts[name] || 0) + 1;
        });
      }
    });

    return { totalSpent, totalProfit, totalNet, dropCounts };
  }

  const dungeonStats = useMemo(() => aggregateRuns(dungeonRuns), [dungeonRuns]);
  const bossStats = useMemo(() => aggregateRuns(bossRuns), [bossRuns]);

  // Per character stats
  const characterStats = useMemo(() => {
    const stats = {};
    characters.forEach(({ id, name }) => {
      const dungeonRunsByChar = dungeonRuns.filter((run) => run.characterId === id);
      const bossRunsByChar = bossRuns.filter((run) => run.characterId === id);
      const dungeonAgg = aggregateRuns(dungeonRunsByChar);
      const bossAgg = aggregateRuns(bossRunsByChar);
      stats[id] = {
        name,
        dungeon: dungeonAgg,
        boss: bossAgg,
      };
    });
    return stats;
  }, [characters, dungeonRuns, bossRuns]);

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
        <button
          onClick={() => setActiveTab("characters")}
          className={`px-6 py-2 rounded-xl font-semibold transition ${
            activeTab === "characters"
              ? "bg-yellow-500 text-gray-900"
              : "bg-gray-800 text-yellow-300"
          }`}
        >
          Characters
        </button>
      </div>

      {activeTab === "dungeons" && (
        <section className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-300 mb-4">Dungeon Analytics</h2>
          <div className="flex justify-around">
            <div className="text-yellow-300 text-center">
              <div>Total Spent</div>
              <div className="text-2xl font-bold">${dungeonStats.totalSpent.toLocaleString()}</div>
            </div>
            <div className="text-yellow-300 text-center">
              <div>Total Profit</div>
              <div className="text-2xl font-bold">${dungeonStats.totalProfit.toLocaleString()}</div>
            </div>
            <div className="text-yellow-300 text-center">
              <div>Net</div>
              <div
                className={`text-2xl font-bold ${
                  dungeonStats.totalNet > 0 ? "text-red-500" : "text-green-400"
                }`}
              >
                ${dungeonStats.totalNet.toLocaleString()}
              </div>
            </div>
          </div>
          <h3 className="mt-6 mb-2 text-yellow-400 font-semibold">Item Drop Counts</h3>
          <ul className="list-disc list-inside text-yellow-300 max-h-48 overflow-y-auto">
            {Object.entries(dungeonStats.dropCounts).map(([item, count]) => (
              <li key={item}>
                {item}: {count}
              </li>
            ))}
            {Object.keys(dungeonStats.dropCounts).length === 0 && <li>None</li>}
          </ul>
        </section>
      )}

      {activeTab === "bosses" && (
        <section className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-300 mb-4">Boss Analytics</h2>
          <div className="flex justify-around">
            <div className="text-yellow-300 text-center">
              <div>Total Spent</div>
              <div className="text-2xl font-bold">${bossStats.totalSpent.toLocaleString()}</div>
            </div>
            <div className="text-yellow-300 text-center">
              <div>Total Profit</div>
              <div className="text-2xl font-bold">${bossStats.totalProfit.toLocaleString()}</div>
            </div>
            <div className="text-yellow-300 text-center">
              <div>Net</div>
              <div
                className={`text-2xl font-bold ${
                  bossStats.totalNet > 0 ? "text-red-500" : "text-green-400"
                }`}
              >
                ${bossStats.totalNet.toLocaleString()}
              </div>
            </div>
          </div>
          <h3 className="mt-6 mb-2 text-yellow-400 font-semibold">Item Drop Counts</h3>
          <ul className="list-disc list-inside text-yellow-300 max-h-48 overflow-y-auto">
            {Object.entries(bossStats.dropCounts).map(([item, count]) => (
              <li key={item}>
                {item}: {count}
              </li>
            ))}
            {Object.keys(bossStats.dropCounts).length === 0 && <li>None</li>}
          </ul>
        </section>
      )}

      {activeTab === "characters" && (
        <section className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8 overflow-auto max-h-[600px]">
          <h2 className="text-xl font-semibold text-yellow-300 mb-4">Per Character Breakdown</h2>
          <table className="min-w-full text-sm rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-yellow-400">
                <th className="py-3 px-4 text-left">Character</th>
                <th className="py-3 px-4 text-left">Dungeon Spent</th>
                <th className="py-3 px-4 text-left">Dungeon Profit</th>
                <th className="py-3 px-4 text-left">Dungeon Net</th>
                <th className="py-3 px-4 text-left">Boss Spent</th>
                <th className="py-3 px-4 text-left">Boss Profit</th>
                <th className="py-3 px-4 text-left">Boss Net</th>
              </tr>
            </thead>
            <tbody>
              {characters.map(({ id, name }) => {
                const charStats = characterStats[id];
                return (
                  <tr key={id} className="border-b border-gray-800 hover:bg-yellow-900/10 transition">
                    <td className="py-2 px-4 text-yellow-200">{name}</td>
                    <td className="py-2 px-4 text-yellow-100">{charStats?.dungeon.totalSpent.toLocaleString() ?? 0}</td>
                    <td className="py-2 px-4 text-yellow-100">{charStats?.dungeon.totalProfit.toLocaleString() ?? 0}</td>
                    <td className={`py-2 px-4 font-bold ${charStats?.dungeon.totalNet > 0 ? "text-red-500" : "text-green-400"}`}>
                      {charStats?.dungeon.totalNet.toLocaleString() ?? 0}
                    </td>
                    <td className="py-2 px-4 text-yellow-100">{charStats?.boss.totalSpent.toLocaleString() ?? 0}</td>
                    <td className="py-2 px-4 text-yellow-100">{charStats?.boss.totalProfit.toLocaleString() ?? 0}</td>
                    <td className={`py-2 px-4 font-bold ${charStats?.boss.totalNet > 0 ? "text-red-500" : "text-green-400"}`}>
                      {charStats?.boss.totalNet.toLocaleString() ?? 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
