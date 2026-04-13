/**
 * functions/src/professionals.ts
 *
 * Cloud Function para criação de estabelecimentos.
 *
 * ✅ Validação e escrita no Firestore acontecem no servidor —
 *    não podem ser burladas via DevTools do browser.
 *
 * Deploy:
 *   cd functions && npm run deploy
 *   ou: firebase deploy --only functions
 */

import * as functions from "firebase-functions";
import * as admin     from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ── Helpers de validação server-side ─────────────────────────────────────────
function validateCNPJ(cnpj: string): boolean {
  const n = cnpj.replace(/\D/g, "");
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const calc = (len: number) => {
    let sum = 0, pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += parseInt(n.charAt(len - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11);
  };
  return calc(12) === parseInt(n[12]) && calc(13) === parseInt(n[13]);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Cloud Function principal ──────────────────────────────────────────────────
export const createEstablishment = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    // 1. Autenticação obrigatória
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Autenticação necessária"
      );
    }

    const uid = context.auth.uid;

    // 2. Validação server-side dos campos obrigatórios
    if (!data.businessName?.trim()) {
      throw new functions.https.HttpsError("invalid-argument", "Nome da empresa obrigatório");
    }
    if (!validateCNPJ(data.cnpj ?? "")) {
      throw new functions.https.HttpsError("invalid-argument", "CNPJ inválido");
    }
    if (!validateEmail(data.email ?? "")) {
      throw new functions.https.HttpsError("invalid-argument", "E-mail inválido");
    }
    if (!data.street || !data.city || !data.state) {
      throw new functions.https.HttpsError("invalid-argument", "Endereço incompleto");
    }

    // 3. Impede duplicidade de CNPJ
    const cnpjRaw = data.cnpj.replace(/\D/g, "");
    const existing = await db.collection("establishments")
      .where("cnpjRaw", "==", cnpjRaw)
      .limit(1)
      .get();
    if (!existing.empty) {
      throw new functions.https.HttpsError(
        "already-exists",
        "CNPJ já cadastrado no sistema"
      );
    }

    // 4. Gera protocolo único
    const protocol = `BH-${uid.slice(0, 8).toUpperCase()}`;

    // 5. Campos permitidos — whitelist explícita (nunca spread direto do cliente)
    const payload = {
      uid,
      protocol,
      status: "pending",          // nunca "active" diretamente — aprovação é manual
      cnpjRaw,
      cnpj:         data.cnpj,
      businessName: data.businessName.trim(),
      tradeName:    data.tradeName?.trim() ?? "",
      email:        data.email.toLowerCase().trim(),
      phone:        data.phone ?? "",
      whatsapp:     data.whatsapp ?? "",
      instagram:    data.instagram ?? "",
      description:  data.description ?? "",
      // Endereço
      cep:          data.cep ?? "",
      street:       data.street ?? "",
      number:       data.number ?? "",
      complement:   data.complement ?? "",
      neighborhood: data.neighborhood ?? "",
      city:         data.city ?? "",
      state:        data.state ?? "",
      // Responsável
      ownerName:    data.ownerName ?? "",
      ownerEmail:   data.ownerEmail ?? "",
      ownerCPF:     data.ownerCPF ?? "",
      ownerPhone:   data.ownerPhone ?? "",
      // Verificações
      cnpjVerified:  !!data.cnpjVerified,
      emailVerified: !!data.emailVerified,
      phoneVerified: !!data.phoneVerified,
      // Catálogo
      services: Array.isArray(data.services) ? data.services : [],
      products: Array.isArray(data.products)  ? data.products  : [],
      // Timestamps
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("establishments").doc(uid).set(payload);

    // 6. Limpa rascunho se existir
    try {
      await db.collection("drafts").doc(uid).delete();
    } catch { /* silencioso */ }

    return { protocol };
  });
