import { useState } from "react";

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function CharacterManager({ characters, addCharacter, removeCharacter, onSelectCharacter }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (name.trim()) {
      addCharacter(name.trim());
      setName("");
    }
  }

  function handleDelete(id, name) {
    if (window.confirm(`Are you sure you want to delete character "${name}"?`)) {
      removeCharacter(id);
    }
  }

  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-yellow-300">Characters</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          className="border border-yellow-500 bg-gray-900 text-yellow-200 placeholder-yellow-600
          rounded-xl px-4 py-2 flex-1 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add character"
        />
        <button
          className="bg-yellow-400 text-gray-900 font-bold px-5 py-2 rounded-xl shadow border border-yellow-400
          hover:bg-yellow-300 active:scale-95 transition-all"
          type="submit"
        >
          Add
        </button>
      </form>

      {characters.length === 0 ? (
        <p className="text-gray-500 text-center">No characters yet.</p>
      ) : (
        <ul className="space-y-3">
          {characters.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between bg-gray-800 rounded-xl p-3 hover:bg-yellow-900/30 cursor-pointer"
              onClick={() => onSelectCharacter && onSelectCharacter(c.id)}
              title={`Select character: ${c.name}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-600 text-gray-900 font-bold flex items-center justify-center select-none">
                  {getInitials(c.name)}
                </div>
                <span className="text-yellow-200 font-semibold">{c.name}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(c.id, c.name);
                }}
                className="text-red-400 hover:text-red-200 text-sm px-3 py-1 rounded-xl border border-red-400 hover:bg-red-600 transition"
                title="Delete character"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
