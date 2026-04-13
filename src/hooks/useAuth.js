/**
 * hooks/useAuth.js
 *
 * Observa Firebase Auth e expõe authUser + isAdmin.
 *
 * ✅ PRODUÇÃO: isAdmin agora lê Firebase Custom Claims do token JWT
 *    em vez de comparar e-mails no cliente (que era facilmente burlável).
 *
 *    Para definir a claim admin em um usuário, use o Admin SDK
 *    via Cloud Function (ver functions/src/admin.ts).
 */

import { useEffect, useState } from "react";
import { onAuthStateChanged }  from "firebase/auth";
import { doc, getDoc }         from "firebase/firestore";
import { auth, db }            from "../firebase.js";

export function useAuth() {
  const [authUser,    setAuthUser]    = useState(null);
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasDraft,    setHasDraft]    = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user ?? null);

      if (user) {
        // ✅ Lê Custom Claims do token JWT assinado pelo Firebase
        // forceRefresh=true garante claims atualizadas após aprovação
        const tokenResult = await user.getIdTokenResult(true);
        setIsAdmin(!!tokenResult.claims.admin);

        // Verifica se há rascunho salvo
        try {
          const draftSnap = await getDoc(doc(db, "drafts", user.uid));
          setHasDraft(draftSnap.exists());
        } catch {
          setHasDraft(false);
        }
      } else {
        setIsAdmin(false);
        setHasDraft(false);
      }

      setAuthLoading(false);
    });

    return unsub;
  }, []);

  return { authUser, isAdmin, authLoading, hasDraft, setHasDraft };
}
