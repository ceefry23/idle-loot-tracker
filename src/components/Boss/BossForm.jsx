// src/components/Boss/BossForm.jsx
import { useState, useEffect, useRef } from "react";
import bosses from "../../data/bossDB";                  // lowercase b!
import CharacterDropdown from "../Character/CharacterDropdown";

const rarityColors = {
  Standard:  "bg-gray-700 text-gray-200 border-gray-600",
  Refined:   "bg-blue-800  text-blue-200  border-blue-400",
  Premium:   "bg-green-800 text-green-200 border-green-400",
  Epic:      "bg-red-900   text-red-300   border-red-400",
  Legendary: "bg-yellow-500 text-yellow-900 border-yellow-300 font-extrabold",
  Mythic:    "bg-orange-600 text-orange-100 border-orange-300 font-extrabold",
};

function LootDropdown({ lootOptions, loot, setLoot }) {
  const [open, setOpen] = useState(false);
  const ref            = useRef(null);

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
            className={`inline-block px-2 py-1 rounded-full border text-xs align-middle ${
              rarityColors[lootOptions.find((i) => i.name === loot)?.rarity] || ""
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
                className={`inline-block px-2 py-1 rounded-full border text-xs align-middle ${
                  rarityColors[item.rarity] || ""
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
  defaultBoss        = "",
}) {
  const [characterId, setCharacterId] = useState(defaultCharacterId);
  const [boss, setBoss]               = useState(defaultBoss);
  const [loot, setLoot]               = useState("None");

  // find selected boss data
  const currentBoss = bosses.find((b) => b.name === boss);
  const bossLoot    = currentBoss?.loot ?? [];

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
      cost: currentBoss?.cost ?? 0,
      loot: lootItems,
      reward: 0,
      date: timestamp,
    });

    // reset just the loot
    setLoot("None");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <CharacterDropdown
        characters={characters}
        value={characterId}
        onChange={setCharacterId}
      />

      <select
        className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
        value={boss}
        onChange={(e) => setBoss(e.target.value)}
        required
      >
        <option value="" disabled>
          Select boss...
        </option>
        {bosses.map((b) => (
          <option key={b.name} value={b.name}>
            {b.name} (Cost: {b.cost})
          </option>
        ))}
      </select>

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
