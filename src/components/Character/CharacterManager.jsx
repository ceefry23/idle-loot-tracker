import { useState } from "react";

export default function CharacterManager({ characters, addCharacter, removeCharacter }) {
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
    <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-700 p-6 mb-8">
      <h2 className="text-xl font-semibold mb-3 text-yellow-300">Characters</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          className="border border-yellow-500 bg-gray-900 text-yellow-200 placeholder-yellow-600
          rounded-xl px-4 py-2 flex-1 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Add character"
        />
        <button
          className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl shadow border border-yellow-400
          hover:bg-yellow-300 active:scale-95 transition-all"
          type="submit"
        >
          Add
        </button>
      </form>
      <ul>
        {characters.map((c) => (
          <li key={c.id} className="flex justify-between items-center border-b border-gray-800 last:border-b-0 py-1">
            <span className="text-yellow-200">{c.name}</span>
            <button
              onClick={() => handleDelete(c.id, c.name)}
              className="text-red-400 hover:text-red-200 text-xs px-2 py-1 rounded transition"
              title="Delete character"
            >
              Delete
            </button>
          </li>
        ))}
        {characters.length === 0 && (
          <li className="text-gray-500 text-sm py-2">No characters yet.</li>
        )}
      </ul>
    </div>
  );
}
