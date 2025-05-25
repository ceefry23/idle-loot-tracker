import { Home, Swords, BarChart3 } from "lucide-react";

const navItems = [
  // { id: "profile",   label: "Profile",   icon: <User />      }, // <-- REMOVED
  { id: "dungeons",  label: "Dungeons",  icon: <Home />      },
  { id: "bosses",    label: "Bosses",    icon: <Swords />    },
  { id: "analytics", label: "Analytics", icon: <BarChart3 /> },
];

export default function BottomNav({ tab, setTab }) {
  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50
        bg-gray-900/90 border border-yellow-700 backdrop-blur-xl shadow-2xl
        rounded-2xl px-4 py-2 flex justify-between gap-2 max-w-xs w-full transition-all"
    >
      {navItems.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          className={`flex flex-col items-center flex-1 px-2 py-1 rounded-xl transition font-semibold
            ${
              tab === id
                ? "bg-yellow-400 text-gray-900 shadow border border-yellow-700 scale-105"
                : "text-yellow-400 border border-transparent hover:border-yellow-600 hover:bg-gray-800/60"
            }`}
          style={
            tab === id
              ? { boxShadow: "0 4px 24px 0 rgba(255, 215, 0, 0.1)" }
              : undefined
          }
        >
          <div className="w-6 h-6 mb-1">{icon}</div>
          <span className="text-xs">{label}</span>
        </button>
      ))}
    </nav>
  );
}
