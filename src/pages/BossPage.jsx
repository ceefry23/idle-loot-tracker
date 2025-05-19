import { useState } from "react";
import useCharacters from "../hooks/useCharacters";
import CharacterManager from "../components/Character/CharacterManager";
import BossForm from "../components/Boss/BossForm";

export default function BossPage() {
  const { characters, addCharacter, removeCharacter } = useCharacters();
  const [runs, setRuns] = useState([]);

  function handleAddRun(run) {
    setRuns([...runs, { ...run, id: Date.now() }]);
    // Persist runs to localStorage here if you wish!
  }

  function getCharacterName(id) {
    const found = characters.find((c) => c.id === id);
    return found ? found.name : "Unknown";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Bosses</h1>
      <CharacterManager
        characters={characters}
        addCharacter={addCharacter}
        removeCharacter={removeCharacter}
      />
      <BossForm
        characters={characters}
        onAddRun={handleAddRun}
      />
      <ul>
        {runs.map((run) => (
          <li key={run.id} className="border-b py-2">
            <b>Character:</b> {getCharacterName(run.characterId)} &nbsp;
            <b>Boss:</b> {run.boss} &nbsp;
            <b>Date:</b> {run.date} &nbsp;
            <b>Loot:</b> {run.loot.join(", ")} &nbsp;
            <b>Travel Cost:</b> {run.travelCost}
          </li>
        ))}
      </ul>
    </div>
  );
}
