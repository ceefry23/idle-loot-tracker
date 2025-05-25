import { createContext, useContext } from "react";
import useHybridCharacters from "./useHybridCharacters";

const CharacterContext = createContext(null);

export function CharactersProvider({ children }) {
  const charHook = useHybridCharacters();
  return (
    <CharacterContext.Provider value={charHook}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharactersContext() {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error(
      "useCharactersContext must be used within a <CharactersProvider>"
    );
  }
  return ctx;
}
