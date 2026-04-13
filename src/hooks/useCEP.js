import { useEffect, useRef } from "react";

/**
 * Busca endereço pelo CEP via ViaCEP e preenche os campos do formulário.
 * Só dispara quando o CEP tem 9 chars (00000-000).
 */
export function useCEP(cep, set, showToast) {
  const lastCEP = useRef("");

  useEffect(() => {
    const raw = cep?.replace(/\D/g, "") ?? "";
    if (raw.length !== 8 || raw === lastCEP.current) return;
    lastCEP.current = raw;

    fetch(`https://viacep.com.br/ws/${raw}/json/`)
      .then(r => r.json())
      .then(data => {
        if (data.erro) {
          showToast("CEP não encontrado", "error");
          return;
        }
        set("street",       data.logradouro  ?? "");
        set("neighborhood", data.bairro       ?? "");
        set("city",         data.localidade   ?? "");
        set("state",        data.uf           ?? "");
        showToast("Endereço preenchido automaticamente ✓", "success");
      })
      .catch(() => showToast("Não foi possível buscar o CEP", "error"));
  }, [cep, set, showToast]);
}
