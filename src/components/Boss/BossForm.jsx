import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

const bossDB = [
  {
    name: "Fire Beast",
    cost: 500,
    loot: [
      { name: "Flame Core", rarity: "Rare" },
      { name: "Burning Fang", rarity: "Epic" },
      { name: "Ashen Cloak", rarity: "Uncommon" },
    ],
  },
  {
    name: "Stone Golem",
    cost: 1000,
    loot: [
      { name: "Golem Core", rarity: "Rare" },
      { name: "Earthshaker Hammer", rarity: "Epic" },
      { name: "Granite Shield", rarity: "Uncommon" },
    ],
  },
  // Add more bosses as needed
];

const rarityColors = {
  Common: "bg-gray-700 text-gray-200 border-gray-600",
  Uncommon: "bg-blue-800 text-blue-200 border-blue-400",
  Rare: "bg-green-800 text-green-200 border-green-400",
  Epic: "bg-red-900 text-red-300 border-red-400",
  Legendary: "bg-yellow-500 text-yellow-900 border-yellow-300 font-extrabold",
  Mythic: "bg-orange-600 text-orange-100 border-orange-300 font-extrabold",
};

function LootDropdown({ boss, loot, setLoot }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item) {
    if (item.name === "None") {
      setLoot([]);
    } else {
      setLoot([item]);
    }
    setOpen(false);
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2 text-left focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
      >
        {loot.length === 0 ? (
          "None"
        ) : (
          <span
            className={`inline-block px-2 py-1 rounded-full border text-xs align-middle ${rarityColors[loot[0].rarity]}`}
            title={loot[0].rarity}
          >
            {loot[0].name}
            <span className="ml-1 opacity-80">({loot[0].rarity})</span>
          </span>
        )}
      </button>

      {open && (
        <ul className="absolute z-10 w-full bg-gray-900 border border-yellow-500 rounded-xl mt-1 max-h-48 overflow-auto shadow-lg">
          <li
            className="cursor-pointer px-4 py-2 hover:bg-yellow-700/50"
            onClick={() => handleSelect({ name: "None" })}
          >
            None
          </li>
          {boss &&
            boss.loot.map((item) => (
              <li
                key={item.name}
                className="cursor-pointer px-4 py-2 hover:bg-yellow-700/50"
                onClick={() => handleSelect(item)}
              >
                <span
                  className={`inline-block px-2 py-1 rounded-full border text-xs align-middle ${rarityColors[item.rarity]}`}
                  title={item.rarity}
                >
                  {item.name}
                  <span className="ml-1 opacity-80">({item.rarity})</span>
                </span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default function BossForm({
  characters,
  onAddRun,
  defaultCharacterId = "",
  defaultBoss = "",
}) {
  const [characterId, setCharacterId] = useState(defaultCharacterId);
  const [boss, setBoss] = useState(defaultBoss);
  const [loot, setLoot] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Reset loot when boss changes
  useEffect(() => {
    setLoot([]);
  }, [boss]);

  // Sync characterId if defaultCharacterId changes externally
  useEffect(() => {
    setCharacterId(defaultCharacterId);
  }, [defaultCharacterId]);

  // Sync boss if defaultBoss changes externally
  useEffect(() => {
    setBoss(defaultBoss);
  }, [defaultBoss]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!characterId || !boss || !date) return;

    const bossEntry = bossDB.find((b) => b.name === boss);
    const cost = bossEntry ? bossEntry.cost : 0;

    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];
    const fullDateTime = `${date}T${timeString}`;

    const run = {
      id: uuidv4(),
      characterId,
      boss,
      cost,
      loot: loot.length ? loot : [],
      profit: 0,
      date: fullDateTime,
    };

    onAddRun(run);

    // Reset form but keep character and boss selected for convenience
    setBoss("");
    setLoot([]);
    setDate(new Date().toISOString().slice(0, 10));
    // Do NOT clear characterId, keeping it consistent with default
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <select
        value={characterId}
        onChange={(e) => setCharacterId(e.target.value)}
        required
        className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
      >
        <option value="" disabled>
          Select character...
        </option>
        {characters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={boss}
        onChange={(e) => setBoss(e.target.value)}
        required
        className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
      >
        <option value="" disabled>
          Select boss...
        </option>
        {bossDB.map((b) => (
          <option key={b.name} value={b.name}>
            {b.name} (Cost: {b.cost})
          </option>
        ))}
      </select>

      <LootDropdown boss={bossDB.find((b) => b.name === boss)} loot={loot} setLoot={setLoot} />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2 placeholder-yellow-600 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
      />

      <button
        type="submit"
        className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl shadow border border-yellow-400 hover:bg-yellow-300 active:scale-95 transition-all"
      >
        Add Boss Run
      </button>
    </form>
  );
}
