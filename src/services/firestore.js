/**
 * services/firestore.js
 *
 * ÚNICO ponto de acesso ao Firestore no lado do cliente.
 *
 * ⚠️  Operações de ESCRITA sensíveis (createEstablishment, reviewRecord)
 *     devem ser migradas para Cloud Functions — ver functions/src/.
 *     As funções aqui são usadas apenas para leitura e rascunhos.
 */

import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

// ─── Rascunhos ────────────────────────────────────────────────────────────────

export async function saveDraft(uid, formData) {
  await setDoc(doc(db, "drafts", uid), {
    ...formData,
    savedAt: serverTimestamp(),
  });
}

export async function loadDraft(uid) {
  const snap = await getDoc(doc(db, "drafts", uid));
  return snap.exists() ? snap.data() : null;
}

export async function deleteDraft(uid) {
  await deleteDoc(doc(db, "drafts", uid));
}

// ─── Busca de estabelecimentos ────────────────────────────────────────────────

export async function searchEstablishments(searchQuery = "", category = "") {
  const ref = collection(db, "establishments");
  const constraints = [where("status", "==", "active")];

  if (category) constraints.push(where("category", "==", category));

  const q = query(ref, ...constraints, orderBy("businessName"), limit(50));
  const snap = await getDocs(q);

  const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Filtro local por nome (Firestore não suporta LIKE)
  if (searchQuery) {
    const lower = searchQuery.toLowerCase();
    return results.filter(r =>
      r.businessName?.toLowerCase().includes(lower) ||
      r.tradeName?.toLowerCase().includes(lower) ||
      r.city?.toLowerCase().includes(lower)
    );
  }

  return results;
}

export async function getEstablishment(uid) {
  const snap = await getDoc(doc(db, "establishments", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function fetchAdminRecords(status = "pending") {
  const q = query(
    collection(db, "establishments"),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * @deprecated Mover para Cloud Function reviewEstablishment
 * Mantido apenas para compatibilidade durante a migração.
 */
export async function reviewRecord(uid, action, reason = "") {
  await setDoc(
    doc(db, "establishments", uid),
    {
      status:     action === "approve" ? "active" : "rejected",
      reviewedAt: serverTimestamp(),
      ...(reason ? { rejectReason: reason } : {}),
    },
    { merge: true }
  );
}
