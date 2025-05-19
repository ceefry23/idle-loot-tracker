import { useState } from "react";
import CharacterDropdown from "../Character/CharacterDropdown";

export default function BossForm({ characters, onAddRun }) {
  const [characterId, setCharacterId] = useState("");
  const [boss, setBoss] = useState("");
  const [date, setDate] = useState("");
  const [loot, setLoot] = useState("");
  const [travelCost, setTravelCost] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (characterId && boss && date) {
      onAddRun({
        characterId,
        boss,
        date,
        loot: loot.split(",").map((item) => item.trim()).filter(Boolean),
        travelCost,
      });
      setCharacterId("");
      setBoss("");
      setDate("");
      setLoot("");
      setTravelCost("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
      <CharacterDropdown characters={characters} value={characterId} onChange={setCharacterId} />
      <input
        className="border rounded px-2 py-1"
        placeholder="Boss name"
        value={boss}
        onChange={e => setBoss(e.target.value)}
      />
      <input
        className="border rounded px-2 py-1"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />
      <input
        className="border rounded px-2 py-1"
        placeholder="Loot (comma separated)"
        value={loot}
        onChange={e => setLoot(e.target.value)}
      />
      <input
        className="border rounded px-2 py-1"
        type="number"
        placeholder="Travel Cost"
        value={travelCost}
        onChange={e => setTravelCost(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">
        Add Boss Run
      </button>
    </form>
  );
}
