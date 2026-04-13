/**
 * functions/src/admin.ts
 *
 * Cloud Functions de administração:
 *   - setAdminClaim    → define claim { admin: true } em um usuário
 *   - reviewEstablishment → aprova ou rejeita um cadastro
 *
 * ✅ Autenticação verificada via Custom Claims no servidor —
 *    não depende de e-mail no cliente (que era burlável).
 */

import * as functions from "firebase-functions";
import * as admin     from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ── Promove usuário a admin ───────────────────────────────────────────────────
// Chamado por um super-admin via Admin SDK ou painel interno seguro.
// Nunca exposta ao browser diretamente.
export const setAdminClaim = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    // Apenas super-admins podem criar outros admins
    if (!context.auth?.token?.superAdmin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Apenas super-admins podem promover usuários"
      );
    }

    if (!data.uid) {
      throw new functions.https.HttpsError("invalid-argument", "UID obrigatório");
    }

    await admin.auth().setCustomUserClaims(data.uid, { admin: true });

    // Força invalidação do token atual do usuário
    await admin.auth().revokeRefreshTokens(data.uid);

    return { success: true, message: `Usuário ${data.uid} agora é admin` };
  });

// ── Revoga acesso admin ───────────────────────────────────────────────────────
export const revokeAdminClaim = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    if (!context.auth?.token?.superAdmin) {
      throw new functions.https.HttpsError("permission-denied", "Proibido");
    }

    await admin.auth().setCustomUserClaims(data.uid, { admin: false });
    await admin.auth().revokeRefreshTokens(data.uid);

    return { success: true };
  });

// ── Aprovar / Reprovar estabelecimento ────────────────────────────────────────
export const reviewEstablishment = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    // Apenas admins autenticados via Custom Claims
    if (!context.auth?.token?.admin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Acesso negado — apenas admins"
      );
    }

    const { uid, action, reason } = data;

    if (!uid || !["approve", "reject"].includes(action)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "uid e action (approve | reject) são obrigatórios"
      );
    }

    const docRef = db.collection("establishments").doc(uid);
    const snap   = await docRef.get();

    if (!snap.exists) {
      throw new functions.https.HttpsError("not-found", "Estabelecimento não encontrado");
    }

    await docRef.update({
      status:     action === "approve" ? "active" : "rejected",
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: context.auth.uid,
      ...(reason ? { rejectReason: reason } : {}),
    });

    // Notifica o estabelecimento por e-mail (opcional — integrar SendGrid/EmailJS)
    // await sendReviewEmail(snap.data()?.email, action, reason);

    return { success: true, status: action === "approve" ? "active" : "rejected" };
  });
