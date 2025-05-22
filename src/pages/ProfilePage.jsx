// src/pages/ProfilePage.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CharacterSelector from "../components/common/CharacterSelector";
import { LogIn } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, login, signup, loginAsGuest } = useAuth();

  // auth form state
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isNew, setIsNew]       = useState(false);
  const [error, setError]       = useState("");

  // character selector state
  const [selectedCharacterId, setSelectedCharacterId] = useState("");

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    try {
      if (isNew) await signup(email, password);
      else       await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-yellow-300">
        Loading…
      </div>
    );
  }

  // Banner at top, same as other pages
  const Banner = (
    <img
      src="/images/idle_loot_tracker.png"
      alt="Loot Tracker Banner"
      className="w-full max-w-md mx-auto mb-6 rounded-xl shadow-lg"
    />
  );

  // ─── Unauthenticated: login / sign up / guest ───
  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6">
        {Banner}
        <h1 className="text-2xl font-bold mb-4 text-yellow-300 text-center">
          {isNew ? "Sign Up" : "Login"}
        </h1>
        {error && (
          <div className="text-red-500 mb-2 text-center">{error}</div>
        )}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-yellow-500 bg-gray-900 text-yellow-200 px-4 py-2 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-yellow-500 bg-gray-900 text-yellow-200 px-4 py-2 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
            required
          />
          <button
            type="submit"
            className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl hover:bg-yellow-300 transition"
          >
            {isNew ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="text-center mt-4 text-yellow-300">
          <button
            onClick={loginAsGuest}
            className="flex items-center justify-center underline"
          >
            <LogIn className="w-5 h-5 mr-1" />
            Continue as Guest
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-400 text-center">
          {isNew ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => {
              setIsNew((v) => !v);
              setError("");
            }}
            className="underline"
          >
            {isNew ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    );
  }

  // ─── Authenticated: character selector ───
  return (
    <div className="max-w-4xl mx-auto p-6">
      {Banner}
      <h1 className="text-2xl font-bold mb-4 text-yellow-300 text-center">
        Your Characters
      </h1>
      <CharacterSelector
        selectedId={selectedCharacterId}
        onSelect={setSelectedCharacterId}
      />
    </div>
  );
}
