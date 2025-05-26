import React, { useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut
} from "firebase/auth";
import { auth } from "../../firebase";
import GuideModal from "../../components/common/GuideModal"; // <-- Add this import

export default function Header() {
  const { user, loading } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Anonymous Login
  const handleAnonLogin = async () => {
    setError("");
    try {
      await signInAnonymously(auth);
      setShowModal(false);
    } catch (err) {
      setError(err.message);
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

  // Modal Body
  const ModalBody = (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-xs relative">
        <button
          className="absolute top-3 right-4 text-3xl text-yellow-400 font-bold hover:text-yellow-300"
          onClick={() => setShowModal(false)}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex gap-3 mb-4">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold ${mode === "login" ? "bg-yellow-400 text-gray-900" : "bg-gray-700 text-yellow-300"}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold ${mode === "register" ? "bg-yellow-400 text-gray-900" : "bg-gray-700 text-yellow-300"}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>
        <form
          onSubmit={mode === "login" ? handleLogin : handleRegister}
          className="flex flex-col gap-3"
        >
          <input
            className="p-2 rounded bg-gray-800 text-gray-200 border border-yellow-700"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="username"
            required
          />
          <input
            className="p-2 rounded bg-gray-800 text-gray-200 border border-yellow-700"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
          <button
            type="submit"
            className="bg-yellow-400 text-gray-900 font-semibold rounded py-2 hover:bg-yellow-300"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>
        <div className="my-2 text-center text-gray-400">or</div>
        <button
          onClick={handleAnonLogin}
          className="bg-yellow-400 text-gray-900 font-semibold rounded py-2 w-full hover:bg-yellow-300"
        >
          Continue as Guest
        </button>
        {error && (
          <div className="text-red-500 text-center mt-3 text-sm">{error}</div>
        )}
      </div>
    </div>
  );

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

      {/* RIGHT: Guide + Login/Logout Button */}
      <div className="flex items-center gap-3">
        {/* Guide Button */}
        <button
          onClick={() => setShowGuide(true)}
          className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-yellow-300 transition shadow"
          type="button"
        >
          Guide
        </button>
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
          <>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-yellow-300 transition shadow"
            >
              <LogIn size={18} /> Login / Register
            </button>
            {showModal && ModalBody}
          </>
        )}
        {showGuide && <GuideModal onClose={() => setShowGuide(false)} />} {/* USE YOUR NEW MODAL */}
      </div>
    </header>
  );
}
