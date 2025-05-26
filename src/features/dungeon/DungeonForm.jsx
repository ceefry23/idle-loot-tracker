import { useState, useEffect, useRef } from "react";
import DungeonDB from './DungeonDB';
import CharacterDropdown from '../character/CharacterDropdown';
import { useHiddenDropdownItems } from "../../components/common/useHiddenDropdownItems";

const rarityColors = {
  Standard: "bg-gray-700 text-gray-200 border-gray-600",
  Refined: "bg-blue-800  text-blue-200  border-blue-400",
  Premium: "bg-green-800 text-green-200 border-green-400",
  Epic: "bg-red-900   text-red-300   border-red-400",
  Legendary: "bg-yellow-500 text-yellow-900 border-yellow-300 font-extrabold",
  Mythic: "bg-orange-600 text-orange-100 border-orange-300 font-extrabold",
};
const dungeons = DungeonDB;

function LootDropdown({ bossLoot, loot, setLoot }) {
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
    setLoot(item.name === "None" ? "None" : item.name);
    setOpen(false);
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2 text-left focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {loot === "None" ? (
          "None"
        ) : (
          <span
            className={`inline-block px-2 py-1 rounded-full border text-xs align-middle ${rarityColors[bossLoot.find((i) => i.name === loot)?.rarity] || ""
              }`}
            title={bossLoot.find((i) => i.name === loot)?.rarity}
          >
            {loot} ({bossLoot.find((i) => i.name === loot)?.rarity || "?"})
          </span>
        )}
      </button>

      {open && (
        <ul
          className="absolute z-10 w-full bg-gray-900 border border-yellow-500 rounded-xl mt-1 max-h-48 overflow-auto shadow-lg"
          role="listbox"
        >
          <li
            className="cursor-pointer px-4 py-2 hover:bg-yellow-700/50"
            onClick={() => handleSelect({ name: "None" })}
            role="option"
            aria-selected={loot === "None"}
          >
            None
          </li>
          {bossLoot.map((item) => (
            <li
              key={item.name}
              className="cursor-pointer px-4 py-2 hover:bg-yellow-700/50"
              onClick={() => handleSelect(item)}
              role="option"
              aria-selected={loot === item.name}
            >
              <span
                className={`inline-block px-2 py-1 rounded-full border text-xs align-middle ${rarityColors[item.rarity] || ""
                  }`}
                title={item.rarity}
              >
                {item.name} ({item.rarity})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// --------- DungeonForm STARTS HERE ----------
export default function DungeonForm({
  characters,
  onAddRun,
  defaultCharacterId = "",
  defaultDungeon = "",
}) {
  const [characterId, setCharacterId] = useState(defaultCharacterId);
  const [dungeon, setDungeon] = useState(defaultDungeon);
  const [loot, setLoot] = useState("None");

  // Show/hide dungeons
  const [hiddenDungeons, toggleDungeonHidden] = useHiddenDropdownItems("hiddenDungeons");

  const currentDungeon = dungeons.find((d) => d.name === dungeon);
  const currentLoot = currentDungeon?.loot ?? [];

  // reset loot whenever dungeon changes
  useEffect(() => setLoot("None"), [dungeon]);

  // sync with external defaults
  useEffect(() => setCharacterId(defaultCharacterId), [defaultCharacterId]);
  useEffect(() => setDungeon(defaultDungeon), [defaultDungeon]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!characterId || !dungeon) return;

    const today = getTodayString();
    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];
    const fullDate = `${today}T${timeString}`;

    const lootObjects =
      loot === "None"
        ? []
        : currentLoot.filter((item) => item.name === loot);

    onAddRun({
      id: Date.now().toString(),
      characterId,
      dungeon,
      cost: currentDungeon?.cost ?? 0,
      date: fullDate,
      loot: lootObjects,
      profit: 0,
    });

    setLoot("None");
  }

  // Helper to show/hide menu for dungeons
  const [showHideDropdown, setShowHideDropdown] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <CharacterDropdown
        characters={characters}
        value={characterId}
        onChange={setCharacterId}
      />

      {/* Dungeon Dropdown with Label & Show/Hide aligned right */}
      <div className="w-full">
        <div className="flex items-center mb-1">
          <label className="text-yellow-300 font-semibold">Dungeon</label>
          <button
            type="button"
            onClick={() => setShowHideDropdown((s) => !s)}
            className="text-xs px-2 py-1 text-yellow-400 hover:underline ml-auto"
            tabIndex={-1}
          >
            Show/Hide
          </button>
        </div>
        <div className="relative w-full">
          <select
            className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition-all w-full"
            value={dungeon}
            onChange={(e) => setDungeon(e.target.value)}
            required
          >
            <option value="" disabled>
              Select dungeon...
            </option>
            {dungeons
              .filter((d) => !hiddenDungeons.includes(d.name))
              .map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} (Cost: {d.cost})
                </option>
              ))}
          </select>
          {/* Show/hide popover */}
          {showHideDropdown && (
            <div className="absolute z-20 right-0 top-12 bg-gray-900 border border-yellow-600 rounded-xl p-3 shadow-xl w-64 max-h-72 overflow-auto">
              <div className="mb-2 font-bold text-yellow-400">Show/Hide Dungeons</div>
              <ul className="space-y-1">
                {dungeons.map((d) => (
                  <li key={d.name} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!hiddenDungeons.includes(d.name)}
                      onChange={() => toggleDungeonHidden(d.name)}
                      className="accent-yellow-500"
                      id={`dungeon-toggle-${d.name}`}
                    />
                    <label htmlFor={`dungeon-toggle-${d.name}`} className="text-yellow-200 cursor-pointer text-sm">
                      {d.name}
                    </label>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-3 w-full bg-yellow-400 text-gray-900 font-bold py-1 rounded hover:bg-yellow-300"
                onClick={() => setShowHideDropdown(false)}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      <LootDropdown bossLoot={currentLoot} loot={loot} setLoot={setLoot} />

      <button
        type="submit"
        className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl shadow border border-yellow-400 hover:bg-yellow-300 active:scale-95 transition-all mt-2"
      >
        Add Dungeon Run
      </button>
    </form>
  );
}
