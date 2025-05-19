import { useState } from "react";
import DungeonPage from "./pages/DungeonPage";
import BossPage from "./pages/BossPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BottomNav from "./components/common/BottomNav";
// import ThemeToggle from "./components/common/ThemeToggle"; // Removed for dark-only

function App() {
  const [tab, setTab] = useState("dungeons");

  return (
    // ONLY dark classes below
    <div className="min-h-screen bg-gray-950 flex flex-col transition-colors">
      {/* ThemeToggle REMOVED */}
      <div className="flex-1 w-full max-w-2xl mx-auto pt-8 pb-32 px-4">
        {tab === "dungeons" && <DungeonPage />}
        {tab === "bosses" && <BossPage />}
        {tab === "analytics" && <AnalyticsPage />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

export default App;
