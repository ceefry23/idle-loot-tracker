import useCharacters from "../hooks/useCharacters";
import useDungeonRuns from "../hooks/useDungeonRuns";
import CharacterManager from "../components/Character/CharacterManager";
import DungeonForm from "../components/Dungeon/DungeonForm";

const rarityColors = {
  Common: "bg-gray-700 text-gray-200 border-gray-600",
  Uncommon: "bg-blue-800 text-blue-200 border-blue-400",
  Rare: "bg-green-800 text-green-200 border-green-400",
  Epic: "bg-red-900 text-red-300 border-red-400",
  Legendary: "bg-yellow-500 text-yellow-900 border-yellow-300 font-extrabold",
  Mythic: "bg-orange-600 text-orange-100 border-orange-300 font-extrabold",
};

export default function DungeonPage() {
  const { characters, addCharacter, removeCharacter } = useCharacters();
  const { runs, addRun, removeRun, clearRuns, setRuns } = useDungeonRuns();

  // Helper to get character name from id
  function getCharacterName(id) {
    const found = characters.find((c) => c.id === id);
    return found ? found.name : "Unknown";
  }

  // Update profit for a run by id
  function updateProfit(id, value) {
    setRuns((prevRuns) =>
      prevRuns.map((run) =>
        run.id === id ? { ...run, profit: parseFloat(value) || 0 } : run
      )
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-6 text-yellow-400 drop-shadow">
        Dungeons
      </h1>

      <CharacterManager
        characters={characters}
        addCharacter={addCharacter}
        removeCharacter={removeCharacter}
      />

      <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3 text-yellow-300">
          Log Dungeon Run
        </h2>
        <DungeonForm characters={characters} onAddRun={addRun} />
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-yellow-300">Dungeon Runs</h2>
          {runs.length > 0 && (
            <button
              className="text-xs text-red-300 hover:text-red-200 underline"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to clear all entries?")
                ) {
                  clearRuns();
                }
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {runs.length === 0 ? (
          <div className="text-gray-500 py-4 text-center">
            No dungeon runs logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-800 text-yellow-400">
                  <th className="py-3 px-4 text-left">Character</th>
                  <th className="py-3 px-4 text-left">Dungeon</th>
                  <th className="py-3 px-4 text-left">Cost</th>
                  <th className="py-3 px-4 text-left">Loot</th>
                  <th className="py-3 px-4 text-left">Profit</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-gray-800 hover:bg-yellow-900/10 transition"
                  >
                    <td className="py-2 px-4 text-yellow-200">
                      {getCharacterName(run.characterId)}
                    </td>
                    <td className="py-2 px-4 text-yellow-100">{run.dungeon}</td>
                    <td className="py-2 px-4 text-yellow-100">{run.cost ?? ""}</td>
                    <td className="py-2 px-4">
                      {!run.loot || run.loot.length === 0 ? (
                        <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-full border border-gray-700 text-xs">
                          None
                        </span>
                      ) : (
                        run.loot.map((item) => (
                          <span
                            key={item.name}
                            className={`inline-block mr-2 mb-1 px-2 py-1 rounded-full border text-xs align-middle ${rarityColors[item.rarity]}`}
                            title={item.rarity}
                          >
                            {item.name}
                            <span className="ml-1 opacity-80">({item.rarity})</span>
                          </span>
                        ))
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={run.profit ?? ""}
                        onChange={(e) => updateProfit(run.id, e.target.value)}
                        className="w-20 rounded border border-yellow-600 bg-gray-800 px-2 py-1 text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Profit"
                      />
                    </td>
                    <td className="py-2 px-4 text-gray-200">{run.date}</td>
                    <td className="py-2 px-4">
                      <button
                        className="text-xs text-red-400 hover:text-red-200 underline"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this entry?"
                            )
                          )
                            removeRun(run.id);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
