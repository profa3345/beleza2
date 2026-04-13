// ─── Formatadores ────────────────────────────────────────────────────────────

export const fmtCNPJ = (v = "") => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

export const fmtCPF = (v = "") => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
};

export const fmtPhone = (v = "") => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d)/, "($1) $2-$3");
  return d.replace(/(\d{2})(\d{5})(\d)/, "($1) $2-$3");
};

export const fmtCEP = (v = "") => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d)/, "$1-$2");
};

export const fmtCurrency = (v = 0) =>
  new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(v);

// ─── Validadores ─────────────────────────────────────────────────────────────

export const validateEmail = (v = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const validateCNPJ = (cnpj = "") => {
  const n = cnpj.replace(/\D/g, "");
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const calc = (len) => {
    let sum = 0, pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += parseInt(n.charAt(len - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11);
  };
  return calc(12) === parseInt(n[12]) && calc(13) === parseInt(n[13]);
};

export const validateCPF = (cpf = "") => {
  const n = cpf.replace(/\D/g, "");
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
  const calc = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(n[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 || r === 11 ? 0 : r;
  };
  return calc(9) === parseInt(n[9]) && calc(10) === parseInt(n[10]);
};

export const validateFileType = (file, allowed = []) =>
  allowed.includes(file?.type);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Gera ID único curto */
export const uid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Gera OTP numérico de 6 dígitos */
export const generateOTP = () =>
  String(Math.floor(100000 + Math.random() * 900000));

/** Score de força da senha */
export const passwordStrength = (pw = "") => {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let s = 0;
  if (pw.length >= 8)          s += 25;
  if (pw.length >= 12)         s += 15;
  if (/[A-Z]/.test(pw))        s += 20;
  if (/[0-9]/.test(pw))        s += 20;
  if (/[^A-Za-z0-9]/.test(pw)) s += 20;
  if (s <= 25)  return { score: s, label: "Muito fraca",  color: "#E5534B" };
  if (s <= 45)  return { score: s, label: "Fraca",        color: "#E07B39" };
  if (s <= 65)  return { score: s, label: "Razoável",     color: "#D4A017" };
  if (s <= 85)  return { score: s, label: "Forte",        color: "#5BAA5B" };
  return              { score: s, label: "Muito forte",   color: "#2E8B57" };
};

/** Trunca string para exibição */
export const truncate = (str = "", max = 40) =>
  str.length > max ? str.slice(0, max) + "…" : str;

/** Formata data para pt-BR */
export const fmtDate = (ts) => {
  if (!ts) return "—";
  const d = ts?.toDate?.() ?? new Date(ts);
  return d.toLocaleDateString("pt-BR", { day:"2-digit", month:"2-digit", year:"numeric" });
};
