import { useState, useEffect } from "react";

const STORAGE_KEY = "idle_loot_characters";

export default function useCharacters() {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCharacters(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }, [characters]);

  function addCharacter(name) {
    setCharacters((prev) => [
      ...prev,
      { id: Date.now().toString(), name },
    ]);
  }
  function removeCharacter(id) {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }
  function clearCharacters() {
    setCharacters([]);
  }

  return { characters, addCharacter, removeCharacter, clearCharacters, setCharacters };
}
