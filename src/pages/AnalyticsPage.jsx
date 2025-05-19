import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from "recharts";
import useDungeonRuns from "../hooks/useDungeonRuns";
import useBossRuns from "../hooks/useBossRuns";
import useCharacters from "../hooks/useCharacters";

const COLORS = ["#FFD700", "#00BFFF", "#32CD32", "#FF6347", "#8A2BE2", "#FF8C00"];

export default function AnalyticsDashboard() {
  const { runs: dungeonRuns } = useDungeonRuns();
  const { runs: bossRuns } = useBossRuns();
  const { characters } = useCharacters();

  const [runType, setRunType] = useState("all"); // all, dungeons, bosses
  const [filterCharacter, setFilterCharacter] = useState("");

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chartHeight = windowWidth < 640 ? 200 : 300;

  const runsToAnalyze = useMemo(() => {
    if (runType === "dungeons") return dungeonRuns;
    if (runType === "bosses") return bossRuns;
    return [...dungeonRuns, ...bossRuns];
  }, [runType, dungeonRuns, bossRuns]);

  const filteredRuns = useMemo(() => {
    if (!filterCharacter) return runsToAnalyze;
    return runsToAnalyze.filter(run => run.characterId === filterCharacter);
  }, [filterCharacter, runsToAnalyze]);

  const totalRuns = filteredRuns.length;
  const totalSpent = filteredRuns.reduce((sum, r) => sum + (r.cost ?? 0), 0);
  const totalProfit = filteredRuns.reduce((sum, r) => sum + (r.profit ?? 0), 0);
  const netLoss = totalSpent - totalProfit;

  const runsByCharacter = characters.map(char => ({
    name: char.name,
    runs: filteredRuns.filter(run => run.characterId === char.id).length,
  })).filter(d => d.runs > 0);

  const runsByBoss = useMemo(() => {
    if (runType === "bosses" || runType === "all") {
      const bossCountMap = {};
      filteredRuns.forEach(run => {
        if (run.boss) bossCountMap[run.boss] = (bossCountMap[run.boss] || 0) + 1;
      });
      return Object.entries(bossCountMap).map(([boss, count]) => ({ name: boss, count }));
    }
    return [];
  }, [filteredRuns, runType]);

  const runsByDungeon = useMemo(() => {
    if (runType === "dungeons" || runType === "all") {
      const dungeonCountMap = {};
      filteredRuns.forEach(run => {
        if (run.dungeon) dungeonCountMap[run.dungeon] = (dungeonCountMap[run.dungeon] || 0) + 1;
      });
      return Object.entries(dungeonCountMap).map(([dungeon, count]) => ({ name: dungeon, count }));
    }
    return [];
  }, [filteredRuns, runType]);

  const profitByDateMap = {};
  filteredRuns.forEach(run => {
    if (!profitByDateMap[run.date]) profitByDateMap[run.date] = 0;
    profitByDateMap[run.date] += run.profit ?? 0;
  });
  const profitByDate = Object.entries(profitByDateMap)
    .map(([date, profit]) => ({ date, profit }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const rarityCount = {};
  filteredRuns.forEach(run => {
    run.loot?.forEach(item => {
      rarityCount[item.rarity] = (rarityCount[item.rarity] || 0) + 1;
    });
  });
  const rarityData = Object.entries(rarityCount).map(([name, value]) => ({ name, value }));

  const itemDropCounts = useMemo(() => {
    const counts = {};
    filteredRuns.forEach(run => {
      run.loot?.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [filteredRuns]);

  return (
    <div className="max-w-2xl mx-auto pt-8 pb-32 px-4">
      {/* Banner image */}
      <img
        src="/images/idle_loot_tracker.png"
        alt="Idle Loot Tracker Banner"
        className="w-full max-w-md mx-auto mb-6 rounded-xl shadow-lg"
      />

      {/* Run Type Selector - Centered */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        {["all", "dungeons", "bosses"].map(type => (
          <button
            key={type}
            onClick={() => setRunType(type)}
            className={`px-5 py-3 rounded-xl font-semibold ${
              runType === type ? "bg-yellow-500 text-gray-900" : "bg-gray-800 text-yellow-300 hover:bg-yellow-700"
            }`}
          >
            {type === "all" ? "All Runs" : type === "dungeons" ? "Dungeons" : "Bosses"}
          </button>
        ))}
      </div>

      {/* Character Filter */}
      <select
        value={filterCharacter}
        onChange={e => setFilterCharacter(e.target.value)}
        className="mb-8 px-4 py-3 rounded-xl bg-gray-900 text-yellow-200 border border-yellow-500 w-full"
      >
        <option value="">All Characters</option>
        {characters.map(char => (
          <option key={char.id} value={char.id}>{char.name}</option>
        ))}
      </select>

      {/* Summary Cards */}
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8">
        <div className="grid grid-cols-2 gap-6">
          <SummaryCard label="Total Runs" value={totalRuns} />
          <SummaryCard label="Total Spent" value={`$${totalSpent.toLocaleString()}`} />
          <SummaryCard label="Total Profit" value={`$${totalProfit.toLocaleString()}`} />
          <SummaryCard
            label="Net"
            value={`$${netLoss.toLocaleString()}`}
            valueClass={netLoss > 0 ? "text-red-500" : "text-green-400"}
          />
        </div>
      </div>

      {/* Charts grid */}
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Runs by Character */}
        <ChartCard title="Runs by Character">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={runsByCharacter}>
              <XAxis dataKey="name" stroke="#FFD700" />
              <YAxis stroke="#FFD700" />
              <Tooltip />
              <Bar dataKey="runs" fill="#FFD700" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Runs by Boss */}
        {(runType === "bosses" || runType === "all") && runsByBoss.length > 0 && (
          <ChartCard title="Runs by Boss">
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={runsByBoss}>
                <XAxis dataKey="name" stroke="#FFD700" />
                <YAxis stroke="#FFD700" />
                <Tooltip />
                <Bar dataKey="count" fill="#FFD700" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Runs by Dungeon */}
        {(runType === "dungeons" || runType === "all") && runsByDungeon.length > 0 && (
          <ChartCard title="Runs by Dungeon">
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={runsByDungeon}>
                <XAxis dataKey="name" stroke="#FFD700" />
                <YAxis stroke="#FFD700" />
                <Tooltip />
                <Bar dataKey="count" fill="#FFD700" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Profit Over Time */}
        <ChartCard title="Profit Over Time">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={profitByDate}>
              <XAxis dataKey="date" stroke="#FFD700" />
              <YAxis stroke="#FFD700" />
              <Tooltip />
              <Line type="monotone" dataKey="profit" stroke="#FFD700" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Loot Rarity Distribution */}
        <ChartCard title="Loot Rarity Distribution">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={rarityData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                fill="#FFD700"
                label
              >
                {rarityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Item Drop Counts */}
        <ChartCard title="Item Drop Counts">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={itemDropCounts} layout="vertical" margin={{ left: 50 }}>
              <XAxis type="number" stroke="#FFD700" />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#FFD700"
                width={150}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#FFD700" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, valueClass = "text-yellow-400" }) {
  return (
    <div className="text-center">
      <div className="text-sm uppercase text-yellow-300 mb-2">{label}</div>
      <div className={`text-4xl font-extrabold ${valueClass}`}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg text-yellow-300">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
