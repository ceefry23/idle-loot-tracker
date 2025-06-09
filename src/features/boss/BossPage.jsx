import { useState, useMemo } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useCharactersContext } from "../character/CharacterContext";
import useHybridBossRuns from "./useHybridBossRuns";
import BossForm from './BossForm';
import CharacterSelector from '../character/CharacterSelector';
import FilterPanel from "../../components/common/FilterPanel";
import DatePickerFilter from "../../components/common/DatePickerFilter";

const rarityColors = {
  Standard: "text-gray-200",
  Refined: "text-blue-400",
  Premium: "text-green-400",
  Epic: "text-red-400 font-bold",
  Legendary: "text-yellow-400 font-extrabold",
  Mythic: "text-orange-300 font-extrabold",
};

const columns = [
  { label: "#", key: "number", sortable: false },
  { label: "Character", key: "character", sortable: true },
  { label: "Boss", key: "boss", sortable: true },
  { label: "Cost", key: "cost", sortable: true },
  { label: "Loot", key: "loot", sortable: false },
  { label: "Profit", key: "reward", sortable: true },
  { label: "Date", key: "date", sortable: true },
  { label: "", key: "actions", sortable: false },
];

export default function BossPage() {
  const { characters } = useCharactersContext();
  const { runs, addRun, updateRun, removeRun, clearRuns } = useHybridBossRuns();

  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [filterCharacter, setFilterCharacter] = useState("");
  const [filterBoss, setFilterBoss] = useState("all");
  const [filterLoot, setFilterLoot] = useState("all");
  const [filterRarity, setFilterRarity] = useState("all");
  const [filterDate, setFilterDate] = useState(null);
  const [pendingRunDelete, setPendingRunDelete] = useState(null);
  const [pendingClearAll, setPendingClearAll] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc"); // default: newest first

  const charLabel = !filterCharacter
    ? "All Characters"
    : characters.find(c => c.id === filterCharacter)?.name || "Unknown";
  const bossLabel = filterBoss === "all" || !filterBoss
    ? "All Bosses"
    : filterBoss;

  function lootLabel() {
    if (filterLoot === "all") return "All Runs";
    if (filterLoot === "drops") return "Runs With Loot";
    if (filterLoot === "ignore_chests") return "Ignoring Chests";
    return filterLoot;
  }

  const charMap = useMemo(
    () => Object.fromEntries(characters.map((c) => [c.id, c.name])),
    [characters]
  );
  const bossesRun = useMemo(
    () => Array.from(new Set(runs.map((r) => r.boss))),
    [runs]
  );
  const uniqueLoots = useMemo(() => {
    const s = new Set();
    runs.forEach((r) => r.loot?.forEach((i) => s.add(i.name)));
    return Array.from(s);
  }, [runs]);

  // --- Chronological index (sticky run numbering) ---
  const chronologicalIds = useMemo(
    () =>
      runs
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((r) => r.id),
    [runs]
  );
  const idToChronoNumber = useMemo(() => {
    const map = {};
    chronologicalIds.forEach((id, idx) => {
      map[id] = idx + 1;
    });
    return map;
  }, [chronologicalIds]);

  // --- Filtering logic (with rarity and date) ---
  const filteredRuns = runs.filter((run) => {
    if (filterCharacter && run.characterId !== filterCharacter) return false;
    if (filterBoss !== "all" && run.boss !== filterBoss) return false;
    if (filterLoot === "drops") {
      if (!(run.loot?.length > 0)) return false;
    }
    if (filterLoot === "ignore_chests") {
      if (run.loot?.some((l) => /chest/i.test(l.name))) return false;
    }
    if (
      filterLoot !== "all" &&
      filterLoot !== "drops" &&
      filterLoot !== "ignore_chests"
    ) {
      if (!run.loot?.some((l) => l.name === filterLoot)) return false;
    }
    if (filterRarity !== "all") {
      if (!run.loot?.some((l) => l.rarity === filterRarity)) return false;
    }
    // Date filtering
    if (filterDate) {
      const runDate = new Date(run.date);
      const selectedDate = new Date(filterDate);
      if (
        runDate.getFullYear() !== selectedDate.getFullYear() ||
        runDate.getMonth() !== selectedDate.getMonth() ||
        runDate.getDate() !== selectedDate.getDate()
      )
        return false;
    }
    return true;
  });

  // --- Sorting logic ---
  const sortedRuns = [...filteredRuns].sort((a, b) => {
    let valA, valB;
    switch (sortBy) {
      case "character":
        valA = charMap[a.characterId] || "";
        valB = charMap[b.characterId] || "";
        break;
      case "boss":
        valA = a.boss || "";
        valB = b.boss || "";
        break;
      case "cost":
        valA = a.cost || 0;
        valB = b.cost || 0;
        break;
      case "reward":
        valA = a.reward || 0;
        valB = b.reward || 0;
        break;
      case "date":
        valA = new Date(a.date);
        valB = new Date(b.date);
        break;
      default:
        valA = a[sortBy];
        valB = b[sortBy];
    }

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalCost = filteredRuns.reduce((sum, r) => sum + (r.cost || 0), 0);
  const totalProfit = filteredRuns.reduce((sum, r) => sum + (r.reward || 0), 0);
  const net = totalProfit - totalCost;

  function handleCostChange(id, v) {
    const value = parseFloat(v);
    updateRun(id, { cost: isNaN(value) ? 0 : value });
  }
  function handleProfitChange(id, v) {
    const value = parseFloat(v);
    updateRun(id, { reward: isNaN(value) ? 0 : value });
  }

  function clearFilters() {
    setFilterCharacter("");
    setFilterBoss("all");
    setFilterLoot("all");
    setFilterRarity("all");
    setFilterDate(null);
  }
  function confirmRunDelete() {
    removeRun(pendingRunDelete);
    setPendingRunDelete(null);
  }
  function confirmClearAll() {
    clearRuns();
    setPendingClearAll(false);
  }

  function handleSort(col) {
    if (!col.sortable) return;
    if (sortBy === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col.key);
      setSortDir(col.key === "date" ? "desc" : "asc"); // default for date is newest first
    }
  }

  return (
    <div>
      {/* Header Banner */}
      <img
        src="/images/idle_loot_tracker.png"
        alt="Loot Tracker Banner"
        className="w-full max-w-md h-40 mx-auto mb-6 rounded-xl object-contain"
      />

      <CharacterSelector
        selectedId={selectedCharacterId}
        onSelect={setSelectedCharacterId}
      />

      {/* Boss Form */}
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3 text-yellow-300">
          Log Boss Kill
        </h2>
        <BossForm
          characters={characters}
          onAddRun={(run) => addRun({ ...run, id: Date.now().toString() })}
          defaultCharacterId={selectedCharacterId}
        />
      </div>

      <FilterPanel>
        <div className="flex flex-wrap gap-4 items-center">
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
            value={filterBoss}
            onChange={(e) => setFilterBoss(e.target.value)}
            className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
          >
            <option value="all">All Bosses</option>
            {bossesRun.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={filterLoot}
            onChange={(e) => setFilterLoot(e.target.value)}
            className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
          >
            <option value="all">All Runs</option>
            <option value="drops">Runs With Loot</option>
            <option value="ignore_chests">Ignore Chests</option>
            {uniqueLoots.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select
            value={filterRarity}
            onChange={e => setFilterRarity(e.target.value)}
            className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
          >
            <option value="all">All Rarities</option>
            <option value="Standard">Standard</option>
            <option value="Refined">Refined</option>
            <option value="Premium">Premium</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
            <option value="Mythic">Mythic</option>
          </select>
          <DatePickerFilter date={filterDate} setDate={setFilterDate} />
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 transition"
          >
            Clear Filters
          </button>
        </div>
      </FilterPanel>

      {/* Filter summary with loot & rarity */}
      <div className="text-lg font-semibold text-yellow-300 mb-6 text-center">
        Boss Runs – {charLabel} – {bossLabel} – {lootLabel()}
        {filterRarity !== "all" && <> – {filterRarity} only</>}
        {filterDate && (
          <>
            {" "}
            –{" "}
            {new Date(filterDate).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </>
        )}
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-yellow-300">Boss Runs</h2>
          {runs.length > 0 && (
            <button
              onClick={() => setPendingClearAll(true)}
              className="text-xs text-red-300 hover:text-red-200 underline"
            >
              Clear all
            </button>
          )}
        </div>

        {sortedRuns.length === 0 ? (
          <div className="text-gray-500 py-4 text-center">
            No boss runs found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-800 text-yellow-400">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="py-3 px-4 text-left select-none cursor-pointer"
                        onClick={() => handleSort(col)}
                      >
                        {col.label}
                        {col.sortable && sortBy === col.key && (
                          sortDir === "asc" ? (
                            <ChevronUp className="inline-block w-4 h-4 ml-1" />
                          ) : (
                            <ChevronDown className="inline-block w-4 h-4 ml-1" />
                          )
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRuns.map((run) => (
                    <tr
                      key={run.id}
                      className="border-b border-gray-800 hover:bg-yellow-900/10 transition"
                    >
                      <td className="py-2 px-4 text-yellow-400 font-bold">
                        {idToChronoNumber[run.id]}
                      </td>
                      <td className="py-2 px-4 text-yellow-200">
                        {charMap[run.characterId] || "Unknown"}
                      </td>
                      <td className="py-2 px-4 text-yellow-100">{run.boss}</td>
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={run.cost ?? ""}
                          onChange={(e) => handleCostChange(run.id, e.target.value)}
                          className="w-20 rounded border border-yellow-600 bg-gray-800 px-2 py-1 text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          placeholder="Cost"
                        />
                      </td>
                      <td className="py-2 px-4">
                        {run.loot?.length ? (
                          run.loot.map((item) => (
                            <span
                              key={item.name}
                              className={`${rarityColors[item.rarity]} mr-2`}
                            >
                              {item.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={run.reward ?? ""}
                          onChange={(e) => handleProfitChange(run.id, e.target.value)}
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
                          onClick={() => setPendingRunDelete(run.id)}
                          className="p-1 text-red-400 hover:text-red-200 rounded transition"
                          title="Delete Run"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Summary */}
            <div className="mt-6 p-4 rounded-xl bg-gray-800 border border-yellow-700 text-yellow-300 font-semibold flex justify-around max-w-md mx-auto">
              <div>
                <div className="text-sm">Total Cost</div>
                <div className="text-lg text-yellow-400">${totalCost.toLocaleString()}</div>
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

      {/* Confirmation Modal */}
      {(pendingRunDelete || pendingClearAll) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full text-center">
            <h2 className="text-xl text-yellow-300 font-semibold mb-4">
              {pendingClearAll ? "Clear all boss runs?" : "Delete this run entry?"}
            </h2>
            <p className="text-gray-300 mb-6">
              {pendingClearAll
                ? "This will remove all logged boss kills and cannot be undone."
                : "This action cannot be undone."}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setPendingRunDelete(null);
                  setPendingClearAll(false);
                }}
                className="px-4 py-2 bg-gray-800 text-yellow-300 rounded-xl hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  pendingClearAll ? confirmClearAll() : confirmRunDelete();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-500 transition"
              >
                {pendingClearAll ? "Clear All" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
