import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../../firebase";
import {
  collection, query, where, getDocs, setDoc, doc, deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const LOCAL_KEY = "idle_loot_boss_runs";

function mergeRuns(cloud, local) {
  const byId = {};
  [...cloud, ...local].forEach(run => {
    byId[run.id] = { ...byId[run.id], ...run };
  });
  return Object.values(byId);
}

export default function useHybridBossRuns() {
  const [runs, setRuns] = useState(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    async function syncWithCloud() {
      const q = query(
        collection(db, "bossRuns"),
        where("uid", "==", user.uid)
      );
      const snap = await getDocs(q);
      const cloudRuns = snap.docs.map(doc => doc.data());
      const localRuns = JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
      const merged = mergeRuns(cloudRuns, localRuns);
      setRuns(merged);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
      for (let run of localRuns) {
        if (!cloudRuns.find(r => r.id === run.id)) {
          await setDoc(doc(db, "bossRuns", run.id), { ...run, uid: user.uid });
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
      await setDoc(doc(db, "bossRuns", run.id), { ...run, uid: auth.currentUser.uid });
    }
  }, []);
  const removeRun = useCallback(async (id) => {
    setRuns(prev => prev.filter(r => r.id !== id));
    if (auth.currentUser) {
      await deleteDoc(doc(db, "bossRuns", id));
    }
  }, []);
  const clearRuns = useCallback(async () => {
    setRuns([]);
    if (auth.currentUser) {
      const q = query(collection(db, "bossRuns"), where("uid", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      for (let d of snap.docs) {
        await deleteDoc(doc(db, "bossRuns", d.id));
      }
    }
  }, []);

  // *** This is the missing update function! ***
  const updateRun = useCallback(async (id, changes) => {
    setRuns(prev =>
      prev.map(run =>
        run.id === id ? { ...run, ...changes } : run
      )
    );
    if (auth.currentUser) {
      // Find the run to update
      const run = runs.find(r => r.id === id);
      if (run) {
        const updatedRun = { ...run, ...changes, uid: auth.currentUser.uid };
        await setDoc(doc(db, "bossRuns", id), updatedRun, { merge: true });
      }
    }
  }, [runs]);

  return { runs, setRuns, addRun, removeRun, clearRuns, updateRun, user };
}
