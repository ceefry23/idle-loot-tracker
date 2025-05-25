import React from "react";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function Header() {
  const { user, loading } = useAuth();

  // Google Sign-In
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert("Failed to login: " + err.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      alert("Failed to logout: " + err.message);
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 shadow-md border-b border-yellow-700">
      {/* LEFT: IdleMMO Logo (linked) */}
      <a
        href="https://web.idle-mmo.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3"
      >
        <img
          src="https://web.idle-mmo.com/favicon.ico"
          alt="IdleMMO Logo"
          className="h-10 w-10 rounded-lg shadow"
        />
        <span className="hidden sm:inline text-xl font-bold text-yellow-300 tracking-wide">
          IdleMMO
        </span>
      </a>

      {/* RIGHT: Login/Logout Button */}
      <div>
        {loading ? (
          <span className="text-yellow-300">Loading...</span>
        ) : user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-yellow-300 transition shadow"
          >
            <LogOut size={18} /> Logout
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-yellow-300 transition shadow"
          >
            <LogIn size={18} /> Login
          </button>
        )}
      </div>
    </header>
  );
}
