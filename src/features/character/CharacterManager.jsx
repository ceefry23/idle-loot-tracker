// src/components/Character/CharacterManager.jsx
import { useState } from "react";

function AddCharacterModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState("");

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-80">
        <h3 className="text-lg font-semibold text-yellow-300 mb-4">New Character</h3>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Character name"
          className="w-full px-3 py-2 rounded-xl bg-gray-800 text-yellow-200 border border-yellow-500 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setName("");
              onClose();
            }}
            className="px-4 py-2 text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const trimmed = name.trim();
              if (trimmed) {
                onSubmit(trimmed);
                setName("");
                onClose();
              }
            }}
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-xl font-semibold hover:bg-yellow-300 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CharacterManager({
  characters,
  addCharacter,
  removeCharacter,
  onSelectCharacter,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  function handleDelete(id, name) {
    if (window.confirm(`Delete character "${name}"?`)) {
      removeCharacter(id);
    }
  }

  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-yellow-300">Characters</h2>

      <ul className="space-y-3 mb-4">
        {characters.length === 0 && (
          <li className="text-gray-500 text-center">No characters yet.</li>
        )}

        {characters.map((c) => (
          <li
            key={c.id}
            onClick={() => onSelectCharacter && onSelectCharacter(c.id)}
            className="flex items-center justify-between bg-gray-800 rounded-xl p-3 hover:bg-yellow-900/30 cursor-pointer transition"
            title={`Select ${c.name}`}
          >
            <span className="text-yellow-200 font-semibold">{c.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(c.id, c.name);
              }}
              className="text-red-400 hover:text-red-200 text-sm px-2 py-1 rounded-xl border border-red-400 hover:bg-red-600 transition"
              title="Delete character"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setModalOpen(true)}
        className="w-full py-2 bg-gray-800 rounded-xl text-yellow-400 hover:bg-yellow-700 transition font-semibold"
      >
        + Add Character
      </button>

      <AddCharacterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addCharacter}
      />
    </div>
  );
}
