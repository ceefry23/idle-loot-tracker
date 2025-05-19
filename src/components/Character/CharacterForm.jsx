import { useState } from "react";

export default function CharacterForm({ onAdd }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 my-2">
      <input
        className="border rounded px-2 py-1 flex-1"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Add character"
      />
      <button
        className="bg-blue-600 text-white px-3 rounded"
        type="submit"
      >
        Add
      </button>
    </form>
  );
}
