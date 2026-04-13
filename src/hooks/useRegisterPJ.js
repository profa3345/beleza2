/**
 * hooks/useRegisterPJ.js
 *
 * Encapsula toda a lógica do cadastro de Pessoa Jurídica (5 etapas):
 *   - estado do formulário (reducer)
 *   - validação por etapa
 *   - verificação de CNPJ via Receita Federal
 *   - OTP de e-mail e telefone
 *   - score de segurança calculado
 *   - upload de imagem (preview local — TODO: Firebase Storage)
 *   - submit final → Cloud Function createEstablishment()
 *
 * ✅ PRODUÇÃO: handleSubmit agora chama Cloud Function em vez de
 *    escrever diretamente no Firestore. Validação acontece no servidor.
 */

import { useState, useRef, useEffect, useReducer, useCallback } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFunctions, httpsCallable }    from "firebase/functions";
import { auth } from "../firebase.js";
import { sendEmailOTP } from "../services/emailjs.js";
import { INITIAL_FORM, formReducer } from "./formState.js";
import {
  validateCNPJ, validateCPF, validateEmail, validateFileType,
  generateOTP, passwordStrength,
} from "../utils/helpers.js";
import { ALLOWED_IMAGE_TYPES } from "../constants/index.js";

// ── Cloud Function client ─────────────────────────────────────────────────────
const functions = getFunctions(undefined, "southamerica-east1");
const createEstablishmentFn = httpsCallable(functions, "createEstablishment");

