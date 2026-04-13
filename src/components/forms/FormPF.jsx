import React, { useState, useReducer, useRef, useCallback } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFunctions, httpsCallable }    from "firebase/functions";
import { auth }   from "../../firebase.js";
import { STATES_BR } from "../../constants/index.js";
import { fmtCPF, fmtPhone, fmtCEP, validateEmail, validateCPF, generateOTP, passwordStrength } from "../../utils/helpers.js";
import { sendEmailOTP } from "../../services/emailjs.js";
import { INITIAL_FORM_PF, formReducer } from "../../hooks/formState.js";
import { useCEP } from "../../hooks/useCEP.js";
import { Field, Row2, FormSection, Hint, Spinner, Overline } from "../ui/index.jsx";

const functions = getFunctions(undefined, "southamerica-east1");
const createProfessionalFn = httpsCallable(functions, "createProfessional");

const TOTAL = 3;
const LABELS = ["Dados", "Verificação", "Acesso"];

function validate(step, f) {
  const e = {};
  if (step === 1) {
    if (!f.fullName)              e.fullName = "Nome obrigatório";
    if (f.cpf && !validateCPF(f.cpf)) e.cpf = "CPF inválido";
    if (!validateEmail(f.email))  e.email   = "E-mail inválido";
    if (!f.phone)                 e.phone   = "Telefone obrigatório";
    if (!f.cep)                   e.cep     = "CEP obrigatório";
    if (!f.city)                  e.city    = "Cidade obrigatória";
    if (!f.state)                 e.state   = "Estado obrigatório";
  }
  if (step === 2) {
    if (!f.emailVerified) e.emailVerified = "Confirme o e-mail";
  }
  if (step === 3) {
    const pw = f.password;
    if (pw.length < 8)                  e.password        = "Mínimo 8 caracteres";
    else if (!/[A-Z]/.test(pw))         e.password        = "Inclua ao menos uma maiúscula";
    else if (!/[0-9]/.test(pw))         e.password        = "Inclua ao menos um número";
    if (pw !== f.confirmPassword)       e.confirmPassword = "Senhas não conferem";
    if (!f.acceptTerms)                 e.acceptTerms     = "Aceite os termos";
    if (!f.acceptPrivacy)               e.acceptPrivacy   = "Aceite a política";
  }
  return e;
}

