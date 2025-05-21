// src/pages/DungeonPage.jsx
import { useState, useMemo } from "react";
import { useCharactersContext } from "../context/CharacterContext";
import useDungeonRuns from "../hooks/useDungeonRuns";
import DungeonForm from "../components/Dungeon/DungeonForm";
import CharacterSelector from "../components/common/CharacterSelector";

export default function DungeonPage() {
  const { characters } = useCharactersContext();
  const { runs, setRuns, addRun, removeRun, clearRuns } = useDungeonRuns();

  // selected character for new runs
  const [selectedCharacterId, setSelectedCharacterId] = useState("");

  // filters
  const [filterCharacter, setFilterCharacter] = useState("");
  const [filterDungeon, setFilterDungeon]     = useState("all");
  const [filterLoot, setFilterLoot]           = useState("all");

  // derived dungeons & loots
  const dungeonsRun = useMemo(
    () => Array.from(new Set(runs.map((r) => r.dungeon))),
    [runs]
  );
  const uniqueLoots = useMemo(() => {
    const s = new Set();
    runs.forEach((r) => r.loot?.forEach((i) => s.add(i.name)));
    return Array.from(s);
  }, [runs]);

  // apply filters
  const filteredRuns = runs.filter((run) => {
    if (filterCharacter && run.characterId !== filterCharacter) return false;
    if (filterDungeon !== "all" && run.dungeon !== filterDungeon)   return false;
    if (filterLoot === "drops") return run.loot?.length > 0;
    if (filterLoot !== "all")    return run.loot?.some((l) => l.name === filterLoot);
    return true;
  });

  // totals
  const totalSpent  = filteredRuns.reduce((sum, r) => sum + (r.cost   || 0), 0);
  const totalProfit = filteredRuns.reduce((sum, r) => sum + (r.profit || 0), 0);
  const net         = totalProfit - totalSpent;

  // helper: update profit inline
  function updateProfit(id, v) {
    setRuns((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, profit: parseFloat(v) || 0 } : r
      )
    );
  }

  function clearFilters() {
    setFilterCharacter("");
    setFilterDungeon("all");
    setFilterLoot("all");
  }

  return (
    <div>
      {/* Header Banner */}
      <img
        src="/images/idle_loot_tracker.png"
        alt="Loot Tracker Banner"
        className="w-full max-w-md mx-auto mb-6 rounded-xl shadow-lg"
      />

      {/* Universal Character Selector */}
      <CharacterSelector
        selectedId={selectedCharacterId}
        onSelect={setSelectedCharacterId}
      />

      {/* Dungeon Form */}
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3 text-yellow-300">
          Log Dungeon Run
        </h2>
        <DungeonForm
          characters={characters}
          onAddRun={(run) => addRun({ ...run, id: Date.now().toString() })}
          defaultCharacterId={selectedCharacterId}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterCharacter}
            onChange={(e) => setFilterCharacter(e.target.value)}
            className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
          >
            <option value="">All Characters</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterDungeon}
            onChange={(e) => setFilterDungeon(e.target.value)}
            className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
          >
            <option value="all">All Dungeons</option>
            {dungeonsRun.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={filterLoot}
            onChange={(e) => setFilterLoot(e.target.value)}
            className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
          >
            <option value="all">All Runs</option>
            <option value="drops">Runs With Loot</option>
            {uniqueLoots.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <button
          onClick={clearFilters}
          className="px-4 py-2 rounded-xl bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 transition"
        >
          Clear Filters
        </button>
      </div>

      {/* Runs Table & Summary */}
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-yellow-300">Dungeon Runs</h2>
          {runs.length > 0 && (
            <button
              onClick={() => window.confirm("Are you sure you want to clear all entries?") && clearRuns()}
              className="text-xs text-red-300 hover:text-red-200 underline"
            >
              Clear all
            </button>
          )}
        </div>
        {filteredRuns.length === 0 ? (
          <div className="text-gray-500 py-4 text-center">
            No dungeon runs found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-800 text-yellow-400">
                    <th className="py-3 px-4 text-left">Character</th>
                    <th className="py-3 px-4 text-left">Dungeon</th>
                    <th className="py-3 px-4 text-left">Cost</th>
                    <th className="py-3 px-4 text-left">Loot</th>
                    <th className="py-3 px-4 text-left">Profit</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRuns
                    .slice()
                    .sort((a, b) => {
                      const diff = new Date(b.date) - new Date(a.date);
                      if (diff) return diff;
                      return String(b.id || "").localeCompare(String(a.id || ""));
                    })
                    .map((run) => (
                      <tr
                        key={run.id}
                        className="border-b border-gray-800 hover:bg-yellow-900/10 transition"
                      >
                        <td className="py-2 px-4 text-yellow-200">
                          {characters.find((c) => c.id === run.characterId)?.name}
                        </td>
                        <td className="py-2 px-4 text-yellow-100">{run.dungeon}</td>
                        <td className="py-2 px-4 text-yellow-100">${run.cost}</td>
                        <td className="py-2 px-4">
                          {run.loot?.length ? (
                            run.loot.map((item) => (
                              <span
                                key={item.name}
                                className={`inline-block mr-2 mb-1 px-2 py-1 rounded-full border text-xs align-middle ${item.rarity === "Standard"
                                  ? "bg-gray-700 text-gray-200 border-gray-600"
                                  : item.rarity === "Refined"
                                  ? "bg-blue-800 text-blue-200 border-blue-400"
                                  : item.rarity === "Premium"
                                  ? "bg-green-800 text-green-200 border-green-400"
                                  : item.rarity === "Epic"
                                  ? "bg-red-900 text-red-300 border-red-400"
                                  : item.rarity === "Legendary"
                                  ? "bg-yellow-500 text-yellow-900 border-yellow-300 font-extrabold"
                                  : "bg-orange-600 text-orange-100 border-orange-300 font-extrabold"
                                }`}
                              >
                                {item.name}
                              </span>
                            ))
                          ) : (
                            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-full border text-xs">
                              None
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={run.profit ?? ""}
                            onChange={(e) => updateProfit(run.id, e.target.value)}
                            className="w-20 rounded border border-yellow-600 bg-gray-800 px-2 py-1 text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Profit"
                          />
                        </td>
                        <td className="py-2 px-4 text-gray-200">
                          {new Date(run.date).toLocaleDateString(undefined, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => window.confirm("Delete this entry?") && removeRun(run.id)}
                            className="text-xs text-red-400 hover:text-red-200 underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-yellow-900 bg-opacity-20 text-yellow-300 font-semibold flex justify-around max-w-md mx-auto">
              <div>
                <div className="text-sm">Total Spent</div>
                <div className="text-lg text-yellow-400">${totalSpent.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm">Total Profit</div>
                <div className="text-lg text-yellow-400">${totalProfit.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm">Net</div>
                <div className={`text-lg font-bold ${net >= 0 ? "text-green-400" : "text-red-500"}`}>
                  ${net.toLocaleString()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
