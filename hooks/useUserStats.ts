"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getBadgeForCount } from "@/types";

export function useUserStats(userId: string | null) {
  const [animalsHelpedCount, setAnimalsHelpedCount] = useState(0);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setAnimalsHelpedCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const userRef = doc(db, "users", userId);
    const unsub = onSnapshot(
      userRef,
      (snap) => {
        setAnimalsHelpedCount(snap.exists() ? snap.data().animalsHelpedCount ?? 0 : 0);
        setLoading(false);
      },
      () => {
        setAnimalsHelpedCount(0);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [userId]);

  const badge = getBadgeForCount(animalsHelpedCount);
  return { animalsHelpedCount, badge, loading };
}
