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

export default function Header() {
  const { user, loading } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(false); // <--- Guide modal state

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

  // Guide Modal
  const GuideModal = (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative text-yellow-200 text-center">
        <button
          className="absolute top-3 right-4 text-3xl text-yellow-400 font-bold hover:text-yellow-300"
          onClick={() => setShowGuide(false)}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">IdleMMO Loot Tracker Guide</h2>
        <ul className="mb-4 text-left list-disc list-inside text-base">
          <li>Start out by creating a character you want to track the runs of.</li>
          <li>Choose your character, dungeon or boss, and loot dropped, then add to run.</li>
          <li>Use the filters to sort your runs by character, dungeon, or boss.</li>
          <li>Log your dungeon and boss runs for advanced analytics and drop tracking.</li>
          <li>Edit your profit margins directly in the form for more accurate tracking based on your unique sell prices.</li>
          <li>If you would like to track travel costs for bosses, you can do that in the form also!</li>
          <li>View stats for total spent, profit, drop streaks, and more.</li>
          <li>Login or use guest mode – your runs are saved locally and in the cloud (if logged in).</li>
        </ul>
        <div className="text-sm text-yellow-400 font-semibold">
          Questions? Contact the developer on Discord at{" "}
          <a
            href="https://discordapp.com/users/378638009421266947"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            ceefry23
          </a>
        </div>
      </div>
    </div>
  );
  
  

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
        {showGuide && GuideModal}
      </div>
    </header>
  );
}