// ── Validação por etapa ───────────────────────────────────────────────────────
function validatePJStep(step, formData) {
  const e = {};
  if (step === 1) {
    if (!formData.businessName)         e.businessName  = "Nome obrigatório";
    if (!validateCNPJ(formData.cnpj))   e.cnpj          = "CNPJ inválido";
    if (!formData.cnpjVerified)         e.cnpjVerified  = "Verifique o CNPJ antes de continuar";
    if (!validateEmail(formData.email)) e.email         = "E-mail inválido";
    if (!formData.phone)                e.phone         = "Telefone obrigatório";
  }
  if (step === 2) {
    if (!formData.cep)    e.cep    = "CEP obrigatório";
    if (!formData.street) e.street = "Rua obrigatória";
    if (!formData.number) e.number = "Número obrigatório";
    if (!formData.city)   e.city   = "Cidade obrigatória";
    if (!formData.state)  e.state  = "Estado obrigatório";
  }
  if (step === 3) {
    if (!formData.ownerName)  e.ownerName  = "Nome obrigatório";
    if (!formData.ownerEmail) e.ownerEmail = "E-mail obrigatório";
    if (formData.ownerCPF && !validateCPF(formData.ownerCPF)) e.ownerCPF = "CPF inválido";
  }
  if (step === 4) {
    if (!formData.emailVerified) e.emailVerified = "Confirme o e-mail";
    if (!formData.phoneVerified) e.phoneVerified = "Confirme o telefone";
  }
  if (step === 5) {
    const pw = formData.password;
    if (pw.length < 8)                   e.password        = "Mínimo 8 caracteres";
    else if (!/[A-Z]/.test(pw))          e.password        = "Inclua ao menos uma maiúscula";
    else if (!/[0-9]/.test(pw))          e.password        = "Inclua ao menos um número";
    if (pw !== formData.confirmPassword) e.confirmPassword = "Senhas não conferem";
    if (!formData.acceptTerms)           e.acceptTerms     = "Aceite os termos";
    if (!formData.acceptPrivacy)         e.acceptPrivacy   = "Aceite a política de privacidade";
    if (!formData.acceptAntiFraud)       e.acceptAntiFraud = "Aceite os termos antifraude";
  }
  return e;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useRegisterPJ({ authUser, services, products, showToast, onSuccess, initialData }) {
  const [formData,        dispatch]          = useReducer(formReducer, initialData ?? INITIAL_FORM);
  const [step,            setStep]           = useState(1);
  const [errors,          setErrors]         = useState({});
  const [verifyingCNPJ,   setVerifyingCNPJ]  = useState(false);
  const [cnpjData,        setCnpjData]       = useState(null);
  const [cnpjError,       setCnpjError]      = useState("");
  const [sendingCode,     setSendingCode]    = useState(false);
  const [logoPreview,     setLogoPreview]    = useState(null);
  const [coverPreview,    setCoverPreview]   = useState(null);
  const [showPass,        setShowPass]       = useState(false);
  const [showConfirmPass, setShowConfirmPass]= useState(false);
  const [isSubmitting,    setIsSubmitting]   = useState(false);
  const [securityScore,   setSecurityScore]  = useState(0);
  const [protocol,        setProtocol]       = useState(null);

  const emailOTPRef = useRef("");
  const phoneOTPRef = useRef("");

  const set = useCallback((key, val) => dispatch({ key, val }), []);

  // ── Score de segurança
  useEffect(() => {
    let s = 0;
    if (formData.cnpjVerified)  s += 20;
    if (formData.emailVerified) s += 15;
    if (formData.phoneVerified) s += 15;
    if (formData.ownerDoc)      s += 25;
    if (formData.addressProof)  s += 25;
    setSecurityScore(s);
  }, [formData.cnpjVerified, formData.emailVerified, formData.phoneVerified,
      formData.ownerDoc, formData.addressProof]);

  // ── Verificação CNPJ (Receita Federal pública)
  const verifyCNPJ = async () => {
    if (!validateCNPJ(formData.cnpj)) {
      showToast("CNPJ inválido — verifique os dígitos", "error");
      return;
    }
    setVerifyingCNPJ(true); setCnpjError(""); setCnpjData(null);
    try {
      const raw = formData.cnpj.replace(/\D/g, "");
      const res = await fetch(`https://publica.cnpj.ws/cnpj/${raw}`);
      if (!res.ok) throw new Error("not_found");
      const data = await res.json();
      const situacao = data.situacao_cadastral?.descricao || "";
      if (situacao.toUpperCase() !== "ATIVA") {
        setCnpjError(`CNPJ ${situacao || "irregular"} na Receita Federal`);
        showToast("CNPJ não está ativo", "error");
      } else {
        setCnpjData(data);
        set("cnpjVerified", true);
        if (!formData.businessName && data.razao_social) set("businessName", data.razao_social);
        showToast("CNPJ verificado ✓", "success");
      }
    } catch (err) {
      if (err.message === "not_found") {
        setCnpjError("CNPJ não encontrado na Receita Federal");
        showToast("CNPJ não encontrado", "error");
      } else {
        // API indisponível — aceita validação local
        set("cnpjVerified", true);
        showToast("CNPJ válido (API indisponível — verificado localmente)", "info");
      }
    } finally {
      setVerifyingCNPJ(false);
    }
  };

  // ── OTP
  const sendVerification = async (type) => {
    setSendingCode(true);
    const otp = generateOTP();
    if (type === "email") {
      emailOTPRef.current = otp;
      try {
        await sendEmailOTP(formData.email, otp);
        showToast(`Código enviado para ${formData.email}`, "success");
      } catch {
        showToast(`[DEMO] Código: ${otp} — configure EmailJS para envio real`, "info");
      }
    } else {
      phoneOTPRef.current = otp;
      // TODO: integrar Z-API ou Twilio para SMS real
      showToast(`[DEMO SMS] Código: ${otp} — integre Z-API para SMS real`, "info");
    }
    setSendingCode(false);
  };

  const checkCode = (type) => {
    const entered  = type === "email" ? formData.emailCode  : formData.phoneCode;
    const expected = type === "email" ? emailOTPRef.current : phoneOTPRef.current;
    if (!expected) { showToast("Envie o código primeiro", "error"); return; }
    if (entered === expected) {
      set(type === "email" ? "emailVerified" : "phoneVerified", true);
      showToast(`${type === "email" ? "E-mail" : "Telefone"} verificado ✓`, "success");
    } else {
      showToast("Código incorreto", "error");
    }
  };

  // ── Upload de imagem (preview local)
  // TODO: substituir por upload real para Firebase Storage
  const handleImageUpload = (e, setter) => {
    const file = e.target.files[0]; if (!file) return;
    if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
      showToast("Formato inválido", "error"); e.target.value = ""; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Imagem deve ter menos de 5MB", "error"); e.target.value = ""; return;
    }
    const reader = new FileReader();
    reader.onload = ev => setter(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Navegação
  const nextStep = () => {
    const e = validatePJStep(step, formData);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(p => p + 1);
    window.scrollTo(0, 0);
  };
  const prevStep = () => {
    setStep(p => p - 1);
    setErrors({});
    window.scrollTo(0, 0);
  };
  const goToStep = (n) => {
    if (n < step) { setStep(n); setErrors({}); window.scrollTo(0, 0); }
  };

  // ── Submit final via Cloud Function ──────────────────────────────────────────
  // ✅ Validação e escrita no Firestore acontecem no servidor (não podem ser burladas)
  const handleSubmit = async () => {
    const e = validatePJStep(5, formData);
    if (Object.keys(e).length) { setErrors(e); return; }
    setIsSubmitting(true);

    try {
      // 1. Cria conta Firebase Auth se ainda não existe
      let userId = authUser?.uid;
      if (!userId) {
        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        userId = cred.user.uid;
      }

      // 2. Chama Cloud Function — validação e gravação acontecem no servidor
      const result = await createEstablishmentFn({
        ...formData,
        services,
        products,
      });

      const { protocol: proto } = result.data;
      setProtocol(proto);
      onSuccess(proto, formData.email);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        showToast("E-mail já cadastrado. Tente fazer login.", "error");
      } else if (err.code === "functions/invalid-argument") {
        showToast(err.message, "error");
      } else if (err.code === "functions/unauthenticated") {
        showToast("Sessão expirada. Faça login novamente.", "error");
      } else {
        showToast("Erro ao salvar. Tente novamente.", "error");
        console.error(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData, set, dispatch,
    step, nextStep, prevStep, goToStep,
    errors,
    verifyCNPJ, verifyingCNPJ, cnpjData, cnpjError,
    sendVerification, checkCode, sendingCode,
    logoPreview, setLogoPreview,
    coverPreview, setCoverPreview,
    handleImageUpload,
    showPass, setShowPass,
    showConfirmPass, setShowConfirmPass,
    pwStrength: passwordStrength(formData.password),
    securityScore,
    isSubmitting, handleSubmit, protocol,
  };
}
