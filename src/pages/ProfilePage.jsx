// src/pages/ProfilePage.jsx
import { useState } from "react";
import CharacterSelector from "../components/common/CharacterSelector";

export default function ProfilePage() {
  const [selectedCharacterId, setSelectedCharacterId] = useState("");

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Banner */}
      <img
        src="/images/idle_loot_tracker.png"
        alt="Loot Tracker Banner"
        className="w-full max-w-md mx-auto mb-6 rounded-xl shadow-lg"
      />

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-4 text-yellow-300 text-center">
        Your Characters
      </h1>

      {/* Universal Character Selector */}
      <CharacterSelector
        selectedId={selectedCharacterId}
        onSelect={setSelectedCharacterId}
      />
    </div>
  );
}