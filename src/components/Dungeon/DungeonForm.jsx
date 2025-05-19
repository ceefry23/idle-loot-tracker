import { useState, useEffect } from "react";
import CharacterDropdown from "../Character/CharacterDropdown";

// Utility: today's date in YYYY-MM-DD format
function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const DUNGEONS = [
  {
    name: "Forgotten Crypt",
    loot: [
      { name: "Ancient Sword", rarity: "Rare" },
      { name: "Tarnished Amulet", rarity: "Common" },
      { name: "Bone Shield", rarity: "Uncommon" },
      { name: "Cryptic Relic", rarity: "Mythic" }
    ]
  },
  {
    name: "Spider Cavern",
    loot: [
      { name: "Spider Silk", rarity: "Uncommon" },
      { name: "Venom Gland", rarity: "Rare" },
      { name: "Web Cloak", rarity: "Epic" }
    ]
  },
  {
    name: "Lost Library",
    loot: [
      { name: "Dusty Tome", rarity: "Common" },
      { name: "Enchanted Quill", rarity: "Rare" },
      { name: "Mystic Bookmark", rarity: "Epic" }
    ]
  },
  {
    name: "Dragon's Lair",
    loot: [
      { name: "Dragon Scale", rarity: "Epic" },
      { name: "Flame Gem", rarity: "Rare" },
      { name: "Golden Claw", rarity: "Legendary" },
      { name: "Eternal Heart", rarity: "Mythic" }
    ]
  }
];

const LAST_CHARACTER_KEY = "idle_loot_last_character";
const LAST_DUNGEON_KEY = "idle_loot_last_dungeon";

export default function DungeonForm({ characters, onAddRun }) {
  // Load last-used character and dungeon from localStorage if available
  const [characterId, setCharacterId] = useState(() => localStorage.getItem(LAST_CHARACTER_KEY) || "");
  const [dungeon, setDungeon] = useState(() => localStorage.getItem(LAST_DUNGEON_KEY) || "");
  const [loot, setLoot] = useState("None");
  const [date, setDate] = useState(getTodayString());

  const currentLoot = DUNGEONS.find((d) => d.name === dungeon)?.loot ?? [];

  // Persist character selection
  useEffect(() => {
    if (characterId) {
      localStorage.setItem(LAST_CHARACTER_KEY, characterId);
    }
  }, [characterId]);

  // Persist dungeon selection and reset loot to "None"
  useEffect(() => {
    if (dungeon) {
      localStorage.setItem(LAST_DUNGEON_KEY, dungeon);
    }
    setLoot("None");
  }, [dungeon]);

  function handleSubmit(e) {
    e.preventDefault();
    if (characterId && dungeon && date) {
      // Save loot as an array for consistency
      const lootObjects =
        loot === "None"
          ? []
          : currentLoot.filter((item) => item.name === loot);
      onAddRun({
        characterId,
        dungeon,
        date,
        loot: lootObjects,
      });
      // Don't reset character/dungeon, but reset loot and date
      setDate(getTodayString());
      setLoot("None");
    }
  }

  function handleCharacterChange(id) {
    setCharacterId(id);
    localStorage.setItem(LAST_CHARACTER_KEY, id);
  }

  function handleDungeonChange(e) {
    setDungeon(e.target.value);
    localStorage.setItem(LAST_DUNGEON_KEY, e.target.value);
  }

  function handleLootChange(e) {
    setLoot(e.target.value || "None");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <CharacterDropdown
        characters={characters}
        value={characterId}
        onChange={handleCharacterChange}
      />

      {/* Dungeon Dropdown */}
      <select
        className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
        value={dungeon}
        onChange={handleDungeonChange}
        required
      >
        <option value="" disabled>
          Select dungeon...
        </option>
        {DUNGEONS.map((d) => (
          <option key={d.name} value={d.name}>
            {d.name}
          </option>
        ))}
      </select>

      {/* Loot Dropdown - Single select only */}
      <select
        className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
        value={loot}
        onChange={handleLootChange}
        disabled={!dungeon}
      >
        <option value="None">None</option>
        {currentLoot.map((item) => (
          <option key={item.name} value={item.name}>
            {item.name} ({item.rarity})
          </option>
        ))}
      </select>

      {/* Date Input */}
      <input
        className="border border-yellow-500 bg-gray-900 text-yellow-200 placeholder-yellow-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />

      <button
        className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl shadow border border-yellow-400 hover:bg-yellow-300 active:scale-95 transition-all mt-2"
        type="submit"
      >
        Add Dungeon Run
      </button>
    </form>
  );
}
