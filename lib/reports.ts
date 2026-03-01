import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { REPORT_HIDE_THRESHOLD } from "@/types";

/**
 * Envia uma denúncia para o animal.
 * Cria doc em reports e incrementa reportCount no animal.
 * Se reportCount atingir REPORT_HIDE_THRESHOLD, define status do animal como "hidden".
 * Retorna se o animal foi ocultado.
 */
export async function submitReport(
  animalId: string,
  reason: string,
  reportedBy: string
): Promise<{ success: boolean; hidden: boolean }> {
  const reportRef = doc(collection(db, "reports"));
  const animalRef = doc(db, "animals", animalId);

  try {
    const hidden = await runTransaction(db, async (tx) => {
      tx.set(reportRef, {
        animalId,
        reason: reason.trim(),
        reportedBy,
        createdAt: serverTimestamp(),
      });

      const animalSnap = await tx.get(animalRef);
      if (!animalSnap.exists()) return false;

      const data = animalSnap.data();
      const currentCount = (data.reportCount ?? 0) + 1;

      if (currentCount >= REPORT_HIDE_THRESHOLD) {
        tx.update(animalRef, {
          reportCount: currentCount,
          status: "hidden",
        });
        return true;
      }

      tx.update(animalRef, {
        reportCount: increment(1),
      });
      return false;
    });

    return { success: true, hidden };
  } catch (e) {
    console.error("submitReport", e);
    return { success: false, hidden: false };
  }
}
