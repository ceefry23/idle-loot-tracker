import { useState } from "react";
import Header from "./components/common/Header";
import DungeonPage from "./features/dungeon/DungeonPage";
import BossPage from "./features/boss/BossPage";
import AnalyticsPage from "./features/analytics/AnalyticsPage";
import BottomNav from "./components/common/BottomNav";

export default function App() {
  const [tab, setTab] = useState("dungeons");
  // Placeholder for authentication state; wire up backend logic later
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col transition-colors">
      {/* Header at the very top */}
      <Header
        isLoggedIn={isLoggedIn}
        onLogin={() => setIsLoggedIn(true)}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* Main Content */}
      <div className="flex-1 w-full max-w-4xl mx-auto pt-8 pb-32 px-4">
        {tab === "dungeons"  && <DungeonPage />}
        {tab === "bosses"    && <BossPage />}
        {tab === "analytics" && <AnalyticsPage />}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
