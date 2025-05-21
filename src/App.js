// src/App.js
import { useState } from "react";
import ProfilePage from "./pages/ProfilePage";
import DungeonPage from "./pages/DungeonPage";
import BossPage from "./pages/BossPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BottomNav from "./components/common/BottomNav";

export default function App() {
  const [tab, setTab] = useState("dungeons");

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col transition-colors">
      <div className="flex-1 w-full max-w-4xl mx-auto pt-8 pb-32 px-4">
        {tab === "profile"   && <ProfilePage />}
        {tab === "dungeons"  && <DungeonPage />}
        {tab === "bosses"    && <BossPage />}
        {tab === "analytics" && <AnalyticsPage />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
