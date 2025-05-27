import { useState, useEffect, useRef } from "react";
import BossDB from './BossDB';
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

function LootDropdown({ lootOptions, loot, setLoot }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function select(item) {
    setLoot(item.name === "None" ? "None" : item.name);
    setOpen(false);
  }

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2 text-left focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
      >
        {loot === "None" ? (
          "None"
        ) : (
          <span
            className={`inline-block px-2 py-1 rounded-full border text-xs align-middle ${rarityColors[lootOptions.find((i) => i.name === loot)?.rarity] || ""
              }`}
            title={lootOptions.find((i) => i.name === loot)?.rarity}
          >
            {loot} ({lootOptions.find((i) => i.name === loot)?.rarity})
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
            onClick={() => select({ name: "None" })}
            role="option"
            aria-selected={loot === "None"}
          >
            None
          </li>
          {lootOptions.map((item) => (
            <li
              key={item.name}
              className="cursor-pointer px-4 py-2 hover:bg-yellow-700/50"
              onClick={() => select(item)}
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

export default function BossForm({
  characters,
  onAddRun,
  defaultCharacterId = "",
  defaultBoss = "",
}) {
  const [characterId, setCharacterId] = useState(defaultCharacterId);
  const [boss, setBoss] = useState(defaultBoss);
  const [loot, setLoot] = useState("None");
  const [cost, setCost] = useState("");

  // Show/hide bosses
  const [hiddenBosses, toggleBossHidden] = useHiddenDropdownItems("hiddenBosses");

  // find selected boss data
  const currentBoss = BossDB.find((b) => b.name === boss);
  const bossLoot = currentBoss?.loot ?? [];

  // sync defaults
  useEffect(() => setCharacterId(defaultCharacterId), [defaultCharacterId]);
  useEffect(() => setBoss(defaultBoss), [defaultBoss]);
  useEffect(() => setLoot("None"), [boss]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!characterId || !boss) return;

    const timestamp = new Date().toISOString();
    const lootItems = loot === "None"
      ? []
      : bossLoot.filter((i) => i.name === loot);

    onAddRun({
      characterId,
      boss,
      cost: Number(cost) || 0,  // Save travel cost, default 0
      loot: lootItems,
      reward: 125,              // Baked-in profit
      date: timestamp,
    });

    setLoot("None");
    setCost("");
  }

  // Helper to show/hide menu for bosses
  const [showHideDropdown, setShowHideDropdown] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <CharacterDropdown
        characters={characters}
        value={characterId}
        onChange={setCharacterId}
      />

      {/* Boss Dropdown with Show/Hide aligned right */}
      <div className="w-full">
        <div className="flex items-center mb-1">
          <label className="text-yellow-300 font-semibold">Boss</label>
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
            value={boss}
            onChange={(e) => setBoss(e.target.value)}
            required
          >
            <option value="" disabled>
              Select boss...
            </option>
            {BossDB
              .filter((b) => !hiddenBosses.includes(b.name))
              .map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
          </select>
          {/* Show/hide popover */}
          {showHideDropdown && (
            <div className="absolute z-20 right-0 top-12 bg-gray-900 border border-yellow-600 rounded-xl p-3 shadow-xl w-64 max-h-72 overflow-auto">
              <div className="mb-2 font-bold text-yellow-400">Show/Hide Bosses</div>
              <ul className="space-y-1">
                {BossDB.map((b) => (
                  <li key={b.name} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!hiddenBosses.includes(b.name)}
                      onChange={() => toggleBossHidden(b.name)}
                      className="accent-yellow-500"
                      id={`boss-toggle-${b.name}`}
                    />
                    <label htmlFor={`boss-toggle-${b.name}`} className="text-yellow-200 cursor-pointer text-sm">
                      {b.name}
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

      {/* Travel Cost input, styled like all other inputs */}
      <input
        type="number"
        min="0"
        step="any"
        value={cost}
        onChange={e => setCost(e.target.value)}
        className="border border-yellow-500 bg-gray-900 text-yellow-200 placeholder-yellow-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition-all w-full"
        placeholder="Travel Cost"
      />

      <LootDropdown lootOptions={bossLoot} loot={loot} setLoot={setLoot} />

      <button
        type="submit"
        className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl shadow border border-yellow-400 hover:bg-yellow-300 active:scale-95 transition-all mt-2"
      >
        Add Boss Run
      </button>
    </form>
  );
}
