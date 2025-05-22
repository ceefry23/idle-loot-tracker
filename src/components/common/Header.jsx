// src/components/common/Header.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut, LogIn } from "lucide-react";

export default function Header({ onLoginClick }) {
  const { user, logoutUser } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-900 shadow-lg">
      <img
        src="/images/idle_loot_tracker.png"
        alt="Loot Tracker"
        className="h-10"
      />

      {user ? (
        <button
          onClick={logoutUser}
          className="flex items-center text-red-400 hover:text-red-200"
          title="Logout"
        >
          <LogOut className="w-5 h-5 mr-1" />
          Logout
        </button>
      ) : (
        onLoginClick && (
          <button
            onClick={onLoginClick}
            className="flex items-center text-yellow-300 hover:text-yellow-200"
            title="Login"
          >
            <LogIn className="w-5 h-5 mr-1" />
            Login
          </button>
        )
      )}
    </header>
  );
}
