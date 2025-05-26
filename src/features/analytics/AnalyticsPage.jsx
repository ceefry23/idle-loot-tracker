import { useState, useMemo } from "react";
import useHybridDungeonRuns from "../dungeon/useHybridDungeonRuns";
import useHybridBossRuns from "../boss/useHybridBossRuns";
import { useCharactersContext } from "../character/CharacterContext";
import FilterPanel from "../../components/common/FilterPanel";

// Helper for drop streaks
function getDropStreaks(runs) {
  const sorted = runs
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let longest = 0, current = 0, maxSoFar = 0;

  for (let i = 0; i < sorted.length; i++) {
    if (!sorted[i].loot || sorted[i].loot.length === 0) {
      current++;
      if (current > maxSoFar) maxSoFar = current;
    } else {
      current = 0;
    }
  }
  longest = maxSoFar;

  let curStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (!sorted[i].loot || sorted[i].loot.length === 0) {
      curStreak++;
    } else {
      break;
    }
  }

  return { longest, current: curStreak };
}

export default function AnalyticsPage() {
  const { characters } = useCharactersContext();
  const { runs: dungeonRuns } = useHybridDungeonRuns();
  const { runs: bossRuns } = useHybridBossRuns();

  // Filters
  const [filterCharacter, setFilterCharacter] = useState("");
  const [filterDungeon, setFilterDungeon] = useState("");
  const [filterBoss, setFilterBoss] = useState("");
  const [excludeChests, setExcludeChests] = useState(false); // <-- New

  // Dropdown lists
  const dungeonList = useMemo(
    () => Array.from(new Set(dungeonRuns.map(r => r.dungeon))),
    [dungeonRuns]
  );
  const bossList = useMemo(
    () => Array.from(new Set(bossRuns.map(r => r.boss))),
    [bossRuns]
  );

  // Filtered runs
  const filteredDungeonRuns = useMemo(() => {
    const base = dungeonRuns.filter(r =>
      (!filterCharacter || r.characterId === filterCharacter) &&
      (!filterDungeon || r.dungeon === filterDungeon)
    );
    if (!excludeChests) return base;
    // Exclude Chest of Stones from loot for stats
    return base.map(run => ({
      ...run,
      loot: run.loot?.filter(item => !/chest of stones/i.test(item.name))
    }));
  }, [dungeonRuns, filterCharacter, filterDungeon, excludeChests]);

  const filteredBossRuns = useMemo(() => {
    const base = bossRuns.filter(r =>
      (!filterCharacter || r.characterId === filterCharacter) &&
      (!filterBoss || r.boss === filterBoss)
    );
    if (!excludeChests) return base;
    return base.map(run => ({
      ...run,
      loot: run.loot?.filter(item => !/chest of stones/i.test(item.name))
    }));
  }, [bossRuns, filterCharacter, filterBoss, excludeChests]);

  // Stats
  function aggregateRuns(runs, isBoss = false) {
    const totalRuns = runs.length;
    const totalSpent = runs.reduce((sum, run) => sum + (run.cost ?? 0), 0);
    const totalProfit = runs.reduce((sum, run) => sum + (isBoss ? (run.reward ?? 0) : (run.profit ?? 0)), 0);
    const totalNet = totalProfit - totalSpent;
    const totalDrops = runs.reduce((sum, run) => sum + (run.loot ? run.loot.length : 0), 0);
    const runsWithDrops = runs.filter(run => run.loot && run.loot.length > 0).length;
    const percentWithDrops = totalRuns > 0 ? ((runsWithDrops / totalRuns) * 100).toFixed(1) : "0.0";
    const { longest, current } = getDropStreaks(runs);
    return { totalRuns, totalSpent, totalProfit, totalNet, totalDrops, percentWithDrops, runsWithoutDrop: current, longestStreak: longest };
  }

  const dungeonStats = useMemo(() => aggregateRuns(filteredDungeonRuns), [filteredDungeonRuns]);
  const bossStats = useMemo(() => aggregateRuns(filteredBossRuns, true), [filteredBossRuns]);

  // Filter reset
  function clearFilters() {
    setFilterCharacter("");
    setFilterDungeon("");
    setFilterBoss("");
  }

  const charLabel = !filterCharacter
    ? "All Characters"
    : characters.find(c => c.id === filterCharacter)?.name || "Unknown";

  const dungeonLabel = !filterDungeon ? "All Dungeons" : filterDungeon;
  const bossLabel = !filterBoss ? "All Bosses" : filterBoss;

  return (
    <div>
      <img
        src="/images/idle_loot_tracker.png"
        alt="Loot Tracker Banner"
        className="w-full max-w-md h-40 mx-auto mb-6 rounded-xl object-contain"
      />

      {/* Filter Modal, now identical row as dungeon/boss pages */}
      <FilterPanel>
        <select
          value={filterCharacter}
          onChange={e => setFilterCharacter(e.target.value)}
          className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
        >
          <option value="">All Characters</option>
          {characters.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterDungeon}
          onChange={e => setFilterDungeon(e.target.value)}
          className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
        >
          <option value="">All Dungeons</option>
          {dungeonList.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={filterBoss}
          onChange={e => setFilterBoss(e.target.value)}
          className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2"
        >
          <option value="">All Bosses</option>
          {bossList.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <button
          onClick={clearFilters}
          className="px-4 py-2 rounded-xl bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 transition"
          type="button"
        >
          Clear Filters
        </button>
      </FilterPanel>

      {/* Dungeon Analytics */}
      <section className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8 flex flex-col items-center">
        <div className="text-lg font-semibold text-yellow-300 mb-8 text-center">
          Dungeon Runs – {charLabel} – {dungeonLabel}
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-center text-center">
          {/* Profit Stats Card (left) */}
          <div className="flex-1 bg-gray-800/80 rounded-xl p-6 flex flex-col items-center gap-2 border border-yellow-800 justify-center">
            <div className="text-yellow-300 text-md font-semibold mb-2">Profit Stats</div>
            <div className="flex flex-row gap-8 mb-2 w-full justify-center">
              <div>
                <div className="text-sm text-yellow-300">Total Spent</div>
                <div className="text-xl font-bold text-yellow-200">${dungeonStats.totalSpent.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-yellow-300">Total Profit</div>
                <div className="text-xl font-bold text-yellow-200">${dungeonStats.totalProfit.toLocaleString()}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">Net</div>
              <div className={`text-xl font-bold ${dungeonStats.totalNet >= 0 ? "text-green-400" : "text-red-500"}`}>
                ${dungeonStats.totalNet.toLocaleString()}
              </div>
            </div>
          </div>
          {/* Run/Drop Stats Card (right) */}
          <div className="flex-1 bg-gray-800/80 rounded-xl p-6 flex flex-col items-center gap-2 border border-yellow-800 justify-center">
            <div className="text-yellow-300 text-md font-semibold mb-2">Run/Drop Stats</div>
            <div>
              <div className="text-sm text-yellow-300">Total Runs</div>
              <div className="text-xl font-bold text-yellow-200">{dungeonStats.totalRuns}</div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">Total Drops</div>
              <div className="text-xl font-bold text-yellow-200">{dungeonStats.totalDrops}</div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">% With Drops</div>
              <div className="text-xl font-bold text-yellow-200">{dungeonStats.percentWithDrops}%</div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">Current Runs Without a Drop</div>
              <div className="text-xl font-bold text-yellow-200">{dungeonStats.runsWithoutDrop}</div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">Longest Run Without a Drop</div>
              <div className="text-xl font-bold text-yellow-200">{dungeonStats.longestStreak}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Boss Analytics */}
      <section className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8 flex flex-col items-center">
        <div className="text-lg font-semibold text-yellow-300 mb-8 text-center">
          Boss Runs – {charLabel} – {bossLabel}
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-center text-center">
          {/* Profit Stats Card (left) */}
          <div className="flex-1 bg-gray-800/80 rounded-xl p-6 flex flex-col items-center gap-2 border border-yellow-800 justify-center">
            <div className="text-yellow-300 text-md font-semibold mb-2">Profit Stats</div>
            <div className="flex flex-row gap-8 mb-2 w-full justify-center">
              <div>
                <div className="text-sm text-yellow-300">Total Spent</div>
                <div className="text-xl font-bold text-yellow-200">${bossStats.totalSpent.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-yellow-300">Total Profit</div>
                <div className="text-xl font-bold text-yellow-200">${bossStats.totalProfit.toLocaleString()}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">Net</div>
              <div className={`text-xl font-bold ${bossStats.totalNet >= 0 ? "text-green-400" : "text-red-500"}`}>
                ${bossStats.totalNet.toLocaleString()}
              </div>
            </div>
          </div>
          {/* Run/Drop Stats Card (right) */}
          <div className="flex-1 bg-gray-800/80 rounded-xl p-6 flex flex-col items-center gap-2 border border-yellow-800 justify-center">
            <div className="text-yellow-300 text-md font-semibold mb-2">Run/Drop Stats</div>
            <div>
              <div className="text-sm text-yellow-300">Total Runs</div>
              <div className="text-xl font-bold text-yellow-200">{bossStats.totalRuns}</div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">Total Drops</div>
              <div className="text-xl font-bold text-yellow-200">{bossStats.totalDrops}</div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">% With Drops</div>
              <div className="text-xl font-bold text-yellow-200">{bossStats.percentWithDrops}%</div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">Current Runs Without a Drop</div>
              <div className="text-xl font-bold text-yellow-200">{bossStats.runsWithoutDrop}</div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">Longest Run Without a Drop</div>
              <div className="text-xl font-bold text-yellow-200">{bossStats.longestStreak}</div>
            </div>
          </div>
        </div>

        {/* Exclude Chest of Stones - styled checkbox at bottom */}
        <div className="mt-8 w-full flex justify-center">
          <label
            htmlFor="exclude-chests"
            className="flex items-center gap-2 bg-gray-800 border border-yellow-700 rounded-xl px-5 py-3 text-yellow-200 cursor-pointer hover:bg-gray-700 transition"
          >
            <input
              type="checkbox"
              id="exclude-chests"
              checked={excludeChests}
              onChange={e => setExcludeChests(e.target.checked)}
              className="accent-yellow-500 w-5 h-5 rounded"
            />
            Exclude Chest of Stones
          </label>
        </div>
      </section>
    </div>
  );
}
