import { useState } from "react";
import CharacterDropdown from "../Character/CharacterDropdown";

// Each dungeon with loot, including "Mythic"
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

export default function DungeonForm({ characters, onAddRun }) {
  const [characterId, setCharacterId] = useState("");
  const [dungeon, setDungeon] = useState("");
  const [loot, setLoot] = useState(["None"]);
  const [date, setDate] = useState("");

  // Get loot objects for selected dungeon
  const currentLoot =
    DUNGEONS.find((d) => d.name === dungeon)?.loot ?? [];

  function handleDungeonChange(e) {
    setDungeon(e.target.value);
    setLoot(["None"]);
  }

  function handleLootChange(e) {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
    setLoot(selected.length === 0 ? ["None"] : selected);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (characterId && dungeon && date) {
      // Save loot as objects (not just names)
      const lootObjects =
        loot[0] === "None"
          ? []
          : currentLoot.filter((item) => loot.includes(item.name));
      onAddRun({
        characterId,
        dungeon,
        date,
        loot: lootObjects
      });
      setCharacterId("");
      setDungeon("");
      setDate("");
      setLoot(["None"]);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <CharacterDropdown
        characters={characters}
        value={characterId}
        onChange={setCharacterId}
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

      {/* Loot Dropdown (multi-select, dynamic, with "None" as default) */}
      <select
        className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
        value={loot}
        onChange={handleLootChange}
        multiple
        size={currentLoot.length < 4 ? currentLoot.length + 1 : 4}
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
        onChange={(e) => setDate(e.target.value)}
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
