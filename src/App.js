// src/App.js
import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import ProfilePage from "./pages/ProfilePage";
import DungeonPage from "./pages/DungeonPage";
import BossPage from "./pages/BossPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import Header from "./components/common/Header";
import BottomNav from "./components/common/BottomNav";

export default function App() {
  const { user, loading } = useAuth();
  // ← change initial tab from "dungeons" to "profile"
  const [tab, setTab] = useState("profile");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-yellow-300">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col transition-colors">
      <Header onLoginClick={() => setTab("profile")} />

      <div className="flex-1 w-full max-w-4xl mx-auto pt-8 pb-32 px-4">
        {/* Always show ProfilePage when the tab is "profile" or when not logged in */}
        {(!user || tab === "profile") && <ProfilePage />}
        {user && tab === "dungeons"  && <DungeonPage />}
        {user && tab === "bosses"    && <BossPage />}
        {user && tab === "analytics" && <AnalyticsPage />}
      </div>

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
