// src/features/character/CharacterSelector.jsx
import { useState } from "react";
import { ShieldUser, PlusCircle, Trash2 } from "lucide-react";
import { useCharactersContext } from './CharacterContext';

export default function CharacterSelector({ selectedId, onSelect }) {
  const { characters, addCharacter, removeCharacter } = useCharactersContext();

  // Add character UI state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName]   = useState("");
  const [error, setError] = useState("");

  // Pending delete for modal
  const [pendingDelete, setPendingDelete] = useState(null);

  function handleAdd() {
    const name = newName.trim();
    if (!name) {
      setError("Character name is required.");
      return;
    }
    if (characters.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      setError("This name already exists.");
      return;
    }
    addCharacter({ id: Date.now().toString(), name });
    setNewName("");
    setIsAdding(false);
    setError("");
  }

  function confirmDelete() {
    if (pendingDelete) {
      removeCharacter(pendingDelete.id);
      setPendingDelete(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-6 justify-center mb-6">
        {characters.map((c) => {
          const isSel = c.id === selectedId;
          return (
            <div key={c.id} className="relative flex flex-col items-center">
              {/* delete icon */}
              <button
                onClick={() => setPendingDelete(c)}
                title={`Delete ${c.name}`}
                className="absolute -top-2 -right-2 z-10 bg-gray-900 rounded-full p-1 text-red-400 hover:text-red-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {/* character icon */}
              <button
                onClick={() => onSelect?.(c.id)}
                title={c.name}
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 transition ${
                  isSel
                    ? "ring-4 ring-yellow-400 bg-yellow-600 text-gray-900"
                    : "bg-gray-800 text-yellow-200 hover:bg-gray-700"
                }`}
              >
                <ShieldUser className="w-6 h-6" />
              </button>
              <span className="text-xs text-yellow-200 select-none">{c.name}</span>
            </div>
          );
        })}

        {/* add-new tile */}
        {isAdding ? (
          <div className="flex flex-col items-center">
            <input
              autoFocus
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Name"
              className="w-24 mb-1 px-2 py-1 rounded-xl bg-gray-800 text-yellow-200 border border-yellow-500 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            {error && <div className="text-xs text-red-400 mb-1">{error}</div>}
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-xl font-semibold"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewName("");
                  setError("");
                }}
                className="px-2 py-1 text-gray-400"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              onClick={() => setIsAdding(true)}
              className="w-12 h-12 rounded-full bg-gray-800 text-yellow-200 flex items-center justify-center hover:bg-gray-700 transition mb-1"
              title="Add a character"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
            <span className="text-xs text-yellow-200 select-none">Add</span>
          </div>
        )}
      </div>

      {/* confirmation modal */}
      {pendingDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full text-center">
            <h2 className="text-xl text-yellow-300 font-semibold mb-4">
              Delete “{pendingDelete.name}”?
            </h2>
            <p className="text-gray-300 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 bg-gray-800 text-yellow-300 rounded-xl hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-500 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
