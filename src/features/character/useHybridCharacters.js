import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../../firebase";
import {
  collection, query, where, getDocs, setDoc, doc, deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const LOCAL_KEY = "idle_loot_characters";

function mergeCharacters(cloud, local) {
  const byId = {};
  [...cloud, ...local].forEach(character => {
    if (character.id) byId[character.id] = { ...byId[character.id], ...character };
  });
  return Object.values(byId);
}

export default function useHybridCharacters() {
  const [characters, setCharacters] = useState(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [user, setUser] = useState(null);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  // Sync cloud and local on login
  useEffect(() => {
    if (!user || !user.uid) return;
    async function syncWithCloud() {
      try {
        const q = query(
          collection(db, "characters"),
          where("uid", "==", user.uid)
        );
        const snap = await getDocs(q);
        const cloudCharacters = snap.docs.map(doc => doc.data());
        const localCharacters = JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
        const merged = mergeCharacters(cloudCharacters, localCharacters);
        setCharacters(merged);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
        // Upload any local-only characters
        for (let character of localCharacters) {
          if (!character.id) continue; // skip if no id!
          if (!cloudCharacters.find(c => c.id === character.id)) {
            await setDoc(doc(db, "characters", character.id), { ...character, uid: user.uid });
          }
        }
      } catch (err) {
        // Optional: show error in UI
        console.error("Character sync failed:", err);
      }
    }
    syncWithCloud();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(characters));
  }, [characters]);

  // CRUD
  const addCharacter = useCallback(async (character) => {
    if (!character || !character.id || !character.name) {
      alert("Character must have a name and ID.");
      return;
    }
    setCharacters(prev => [...prev, character]);
    if (auth.currentUser && auth.currentUser.uid) {
      await setDoc(doc(db, "characters", character.id), { ...character, uid: auth.currentUser.uid });
    }
  }, []);

  const removeCharacter = useCallback(async (id) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    if (auth.currentUser && auth.currentUser.uid) {
      await deleteDoc(doc(db, "characters", id));
    }
  }, []);

  const clearCharacters = useCallback(async () => {
    setCharacters([]);
    if (auth.currentUser && auth.currentUser.uid) {
      const q = query(collection(db, "characters"), where("uid", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      for (let d of snap.docs) {
        await deleteDoc(doc(db, "characters", d.id));
      }
    }
  }, []);

  return {
    characters,
    setCharacters,
    addCharacter,
    removeCharacter,
    clearCharacters,
    user
  };
}
