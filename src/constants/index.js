// ─── Tipos de cadastro (PJ / PF) ─────────────────────────────────────────────
export const REG_TYPES = [
  {
    id:    "pj",
    icon:  "🏢",
    label: "Pessoa Jurídica (CNPJ)",
    desc:  "Salões, clínicas, barbearias, fornecedores — com CNPJ ativo",
    color: "#C9A96E",
  },
  {
    id:    "pf",
    icon:  "✂️",
    label: "Profissional Autônomo (CPF)",
    desc:  "Cabeleireiros, manicures, maquiadores — sem CNPJ",
    color: "#6E9EC9",
  },
];

// ─── Tipos de plano / conta PJ ───────────────────────────────────────────────
export const PLAN_TYPES = [
  {
    id:    "salao",
    icon:  "💇",
    label: "Salão / Clínica",
    desc:  "Oferece serviços: corte, coloração, estética, etc.",
    color: "#C9A96E",
    badge: null,
  },
  {
    id:    "fornecedor",
    icon:  "📦",
    label: "Fornecedor / Distribuidora",
    desc:  "Vende produtos para profissionais e salões",
    color: "#6E9EC9",
    badge: null,
  },
  {
    id:    "ambos",
    icon:  "⭐",
    label: "Salão + Fornecedor",
    desc:  "Atua nas duas frentes — serviços e produtos",
    color: "#9E6EC9",
    badge: "Mais completo",
  },
];

// ─── Categorias de busca ──────────────────────────────────────────────────────
export const SERVICE_CATEGORIES = [
  { id: "",            label: "Todas as categorias" },
  { id: "cabelo",      label: "Cabelo" },
  { id: "coloracao",   label: "Coloração" },
  { id: "estetica",    label: "Estética" },
  { id: "maquiagem",   label: "Maquiagem" },
  { id: "manicure",    label: "Manicure / Pedicure" },
  { id: "barbearia",   label: "Barbearia" },
  { id: "sobrancelha", label: "Sobrancelha / Cílios" },
  { id: "massagem",    label: "Massagem" },
  { id: "depilacao",   label: "Depilação" },
  { id: "fornecedor",  label: "Fornecedor / Distribuidora" },
];

// ─── Estados brasileiros ──────────────────────────────────────────────────────
export const STATES_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO",
  "MA","MT","MS","MG","PA","PB","PR","PE","PI",
  "RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

// ─── Regras antifraude (checklist) ───────────────────────────────────────────
export const FRAUD_RULES = [
  { id:"cnpj",  label:"CNPJ verificado na Receita Federal", desc:"Situação ativa confirmada" },
  { id:"email", label:"E-mail confirmado via OTP",          desc:"Código de 6 dígitos enviado" },
  { id:"tel",   label:"Telefone confirmado via SMS",        desc:"Código de 6 dígitos enviado" },
  { id:"doc",   label:"Documento do responsável enviado",   desc:"RG ou CNH do sócio" },
  { id:"addr",  label:"Comprovante de endereço enviado",    desc:"Conta de luz, água, etc." },
];

// ─── Tipos de imagem aceitos ──────────────────────────────────────────────────
export const ALLOWED_IMAGE_TYPES = ["image/jpeg","image/png","image/webp","image/gif"];

// ─── Tipos de documento aceitos ───────────────────────────────────────────────
export const ALLOWED_DOC_TYPES = [
  "image/jpeg","image/png","image/webp",
  "application/pdf",
];

// ─── Variáveis de ambiente ────────────────────────────────────────────────────
export const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    ?? "";
export const EMAILJS_SVC    = import.meta.env.VITE_EMAILJS_SVC    ?? "";
export const EMAILJS_TPL    = import.meta.env.VITE_EMAILJS_TPL    ?? "";
export const EMAILJS_KEY    = import.meta.env.VITE_EMAILJS_KEY    ?? "";
