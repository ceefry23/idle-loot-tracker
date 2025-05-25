import { useState } from "react";
import useHybridCharacters from "./useHybridCharacters";

export default function CharacterManager() {
  const { characters, addCharacter, updateCharacter, removeCharacter } = useHybridCharacters();
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  function handleAdd() {
    if (newName.trim()) {
      addCharacter({ id: Date.now().toString(), name: newName.trim() });
      setNewName("");
    }
  }

  function handleEdit(id, name) {
    setEditId(id);
    setEditName(name);
  }

  function handleUpdate() {
    if (editName.trim()) {
      updateCharacter(editId, { name: editName.trim() });
      setEditId(null);
      setEditName("");
    }
  }

  function handleDelete(id) {
    if (window.confirm("Delete this character?")) {
      removeCharacter(id);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-2xl shadow-lg border border-yellow-700">
      <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Manage Characters</h2>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 border border-yellow-500 bg-gray-800 text-yellow-200 px-3 py-2 rounded-lg"
          placeholder="Add character"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-300"
        >
          Add
        </button>
      </div>
      <ul>
        {characters.map((char) => (
          <li
            key={char.id}
            className="flex items-center justify-between mb-2 py-2 px-3 rounded bg-gray-800 text-yellow-200"
          >
            {editId === char.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 mr-2 bg-gray-900 text-yellow-100 px-2 py-1 rounded"
                  onKeyDown={e => e.key === "Enter" && handleUpdate()}
                />
                <button
                  onClick={handleUpdate}
                  className="px-2 py-1 bg-green-500 text-white rounded mr-1"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="px-2 py-1 bg-gray-700 text-yellow-200 rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1">{char.name}</span>
                <button
                  onClick={() => handleEdit(char.id, char.name)}
                  className="px-2 py-1 bg-yellow-500 text-gray-900 rounded mr-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(char.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
