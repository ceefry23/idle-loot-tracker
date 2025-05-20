import { useState, useMemo } from "react";
import useCharacters from "../hooks/useCharacters";
import useBossRuns from "../hooks/useBossRuns";
import CharacterManager from "../components/Character/CharacterManager";
import BossForm from "../components/Boss/BossForm";

const rarityColors = {
  Common: "bg-gray-700 text-gray-200 border-gray-600",
  Uncommon: "bg-blue-800 text-blue-200 border-blue-400",
  Rare: "bg-green-800 text-green-200 border-green-400",
  Epic: "bg-red-900 text-red-300 border-red-400",
  Legendary: "bg-yellow-500 text-yellow-900 border-yellow-300 font-extrabold",
  Mythic: "bg-orange-600 text-orange-100 border-orange-300 font-extrabold",
};

export default function BossPage() {
  const { characters, addCharacter, removeCharacter } = useCharacters();
  const { runs, addRun, removeRun, clearRuns, setRuns } = useBossRuns();

  const [lastCharacterId, setLastCharacterId] = useState("");
  const [lastBoss, setLastBoss] = useState("");

  const [filterCharacter, setFilterCharacter] = useState("");
  const [filterBoss, setFilterBoss] = useState("all");
  const [filterLoot, setFilterLoot] = useState("all");

  function getCharacterName(id) {
    const found = characters.find((c) => c.id === id);
    return found ? found.name : "Unknown";
  }

  function updateProfit(id, value) {
    setRuns((prevRuns) =>
      prevRuns.map((run) =>
        run.id === id ? { ...run, profit: parseFloat(value) || 0 } : run
      )
    );
  }

  function updateCost(id, value) {
    setRuns((prevRuns) =>
      prevRuns.map((run) =>
        run.id === id ? { ...run, cost: parseInt(value) || 0 } : run
      )
    );
  }

  const bossesRun = useMemo(() => {
    const runBosses = new Set(runs.map((r) => r.boss));
    return Array.from(runBosses);
  }, [runs]);

  const uniqueLoots = useMemo(() => {
    const lootSet = new Set();
    runs.forEach((run) => {
      if (run.loot && run.loot.length) {
        run.loot.forEach((item) => lootSet.add(item.name));
      }
    });
    return Array.from(lootSet);
  }, [runs]);

  const filteredRuns = runs.filter((run) => {
    if (filterCharacter && run.characterId !== filterCharacter) return false;
    if (filterBoss !== "all" && run.boss !== filterBoss) return false;
    if (filterLoot === "drops") {
      if (!run.loot || run.loot.length === 0) return false;
    } else if (filterLoot !== "all") {
      if (!run.loot || !run.loot.some((l) => l.name === filterLoot)) return false;
    }
    return true;
  });

  function clearFilters() {
    setFilterCharacter("");
    setFilterBoss("all");
    setFilterLoot("all");
  }

  const totalSpent = filteredRuns.reduce((sum, run) => sum + (run.cost ?? 0), 0);
  const totalProfit = filteredRuns.reduce((sum, run) => sum + (run.profit ?? 0), 0);
  const totalLoss = totalSpent - totalProfit;

  function handleAddRun(run) {
    addRun(run);
    setLastCharacterId(run.characterId);
    setLastBoss(run.boss);
  }

  return (
    <div>
      <img
        src="/images/idle_loot_tracker.png"
        alt="Loot Tracker Banner"
        className="w-full max-w-md mx-auto mb-6 rounded-xl shadow-lg"
      />

      <CharacterManager
        characters={characters}
        addCharacter={addCharacter}
        removeCharacter={removeCharacter}
      />

      <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3 text-yellow-300">Log Boss Run</h2>
        <BossForm
          characters={characters}
          onAddRun={handleAddRun}
          defaultCharacterId={lastCharacterId}
          defaultBoss={lastBoss}
        />
      </div>

      {/* Filters with Clear Filters button aligned right */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterCharacter}
            onChange={(e) => setFilterCharacter(e.target.value)}
            className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
          >
            <option value="">All Characters</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterBoss}
            onChange={(e) => setFilterBoss(e.target.value)}
            className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
          >
            <option value="all">All Bosses</option>
            {bossesRun.map((bossName) => (
              <option key={bossName} value={bossName}>
                {bossName}
              </option>
            ))}
          </select>

          <select
            value={filterLoot}
            onChange={(e) => setFilterLoot(e.target.value)}
            className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
          >
            <option value="all">All Runs</option>
            <option value="drops">Runs With Loot</option>
            {uniqueLoots.map((loot) => (
              <option key={loot} value={loot}>
                {loot}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-yellow-300">Boss Runs</h2>
          {runs.length > 0 && (
            <button
              className="text-xs text-red-300 hover:text-red-200 underline"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to clear all entries?")
                ) {
                  clearRuns();
                }
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {filteredRuns.length === 0 ? (
          <div className="text-gray-500 py-4 text-center">No boss runs found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-800 text-yellow-400">
                    <th className="py-3 px-4 text-left">Character</th>
                    <th className="py-3 px-4 text-left">Boss</th>
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
                      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
                      if (dateDiff !== 0) return dateDiff;
                      return b.id.localeCompare(a.id);
                    })
                    .map((run) => (
                      <tr
                        key={run.id}
                        className="border-b border-gray-800 hover:bg-yellow-900/10 transition"
                      >
                        <td className="py-2 px-4 text-yellow-200">
                          {getCharacterName(run.characterId)}
                        </td>
                        <td className="py-2 px-4 text-yellow-100">{run.boss}</td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            min="0"
                            value={run.cost ?? ""}
                            onChange={(e) => updateCost(run.id, e.target.value)}
                            className="w-20 rounded border border-yellow-600 bg-gray-800 px-2 py-1 text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Cost"
                          />
                        </td>
                        <td className="py-2 px-4">
                          {!run.loot || run.loot.length === 0 ? (
                            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-full border border-gray-700 text-xs">
                              None
                            </span>
                          ) : (
                            run.loot.map((item) => (
                              <span
                                key={item.name}
                                className={`inline-block mr-2 mb-1 px-2 py-1 rounded-full border text-xs align-middle ${rarityColors[item.rarity]}`}
                                title={item.rarity}
                              >
                                {item.name}
                                <span className="ml-1 opacity-80">({item.rarity})</span>
                              </span>
                            ))
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
                            className="text-xs text-red-400 hover:text-red-200 underline"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this entry?"
                                )
                              )
                                removeRun(run.id);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Totals bubble */}
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
                <div className={`text-lg font-bold ${totalLoss > 0 ? "text-red-500" : "text-green-400"}`}>
                  ${totalLoss.toLocaleString()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