export function FormPF({ showToast, onSuccess }) {
  const [form,        dispatch]     = useReducer(formReducer, INITIAL_FORM_PF);
  const [step,        setStep]      = useState(1);
  const [errors,      setErrors]    = useState({});
  const [sendingCode, setSending]   = useState(false);
  const [submitting,  setSubmitting]= useState(false);
  const [showPass,    setShowPass]  = useState(false);
  const otpRef = useRef("");
  const set = useCallback((k, v) => dispatch({ key:k, val:v }), []);

  useCEP(form.cep, set, showToast);

  const next = () => {
    const e = validate(step, form);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setStep(p => p + 1); window.scrollTo(0,0);
  };
  const prev = () => { setStep(p => p - 1); setErrors({}); window.scrollTo(0,0); };

  const sendCode = async () => {
    setSending(true);
    const otp = generateOTP();
    otpRef.current = otp;
    try {
      await sendEmailOTP(form.email, otp);
      showToast(`Código enviado para ${form.email}`, "success");
    } catch {
      showToast(`[DEMO] Código: ${otp}`, "info");
    }
    setSending(false);
  };

  const checkCode = () => {
    if (!otpRef.current) { showToast("Envie o código primeiro", "error"); return; }
    if (form.emailCode === otpRef.current) {
      set("emailVerified", true);
      showToast("E-mail verificado ✓", "success");
    } else {
      showToast("Código incorreto", "error");
    }
  };

  const submit = async () => {
    const e = validate(3, form);
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const result = await createProfessionalFn({ ...form, uid: cred.user.uid });
      onSuccess(result.data.protocol, form.email);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") showToast("E-mail já cadastrado", "error");
      else showToast("Erro ao salvar. Tente novamente.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const pwStrength = passwordStrength(form.password);

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 24px" }}>
      {/* Progress */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--ink-muted)" }}>Etapa {step} de {TOTAL}</span>
          <span style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--gold)" }}>{Math.round(step/TOTAL*100)}%</span>
        </div>
        <div className="score-bar" style={{ height:4, marginBottom:10 }}>
          <div className="score-fill" style={{ width:`${step/TOTAL*100}%`, background:"linear-gradient(90deg,#6E9EC9,#9EC9E0)", transition:"width 0.4s ease" }} />
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {LABELS.map((l,i) => {
            const n=i+1, done=n<step, active=n===step;
            return (
              <div key={n} className="step-pill" style={{ flex:1, textAlign:"center", background:active?"#6E9EC9":done?"#6E9EC915":"var(--cream-mid)", color:active?"#fff":done?"#6E9EC9":"#B0A898", border:`1px solid ${active?"#6E9EC9":done?"#6E9EC940":"transparent"}` }}>
                {done?"✓":n} {l}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="form-card slide-in">
          <FormSection title="Dados pessoais" icon="✂️">
            <Field label="Nome completo *" error={errors.fullName}>
              <input className={`inp${errors.fullName?" err":""}`} value={form.fullName} onChange={e=>set("fullName",e.target.value)} placeholder="Seu nome completo" />
            </Field>
            <Row2>
              <Field label="CPF" error={errors.cpf}>
                <input className={`inp${errors.cpf?" err":""}`} value={form.cpf} onChange={e=>set("cpf",fmtCPF(e.target.value))} placeholder="000.000.000-00" maxLength={14} />
              </Field>
              <Field label="Telefone *" error={errors.phone}>
                <input className={`inp${errors.phone?" err":""}`} value={form.phone} onChange={e=>set("phone",fmtPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} />
              </Field>
            </Row2>
            <Field label="E-mail *" error={errors.email}>
              <input className={`inp${errors.email?" err":""}`} value={form.email} onChange={e=>set("email",e.target.value)} type="email" placeholder="seu@email.com" />
            </Field>
            <Row2>
              <Field label="Instagram">
                <input className="inp" value={form.instagram} onChange={e=>set("instagram",e.target.value)} placeholder="@voce" />
              </Field>
              <Field label="WhatsApp">
                <input className="inp" value={form.whatsapp} onChange={e=>set("whatsapp",fmtPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} />
              </Field>
            </Row2>
            <Field label="Bio / Especialidades">
              <textarea className="inp" rows={2} value={form.bio} onChange={e=>set("bio",e.target.value)} placeholder="Conte sobre você e suas especialidades..." style={{ resize:"vertical" }} />
            </Field>
            <Overline style={{ margin:"16px 0 12px" }}>ENDEREÇO</Overline>
            <Field label="CEP *" error={errors.cep}>
              <input className={`inp${errors.cep?" err":""}`} value={form.cep} onChange={e=>set("cep",fmtCEP(e.target.value))} placeholder="00000-000" maxLength={9} />
            </Field>
            <Field label="Rua">
              <input className="inp" value={form.street} onChange={e=>set("street",e.target.value)} placeholder="Rua, Avenida..." />
            </Field>
            <Row2>
              <Field label="Número">
                <input className="inp" value={form.number} onChange={e=>set("number",e.target.value)} placeholder="123" />
              </Field>
              <Field label="Complemento">
                <input className="inp" value={form.complement} onChange={e=>set("complement",e.target.value)} placeholder="Apto, Sala..." />
              </Field>
            </Row2>
            <Row2>
              <Field label="Cidade *" error={errors.city}>
                <input className={`inp${errors.city?" err":""}`} value={form.city} onChange={e=>set("city",e.target.value)} />
              </Field>
              <Field label="Estado *" error={errors.state}>
                <select className={`inp${errors.state?" err":""}`} value={form.state} onChange={e=>set("state",e.target.value)}>
                  <option value="">Selecione</option>
                  {STATES_BR.map(s=><option key={s}>{s}</option>)}
                </select>
              </Field>
            </Row2>
          </FormSection>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="form-card slide-in">
          <FormSection title="Verificar e-mail" icon="📧">
            <Hint ok={form.emailVerified}>
              {form.emailVerified ? "✓ E-mail confirmado!" : `Código para ${form.email}`}
            </Hint>
            {!form.emailVerified && (
              <>
                <button className="btn btn--primary" onClick={sendCode} disabled={sendingCode} style={{ padding:"10px 20px", borderRadius:8, fontSize:"0.78rem", marginTop:10 }}>
                  {sendingCode ? "Enviando..." : "Enviar código"}
                </button>
                <Row2>
                  <Field label="Código" error={errors.emailVerified}>
                    <input className="inp" value={form.emailCode} onChange={e=>set("emailCode",e.target.value)} placeholder="000000" maxLength={6} />
                  </Field>
                  <div style={{ display:"flex", alignItems:"flex-end" }}>
                    <button className="btn btn--primary" onClick={checkCode} style={{ width:"100%", padding:"11px", borderRadius:8, fontSize:"0.78rem" }}>Verificar</button>
                  </div>
                </Row2>
              </>
            )}
          </FormSection>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="form-card slide-in">
          <FormSection title="Criar senha" icon="🔐">
            <Field label="Senha *" error={errors.password}>
              <div className="pass-wrap">
                <input className={`inp${errors.password?" err":""}`} type={showPass?"text":"password"} value={form.password} onChange={e=>set("password",e.target.value)} placeholder="Mínimo 8 caracteres" />
                <span className="pass-eye" onClick={()=>setShowPass(p=>!p)}>{showPass?"🙈":"👁"}</span>
              </div>
              {form.password && (
                <>
                  <div className="score-bar" style={{ marginTop:6 }}><div className="score-fill" style={{ width:`${pwStrength.score}%`, background:pwStrength.color }} /></div>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.68rem", color:pwStrength.color, marginTop:3 }}>{pwStrength.label}</div>
                </>
              )}
            </Field>
            <Field label="Confirmar senha *" error={errors.confirmPassword}>
              <input className={`inp${errors.confirmPassword?" err":""}`} type="password" value={form.confirmPassword} onChange={e=>set("confirmPassword",e.target.value)} placeholder="Repita a senha" />
            </Field>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
              {[
                { k:"acceptTerms",   label:"Li e aceito os Termos de Uso",          err:errors.acceptTerms   },
                { k:"acceptPrivacy", label:"Li e aceito a Política de Privacidade", err:errors.acceptPrivacy },
              ].map(({ k, label, err }) => (
                <div key={k}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={()=>set(k,!form[k])}>
                    <div className={`check-box${form[k]?" on":""}`}>{form[k]&&<span style={{ color:"#fff", fontSize:"0.7rem" }}>✓</span>}</div>
                    <span style={{ fontFamily:"var(--font-sans)", fontSize:"0.78rem", color:"var(--ink-light)" }}>{label}</span>
                  </div>
                  {err&&<div style={{ fontFamily:"var(--font-sans)", fontSize:"0.68rem", color:"var(--red)", marginTop:3, marginLeft:30 }}>⚠ {err}</div>}
                </div>
              ))}
            </div>
          </FormSection>
        </div>
      )}

      {/* Navegação */}
      <div style={{ display:"flex", gap:12, marginTop:24 }}>
        {step > 1 && (
          <button className="btn btn--ghost" onClick={prev} style={{ flex:1, padding:"13px", borderRadius:8, fontSize:"0.82rem" }}>← Anterior</button>
        )}
        {step < TOTAL ? (
          <button className="btn btn--primary" onClick={next} style={{ flex:2, padding:"13px", borderRadius:8, fontSize:"0.82rem", letterSpacing:"2px" }}>Próximo →</button>
        ) : (
          <button className="btn btn--gold" onClick={submit} disabled={submitting} style={{ flex:2, padding:"13px", borderRadius:8, fontSize:"0.82rem", letterSpacing:"2px", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {submitting && <Spinner />}
            {submitting ? "Salvando…" : "ENVIAR CADASTRO ✓"}
          </button>
        )}
      </div>
    </div>
  );
}
