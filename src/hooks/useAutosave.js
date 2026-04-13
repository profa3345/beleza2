import { useEffect, useRef } from "react";
import { saveDraft } from "../services/firestore.js";

/**
 * Auto-salva o rascunho no Firestore sempre que formData mudar,
 * com debounce de 1.5s para evitar writes excessivos.
 */
export function useAutosave(uid, formData) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!uid) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveDraft(uid, formData).catch(() => {
        // Silencia erros de autosave — não interrompe o usuário
      });
    }, 1500);

    return () => clearTimeout(timerRef.current);
  }, [uid, formData]);
}
