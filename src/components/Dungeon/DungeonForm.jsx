import { useState, useEffect } from "react";
import dungeons from "../../data/DungeonDB"; // import your dungeon database
import CharacterDropdown from "../Character/CharacterDropdown";

function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DungeonForm({ characters, onAddRun }) {
  const [characterId, setCharacterId] = useState("");
  const [dungeon, setDungeon] = useState("");
  const [loot, setLoot] = useState("None");
  const [date, setDate] = useState(getTodayString());

  const currentDungeon = dungeons.find((d) => d.name === dungeon);
  const currentLoot = currentDungeon?.loot ?? [];

  useEffect(() => {
    setLoot("None");
  }, [dungeon]);

  function handleSubmit(e) {
    e.preventDefault();
    if (characterId && dungeon && date) {
      const lootObjects = loot === "None" ? [] : currentLoot.filter((item) => item.name === loot);
      onAddRun({
        characterId,
        dungeon,
        cost: currentDungeon ? currentDungeon.cost : 0,
        date,
        loot: lootObjects,
        profit: 0,
      });
      setDate(getTodayString());
      setLoot("None");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <CharacterDropdown
        characters={characters}
        value={characterId}
        onChange={setCharacterId}
      />

      <select
        className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2
          focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
        value={dungeon}
        onChange={(e) => setDungeon(e.target.value)}
        required
      >
        <option value="" disabled>
          Select dungeon...
        </option>
        {dungeons.map((d) => (
          <option key={d.name} value={d.name}>
            {d.name} (Cost: {d.cost})
          </option>
        ))}
      </select>

      <select
        className="border border-yellow-500 bg-gray-900 text-yellow-200 rounded-xl px-4 py-2
          focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
        value={loot}
        onChange={(e) => setLoot(e.target.value || "None")}
        disabled={!dungeon}
      >
        <option value="None">None</option>
        {currentLoot.map((item) => (
          <option key={item.name} value={item.name}>
            {item.name} ({item.rarity})
          </option>
        ))}
      </select>

      <input
        className="border border-yellow-500 bg-gray-900 text-yellow-200 placeholder-yellow-600 rounded-xl px-4 py-2
          focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <button
        type="submit"
        className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl shadow border border-yellow-400
          hover:bg-yellow-300 active:scale-95 transition-all mt-2"
      >
        Add Dungeon Run
      </button>
    </form>
  );
}
