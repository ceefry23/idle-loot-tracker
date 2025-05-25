import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../../firebase";
import {
  collection, query, where, getDocs, setDoc, doc, deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const LOCAL_KEY = "idle_loot_dungeon_runs";

function mergeRuns(cloud, local) {
  const byId = {};
  [...cloud, ...local].forEach(run => {
    byId[run.id] = { ...byId[run.id], ...run };
  });
  return Object.values(byId);
}

export default function useHybridDungeonRuns() {
  const [runs, setRuns] = useState(() => {
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
    if (!user) return;
    async function syncWithCloud() {
      const q = query(
        collection(db, "dungeonRuns"),
        where("uid", "==", user.uid)
      );
      const snap = await getDocs(q);
      const cloudRuns = snap.docs.map(doc => doc.data());
      const localRuns = JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
      const merged = mergeRuns(cloudRuns, localRuns);
      setRuns(merged);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
      // Upload any local-only runs
      for (let run of localRuns) {
        if (!cloudRuns.find(r => r.id === run.id)) {
          await setDoc(doc(db, "dungeonRuns", run.id), { ...run, uid: user.uid });
        }
      }
    }
    syncWithCloud();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(runs));
  }, [runs]);

  // CRUD
  const addRun = useCallback(async (run) => {
    setRuns(prev => [...prev, run]);
    if (auth.currentUser) {
      await setDoc(doc(db, "dungeonRuns", run.id), { ...run, uid: auth.currentUser.uid });
    }
  }, []);

  const removeRun = useCallback(async (id) => {
    setRuns(prev => prev.filter(r => r.id !== id));
    if (auth.currentUser) {
      await deleteDoc(doc(db, "dungeonRuns", id));
    }
  }, []);

  const clearRuns = useCallback(async () => {
    setRuns([]);
    if (auth.currentUser) {
      const q = query(collection(db, "dungeonRuns"), where("uid", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      for (let d of snap.docs) {
        await deleteDoc(doc(db, "dungeonRuns", d.id));
      }
    }
  }, []);

  // UPDATE
  const updateRun = useCallback(async (id, updates) => {
    setRuns(prev =>
      prev.map(run =>
        run.id === id ? { ...run, ...updates } : run
      )
    );
    if (auth.currentUser) {
      const docRef = doc(db, "dungeonRuns", id);
      await setDoc(docRef, { ...(runs.find(r => r.id === id) || {}), ...updates, uid: auth.currentUser.uid }, { merge: true });
    }
  }, [runs]);

  return { runs, setRuns, addRun, removeRun, clearRuns, updateRun, user };
}
