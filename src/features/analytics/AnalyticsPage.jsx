import { useState, useMemo } from "react";
import useHybridDungeonRuns from "../dungeon/useHybridDungeonRuns";
import useHybridBossRuns from "../boss/useHybridBossRuns";
import { useCharactersContext } from "../character/CharacterContext";
import FilterPanel from "../../components/common/FilterPanel";
import DatePickerFilter from "../../components/common/DatePickerFilter";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  LabelList,
} from "recharts";

// Theme colors for charts
const RARITIES = [
  "None", "Standard", "Refined", "Premium", "Epic", "Legendary", "Mythic"
];
const RARITY_COLORS = {
  None: "#3b4252",
  Standard: "#a3b1c6",
  Refined: "#24b0ff",
  Premium: "#37ebc8",
  Epic: "#fc618d",
  Legendary: "#f7d038",
  Mythic: "#79ffe1",
};
const PRIMARY_COLOR = "#f7d038";
const SECONDARY_COLOR = "#24b0ff";

// For streak dropdowns
const RARITY_OPTIONS = [
  { value: "all", label: "Any" },
  { value: "Standard", label: "Standard" },
  { value: "Refined", label: "Refined" },
  { value: "Premium", label: "Premium" },
  { value: "Epic", label: "Epic" },
  { value: "Legendary", label: "Legendary" },
  { value: "Mythic", label: "Mythic" },
];

// Drop streaks helper (supports rarity)
function getDropStreaks(runs, rarity = "all") {
  const sorted = runs
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  let longest = 0, current = 0, maxSoFar = 0;
  for (let i = 0; i < sorted.length; i++) {
    const loot = sorted[i].loot ?? [];
    const isDrop =
      rarity === "all"
        ? loot.length > 0
        : loot.some(l => l.rarity === rarity);
    if (!isDrop) {
      current++;
      if (current > maxSoFar) maxSoFar = current;
    } else {
      current = 0;
    }
  }
  longest = maxSoFar;
  let curStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const loot = sorted[i].loot ?? [];
    const isDrop =
      rarity === "all"
        ? loot.length > 0
        : loot.some(l => l.rarity === rarity);
    if (!isDrop) {
      curStreak++;
    } else {
      break;
    }
  }
  return { longest, current: curStreak };
}

function isSameDay(date1, date2) {
  if (!date1 || !date2) return true;
  const d1 = new Date(date1), d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function countDropsByRarity(runs) {
  const counts = Object.fromEntries(RARITIES.map(r => [r, 0]));
  for (const run of runs) {
    if (!run.loot || run.loot.length === 0) {
      counts["None"]++;
    } else {
      for (const item of run.loot) {
        if (RARITIES.includes(item.rarity)) {
          counts[item.rarity]++;
        }
      }
    }
  }
  return counts;
}
function pieDataFromCounts(counts) {
  return Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .map(([rarity, count]) => ({
      name: rarity,
      value: count,
    }));
}
function profitSeries(runs, isBoss = false) {
  const daily = {};
  for (const run of runs) {
    const date = new Date(run.date);
    if (isNaN(date)) continue;
    const key = date.toLocaleDateString();
    if (!daily[key]) {
      daily[key] = { date: key, profit: 0 };
    }
    daily[key].profit += isBoss ? (run.reward ?? 0) - (run.cost ?? 0) : (run.profit ?? 0) - (run.cost ?? 0);
  }
  return Object.values(daily).sort((a, b) => new Date(a.date) - new Date(b.date));
}
function dropsPerThing(runs, field = "dungeon") {
  const group = {};
  for (const run of runs) {
    const key = run[field] || "Unknown";
    if (!group[key]) group[key] = 0;
    if (run.loot && run.loot.length > 0) group[key] += run.loot.length;
  }
  return Object.entries(group)
    .map(([name, drops]) => ({ name, drops }))
    .sort((a, b) => b.drops - a.drops);
}
function characterLeaderboard(runs, characters, isBoss = false) {
  const stats = {};
  for (const run of runs) {
    const char = run.characterId || "Unknown";
    if (!stats[char]) stats[char] = { char, runs: 0, profit: 0, name: characters.find(c => c.id === char)?.name || "Unknown" };
    stats[char].runs += 1;
    stats[char].profit += isBoss ? (run.reward ?? 0) - (run.cost ?? 0) : (run.profit ?? 0) - (run.cost ?? 0);
  }
  return Object.values(stats).sort((a, b) => b.profit - a.profit);
}
function PieLabel({ name, percent, x, y }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={16}
      fontWeight={700}
      fill="#fff"
      stroke="#222"
      strokeWidth={2}
      paintOrder="stroke"
      style={{ textShadow: "0 1px 8px #222a,0 1px 8px #000b" }}
    >
      {`${name}: ${(percent * 100).toFixed(1)}%`}
    </text>
  );
}
function PieChartByRarity({ counts }) {
  const data = pieDataFromCounts(counts);
  if (!data.length) return null;
  return (
    <div style={{ margin: "28px 0 36px 0" }}>
      <ResponsiveContainer width="100%" height={270}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={95}
            innerRadius={42}
            labelLine={true}
            label={PieLabel}
            paddingAngle={5}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={RARITY_COLORS[entry.name] || "#888"}
                stroke="#222"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            iconType="circle"
            formatter={(value) => (
              <span style={{ color: RARITY_COLORS[value] || "#eee", fontWeight: 600, fontSize: 16 }}>
                {value}
              </span>
            )}
            wrapperStyle={{ paddingTop: "10px", color: "#e0e0e0", fontSize: 15 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AnalyticsPage() {
  const { characters } = useCharactersContext();
  const { runs: dungeonRuns } = useHybridDungeonRuns();
  const { runs: bossRuns } = useHybridBossRuns();

  // Filters
  const [filterCharacter, setFilterCharacter] = useState("");
  const [filterDungeon, setFilterDungeon] = useState("");
  const [filterBoss, setFilterBoss] = useState("");
  const [excludeChests, setExcludeChests] = useState(false);
  const [filterDate, setFilterDate] = useState(null);

  // Streak rarity selectors (NEW)
  const [dungeonStreakRarity, setDungeonStreakRarity] = useState("all");
  const [bossStreakRarity, setBossStreakRarity] = useState("all");

  const dungeonList = useMemo(
    () => Array.from(new Set(dungeonRuns.map(r => r.dungeon))),
    [dungeonRuns]
  );
  const bossList = useMemo(
    () => Array.from(new Set(bossRuns.map(r => r.boss))),
    [bossRuns]
  );

  const filteredDungeonRuns = useMemo(() => {
    const base = dungeonRuns.filter(r =>
      (!filterCharacter || r.characterId === filterCharacter) &&
      (!filterDungeon || r.dungeon === filterDungeon) &&
      (!filterDate || isSameDay(r.date, filterDate))
    );
    if (!excludeChests) return base;
    return base.map(run => ({
      ...run,
      loot: run.loot?.filter(item => !/chest of stones/i.test(item.name))
    }));
  }, [dungeonRuns, filterCharacter, filterDungeon, excludeChests, filterDate]);
  const filteredBossRuns = useMemo(() => {
    const base = bossRuns.filter(r =>
      (!filterCharacter || r.characterId === filterCharacter) &&
      (!filterBoss || r.boss === filterBoss) &&
      (!filterDate || isSameDay(r.date, filterDate))
    );
    if (!excludeChests) return base;
    return base.map(run => ({
      ...run,
      loot: run.loot?.filter(item => !/chest of stones/i.test(item.name))
    }));
  }, [bossRuns, filterCharacter, filterBoss, excludeChests, filterDate]);

  function aggregateRuns(runs, isBoss = false, streakRarity = "all") {
    const totalRuns = runs.length;
    const totalSpent = runs.reduce((sum, run) => sum + (run.cost ?? 0), 0);
    const totalProfit = runs.reduce((sum, run) => sum + (isBoss ? (run.reward ?? 0) : (run.profit ?? 0)), 0);
    const totalNet = totalProfit - totalSpent;
    const totalDrops = runs.reduce((sum, run) => sum + (run.loot ? run.loot.length : 0), 0);
    const runsWithDrops = runs.filter(run => run.loot && run.loot.length > 0).length;
    const percentWithDrops = totalRuns > 0 ? ((runsWithDrops / totalRuns) * 100).toFixed(1) : "0.0";
    const { longest, current } = getDropStreaks(runs, streakRarity);
    return { totalRuns, totalSpent, totalProfit, totalNet, totalDrops, percentWithDrops, runsWithoutDrop: current, longestStreak: longest };
  }

  const dungeonStats = useMemo(
    () => aggregateRuns(filteredDungeonRuns, false, dungeonStreakRarity),
    [filteredDungeonRuns, dungeonStreakRarity]
  );
  const bossStats = useMemo(
    () => aggregateRuns(filteredBossRuns, true, bossStreakRarity),
    [filteredBossRuns, bossStreakRarity]
  );

  const dungeonRarityCounts = useMemo(() => countDropsByRarity(filteredDungeonRuns), [filteredDungeonRuns]);
  const bossRarityCounts = useMemo(() => countDropsByRarity(filteredBossRuns), [filteredBossRuns]);
  const dungeonProfitSeries = useMemo(() => profitSeries(filteredDungeonRuns), [filteredDungeonRuns]);
  const bossProfitSeries = useMemo(() => profitSeries(filteredBossRuns, true), [filteredBossRuns]);
  const dungeonDropsBar = useMemo(() => dropsPerThing(filteredDungeonRuns, "dungeon"), [filteredDungeonRuns]);
  const bossDropsBar = useMemo(() => dropsPerThing(filteredBossRuns, "boss"), [filteredBossRuns]);
  const dungeonLeaderboard = useMemo(() => characterLeaderboard(filteredDungeonRuns, characters), [filteredDungeonRuns, characters]);
  const bossLeaderboard = useMemo(() => characterLeaderboard(filteredBossRuns, characters, true), [filteredBossRuns, characters]);

  function clearFilters() {
    setFilterCharacter("");
    setFilterDungeon("");
    setFilterBoss("");
    setFilterDate(null);
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
        <DatePickerFilter date={filterDate} setDate={setFilterDate} />
        <button
          onClick={clearFilters}
          className="px-4 py-2 rounded-xl bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 transition"
          type="button"
        >
          Clear Filters
        </button>
      </FilterPanel>

      {/* DUNGEON ANALYTICS */}
      <section className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8 flex flex-col items-center">
        <div className="text-lg font-semibold text-yellow-300 mb-8 text-center">
          Dungeon Runs – {charLabel} – {dungeonLabel}
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-center text-center">
          {/* Profit Stats Card */}
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
          {/* Run/Drop Stats Card */}
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
            {/* NEW: Drop streak rarity selector */}
            <div className="flex items-center gap-2 mt-3">
              <label className="text-sm text-yellow-300">Drop Streak Rarity:</label>
              <select
                value={dungeonStreakRarity}
                onChange={e => setDungeonStreakRarity(e.target.value)}
                className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-2 py-1"
              >
                {RARITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-sm text-yellow-300">
                Current Runs Without a Drop{dungeonStreakRarity !== "all" ? ` (${dungeonStreakRarity})` : ""}
              </div>
              <div className="text-xl font-bold text-yellow-200">{dungeonStats.runsWithoutDrop}</div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">
                Longest Run Without a Drop{dungeonStreakRarity !== "all" ? ` (${dungeonStreakRarity})` : ""}
              </div>
              <div className="text-xl font-bold text-yellow-200">{dungeonStats.longestStreak}</div>
            </div>
          </div>
        </div>
        {/* PIE CHART */}
        <div className="w-full max-w-xs md:max-w-md mx-auto mt-8">
          <PieChartByRarity counts={dungeonRarityCounts} />
        </div>
        {/* LINE CHART: PROFIT OVER TIME */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="text-yellow-300 text-center font-semibold mb-2">Profit Over Time</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dungeonProfitSeries}>
              <CartesianGrid stroke="#242b3d" strokeDasharray="5 5" />
              <XAxis dataKey="date" stroke="#d1d6e6" fontSize={13} />
              <YAxis stroke="#d1d6e6" fontSize={13} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="profit"
                stroke={PRIMARY_COLOR}
                strokeWidth={3}
                dot={{ r: 5, fill: SECONDARY_COLOR, stroke: "#222", strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* BAR CHART: DROPS PER DUNGEON */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="text-yellow-300 text-center font-semibold mb-2">Drops Per Dungeon</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dungeonDropsBar}>
              <CartesianGrid stroke="#242b3d" strokeDasharray="4 4" />
              <XAxis dataKey="name" stroke="#d1d6e6" fontSize={13} />
              <YAxis stroke="#d1d6e6" fontSize={13} />
              <Tooltip />
              <Bar dataKey="drops" fill={SECONDARY_COLOR} radius={[10, 10, 0, 0]}>
                <LabelList dataKey="drops" position="top" fill="#fff" fontSize={15} fontWeight={700} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* BAR CHART: CHARACTER LEADERBOARD */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="text-yellow-300 text-center font-semibold mb-2">Character Profit Leaderboard</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dungeonLeaderboard}>
              <CartesianGrid stroke="#242b3d" strokeDasharray="4 4" />
              <XAxis dataKey="name" stroke="#d1d6e6" fontSize={13} />
              <YAxis stroke="#d1d6e6" fontSize={13} />
              <Tooltip formatter={(v, n) => [`$${v.toLocaleString()}`, n]} />
              <Bar dataKey="profit" fill={PRIMARY_COLOR} radius={[10, 10, 0, 0]}>
                <LabelList dataKey="profit" position="top" fill="#fff" fontSize={15} fontWeight={700}
                  formatter={(v) => `$${v.toLocaleString()}`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* BOSS ANALYTICS */}
      <section className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8 flex flex-col items-center">
        <div className="text-lg font-semibold text-yellow-300 mb-8 text-center">
          Boss Runs – {charLabel} – {bossLabel}
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-center text-center">
          {/* Profit Stats Card */}
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
          {/* Run/Drop Stats Card */}
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
            {/* NEW: Drop streak rarity selector */}
            <div className="flex items-center gap-2 mt-3">
              <label className="text-sm text-yellow-300">Drop Streak Rarity:</label>
              <select
                value={bossStreakRarity}
                onChange={e => setBossStreakRarity(e.target.value)}
                className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-2 py-1"
              >
                {RARITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-sm text-yellow-300">
                Current Runs Without a Drop{bossStreakRarity !== "all" ? ` (${bossStreakRarity})` : ""}
              </div>
              <div className="text-xl font-bold text-yellow-200">{bossStats.runsWithoutDrop}</div>
            </div>
            <div>
              <div className="text-sm text-yellow-300">
                Longest Run Without a Drop{bossStreakRarity !== "all" ? ` (${bossStreakRarity})` : ""}
              </div>
              <div className="text-xl font-bold text-yellow-200">{bossStats.longestStreak}</div>
            </div>
          </div>
        </div>
        {/* PIE CHART */}
        <div className="w-full max-w-xs md:max-w-md mx-auto mt-8">
          <PieChartByRarity counts={bossRarityCounts} />
        </div>
        {/* LINE CHART: PROFIT OVER TIME */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="text-yellow-300 text-center font-semibold mb-2">Profit Over Time</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={bossProfitSeries}>
              <CartesianGrid stroke="#242b3d" strokeDasharray="5 5" />
              <XAxis dataKey="date" stroke="#d1d6e6" fontSize={13} />
              <YAxis stroke="#d1d6e6" fontSize={13} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="profit"
                stroke={PRIMARY_COLOR}
                strokeWidth={3}
                dot={{ r: 5, fill: SECONDARY_COLOR, stroke: "#222", strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* BAR CHART: DROPS PER BOSS */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="text-yellow-300 text-center font-semibold mb-2">Drops Per Boss</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bossDropsBar}>
              <CartesianGrid stroke="#242b3d" strokeDasharray="4 4" />
              <XAxis dataKey="name" stroke="#d1d6e6" fontSize={13} />
              <YAxis stroke="#d1d6e6" fontSize={13} />
              <Tooltip />
              <Bar dataKey="drops" fill={SECONDARY_COLOR} radius={[10, 10, 0, 0]}>
                <LabelList dataKey="drops" position="top" fill="#fff" fontSize={15} fontWeight={700} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* BAR CHART: CHARACTER LEADERBOARD */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="text-yellow-300 text-center font-semibold mb-2">Character Profit Leaderboard</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bossLeaderboard}>
              <CartesianGrid stroke="#242b3d" strokeDasharray="4 4" />
              <XAxis dataKey="name" stroke="#d1d6e6" fontSize={13} />
              <YAxis stroke="#d1d6e6" fontSize={13} />
              <Tooltip formatter={(v, n) => [`$${v.toLocaleString()}`, n]} />
              <Bar dataKey="profit" fill={PRIMARY_COLOR} radius={[10, 10, 0, 0]}>
                <LabelList dataKey="profit" position="top" fill="#fff" fontSize={15} fontWeight={700}
                  formatter={(v) => `$${v.toLocaleString()}`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Exclude Chest of Stones */}
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
