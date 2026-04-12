import React, { useState, useEffect } from "react";
import { useRegisterPJ }   from "../hooks/useRegisterPJ.js";
import { useAutosave }     from "../hooks/useAutosave.js";
import { useCEP }          from "../hooks/useCEP.js";
import { FRAUD_RULES, STATES_BR } from "../constants/index.js";
import { fmtCNPJ, fmtPhone, fmtCEP, fmtCPF } from "../utils/helpers.js";
import {
  Field, Row2, FormSection, Hint, Spinner, DocUpload, ImageUpload, Overline,
} from "../components/ui/index.jsx";
import { ServiceEditor } from "../components/editors/ServiceEditor.jsx";
import { ProductEditor } from "../components/editors/ProductEditor.jsx";

const TOTAL_STEPS  = 5;
const STEP_LABELS  = ["Empresa", "Endereço", "Sócio", "Verificação", "Acesso"];

// ─── Score de perfil gamificado ──────────────────────────────────────────────
const PROFILE_WEIGHTS = {
  cnpjVerified:  25,
  emailVerified: 15,
  phoneVerified: 15,
  ownerDoc:      20,
  addressProof:  25,
};

function ProfileScore({ formData, step }) {
  const docScore  = Object.entries(PROFILE_WEIGHTS).reduce(
    (acc, [key, w]) => acc + (formData[key] ? w : 0), 0
  );
  const stepPct   = Math.round((step / TOTAL_STEPS) * 100);
  const total     = Math.max(docScore, stepPct);
  const isComplete = total === 100;

  const label =
    total < 40  ? "Seu negócio está nascendo 🌱" :
    total < 70  ? "Ótimo progresso! Continue assim" :
    total < 100 ? "Seu negócio está quase online 🚀" :
                  "Perfil completo! 🎉";

  return (
    <div style={{
      background:"var(--white)", border:"1px solid var(--border)",
      borderRadius:14, padding:"16px 20px", marginBottom:24,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{
          width:52, height:52, borderRadius:"50%",
          border:`3px solid ${isComplete ? "var(--green)" : "var(--gold)"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"0.85rem", fontWeight:600,
          color: isComplete ? "var(--green)" : "var(--gold)", flexShrink:0,
          transition:"border-color 0.4s, color 0.4s",
        }}>
          {total}%
        </div>
        <div style={{ flex:1 }}>
          <div style={{
            fontFamily:"var(--font-sans)", fontSize:"0.8rem",
            fontWeight:500, marginBottom:6, color:"var(--ink)",
          }}>
            {label}
          </div>
          <div className="score-bar">
            <div className="score-fill" style={{
              width:`${total}%`,
              background: isComplete
                ? "var(--green)"
                : "linear-gradient(90deg,var(--gold),var(--gold-light))",
              transition:"width 0.5s ease",
            }} />
          </div>
          {isComplete && (
            <div className="fade-up" style={{
              fontFamily:"var(--font-sans)", fontSize:"0.68rem",
              color:"var(--green)", marginTop:4,
            }}>
              ✓ Você vai ganhar destaque nas buscas!
            </div>
          )}
          {!isComplete && (
            <div style={{
              fontFamily:"var(--font-sans)", fontSize:"0.68rem",
              color:"var(--ink-muted)", marginTop:4,
            }}>
              Complete o perfil para ganhar destaque nas buscas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Barra de etapas ─────────────────────────────────────────────────────────
function ProgressBar({ step, goToStep }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--ink-muted)" }}>
          Etapa {step} de {TOTAL_STEPS}
        </span>
        <span style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--gold)" }}>
          {Math.round((step / TOTAL_STEPS) * 100)}% das etapas
        </span>
      </div>
      <div className="score-bar" style={{ marginBottom:10, height:4 }}>
        <div className="score-fill" style={{
          width:`${(step / TOTAL_STEPS) * 100}%`,
          background:"linear-gradient(90deg,var(--gold),var(--gold-light))",
          transition:"width 0.4s ease",
        }} />
      </div>
      <div style={{ display:"flex", gap:4 }}>
        {STEP_LABELS.map((label, i) => {
          const n = i + 1, done = n < step, active = n === step;
          return (
            <div
              key={n}
              className="step-pill"
              style={{
                flex:1, textAlign:"center",
                cursor: done ? "pointer" : "default",
                background: active ? "var(--gold)" : done ? "#C9A96E15" : "var(--cream-mid)",
                color:      active ? "#fff"        : done ? "var(--gold)" : "#B0A898",
                border:`1px solid ${active ? "var(--gold)" : done ? "#C9A96E40" : "transparent"}`,
                transition:"all 0.2s",
              }}
              onClick={() => goToStep(n)}
            >
              {done ? "✓" : n} {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Etapa 1 ─────────────────────────────────────────────────────────────────
function Step1({ pj }) {
  const [cnpjAnim, setCnpjAnim] = useState(null); // "success" | "error" | null

  useEffect(() => {
    if (pj.formData.cnpjVerified) {
      setCnpjAnim("success");
      const t = setTimeout(() => setCnpjAnim(null), 2500);
      return () => clearTimeout(t);
    }
  }, [pj.formData.cnpjVerified]);

  useEffect(() => {
    if (pj.cnpjError) {
      setCnpjAnim("error");
      const t = setTimeout(() => setCnpjAnim(null), 2500);
      return () => clearTimeout(t);
    }
  }, [pj.cnpjError]);

  return (
    <div className="form-card slide-in">
      <FormSection title="Dados da empresa" icon="🏢">
        <Field label="Nome / Razão Social *" error={pj.errors.businessName}>
          <input className={`inp${pj.errors.businessName ? " err" : ""}`}
            value={pj.formData.businessName} onChange={e => pj.set("businessName", e.target.value)}
            placeholder="Nome oficial da empresa" />
        </Field>
        <Field label="Nome Fantasia">
          <input className="inp" value={pj.formData.tradeName}
            onChange={e => pj.set("tradeName", e.target.value)}
            placeholder="Como aparece para os clientes" />
        </Field>

        {/* CNPJ + verificação com microinteração */}
        <Field label="CNPJ *" error={pj.errors.cnpj || pj.errors.cnpjVerified}>
          <div style={{ display:"flex", gap:8 }}>
            <input
              className={`inp${(pj.errors.cnpj || pj.errors.cnpjVerified) ? " err" : ""}`}
              style={{
                transition:"box-shadow 0.3s",
                boxShadow:
                  cnpjAnim === "success" ? "0 0 0 3px #5BAA5B40" :
                  cnpjAnim === "error"   ? "0 0 0 3px #E5534B40" : "none",
              }}
              value={pj.formData.cnpj}
              onChange={e => pj.set("cnpj", fmtCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00" maxLength={18}
            />
            <button
              className="btn btn--primary"
              onClick={pj.verifyCNPJ}
              disabled={pj.verifyingCNPJ}
              style={{
                padding:"11px 18px", borderRadius:8, fontSize:"0.75rem", whiteSpace:"nowrap",
                transition:"all 0.3s",
                transform: cnpjAnim === "success" ? "scale(1.05)" : "scale(1)",
                background: pj.formData.cnpjVerified ? "var(--green)" : undefined,
              }}
            >
              {pj.verifyingCNPJ ? <Spinner /> : pj.formData.cnpjVerified ? "✓ Verificado" : "Verificar"}
            </button>
          </div>
          {pj.cnpjError && (
            <div className="fade-up" style={{ fontFamily:"var(--font-sans)", fontSize:"0.68rem", color:"var(--red)", marginTop:4 }}>
              ⚠ {pj.cnpjError}
            </div>
          )}
          {cnpjAnim === "success" && pj.cnpjData && (
            <Hint ok className="fade-up">
              ✓ {pj.cnpjData.razao_social} — CNPJ ativo na Receita Federal
            </Hint>
          )}
          {pj.formData.cnpjVerified && !cnpjAnim && pj.cnpjData && (
            <Hint ok>✓ {pj.cnpjData.razao_social} — CNPJ ativo na Receita Federal</Hint>
          )}
        </Field>

        <Row2>
          <Field label="E-mail *" error={pj.errors.email}>
            <input className={`inp${pj.errors.email ? " err" : ""}`}
              value={pj.formData.email} onChange={e => pj.set("email", e.target.value)}
              placeholder="contato@empresa.com" type="email" />
          </Field>
          <Field label="Telefone *" error={pj.errors.phone}>
            <input className={`inp${pj.errors.phone ? " err" : ""}`}
              value={pj.formData.phone} onChange={e => pj.set("phone", fmtPhone(e.target.value))}
              placeholder="(00) 00000-0000" maxLength={15} />
          </Field>
        </Row2>
        <Row2>
          <Field label="WhatsApp">
            <input className="inp" value={pj.formData.whatsapp}
              onChange={e => pj.set("whatsapp", fmtPhone(e.target.value))}
              placeholder="(00) 00000-0000" maxLength={15} />
          </Field>
          <Field label="Instagram">
            <input className="inp" value={pj.formData.instagram}
              onChange={e => pj.set("instagram", e.target.value)}
              placeholder="@seuSalao" />
          </Field>
        </Row2>
        <Field label="Descrição do negócio">
          <textarea className="inp" rows={3} value={pj.formData.description}
            onChange={e => pj.set("description", e.target.value)}
            placeholder="Fale sobre seus serviços, diferenciais..." style={{ resize:"vertical" }} />
        </Field>
        <Row2>
          <Field label="Logo">
            <ImageUpload preview={pj.logoPreview} onChange={e => pj.handleImageUpload(e, pj.setLogoPreview)} label="Clique para adicionar logo" />
          </Field>
          <Field label="Capa">
            <ImageUpload preview={pj.coverPreview} onChange={e => pj.handleImageUpload(e, pj.setCoverPreview)} label="Clique para adicionar capa" />
          </Field>
        </Row2>
      </FormSection>
    </div>
  );
}

// ─── Etapa 2 ─────────────────────────────────────────────────────────────────
function Step2({ pj }) {
  return (
    <div className="form-card slide-in">
      <FormSection title="Endereço" icon="📍">
        <Field label="CEP *" error={pj.errors.cep}>
          <input className={`inp${pj.errors.cep ? " err" : ""}`}
            value={pj.formData.cep} onChange={e => pj.set("cep", fmtCEP(e.target.value))}
            placeholder="00000-000" maxLength={9} />
        </Field>
        <Field label="Rua *" error={pj.errors.street}>
          <input className={`inp${pj.errors.street ? " err" : ""}`}
            value={pj.formData.street} onChange={e => pj.set("street", e.target.value)}
            placeholder="Rua, Avenida..." />
        </Field>
        <Row2>
          <Field label="Número *" error={pj.errors.number}>
            <input className={`inp${pj.errors.number ? " err" : ""}`}
              value={pj.formData.number} onChange={e => pj.set("number", e.target.value)}
              placeholder="123" />
          </Field>
          <Field label="Complemento">
            <input className="inp" value={pj.formData.complement}
              onChange={e => pj.set("complement", e.target.value)}
              placeholder="Sala, Andar..." />
          </Field>
        </Row2>
        <Row2>
          <Field label="Bairro">
            <input className="inp" value={pj.formData.neighborhood}
              onChange={e => pj.set("neighborhood", e.target.value)} />
          </Field>
          <Field label="Cidade *" error={pj.errors.city}>
            <input className={`inp${pj.errors.city ? " err" : ""}`}
              value={pj.formData.city} onChange={e => pj.set("city", e.target.value)} />
          </Field>
        </Row2>
        <Field label="Estado *" error={pj.errors.state}>
          <select className={`inp${pj.errors.state ? " err" : ""}`}
            value={pj.formData.state} onChange={e => pj.set("state", e.target.value)}>
            <option value="">Selecione</option>
            {STATES_BR.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </FormSection>
    </div>
  );
}

// ─── Etapa 3 ─────────────────────────────────────────────────────────────────
function Step3({ pj }) {
  return (
    <div className="form-card slide-in">
      <FormSection title="Dados do responsável" icon="👤">
        <Field label="Nome completo *" error={pj.errors.ownerName}>
          <input className={`inp${pj.errors.ownerName ? " err" : ""}`}
            value={pj.formData.ownerName} onChange={e => pj.set("ownerName", e.target.value)}
            placeholder="Nome do sócio / responsável" />
        </Field>
        <Row2>
          <Field label="CPF" error={pj.errors.ownerCPF}>
            <input className={`inp${pj.errors.ownerCPF ? " err" : ""}`}
              value={pj.formData.ownerCPF} onChange={e => pj.set("ownerCPF", fmtCPF(e.target.value))}
              placeholder="000.000.000-00" maxLength={14} />
          </Field>
          <Field label="Telefone">
            <input className="inp" value={pj.formData.ownerPhone}
              onChange={e => pj.set("ownerPhone", fmtPhone(e.target.value))}
              placeholder="(00) 00000-0000" maxLength={15} />
          </Field>
        </Row2>
        <Field label="E-mail do responsável *" error={pj.errors.ownerEmail}>
          <input className={`inp${pj.errors.ownerEmail ? " err" : ""}`}
            value={pj.formData.ownerEmail} onChange={e => pj.set("ownerEmail", e.target.value)}
            placeholder="responsavel@empresa.com" type="email" />
        </Field>
        <Field label="Documento (RG / CNH)">
          <DocUpload
            file={pj.formData.ownerDoc}
            onChange={e => { const f = e.target.files[0]; if (f) pj.set("ownerDoc", f); }}
            label="Clique para enviar RG ou CNH"
          />
        </Field>
        <Field label="Comprovante de endereço">
          <DocUpload
            file={pj.formData.addressProof}
            onChange={e => { const f = e.target.files[0]; if (f) pj.set("addressProof", f); }}
            label="Conta de luz, água, etc."
          />
        </Field>
      </FormSection>
    </div>
  );
}

// ─── OTP Block ───────────────────────────────────────────────────────────────
function OTPBlock({ type, verified, email, phone, sendingCode, formData, set, sendVerification, checkCode, errors }) {
  const isEmail  = type === "email";
  const value    = isEmail ? formData.emailCode : formData.phoneCode;
  const fieldKey = isEmail ? "emailCode" : "phoneCode";
  const errKey   = isEmail ? "emailVerified" : "phoneVerified";
  const icon     = isEmail ? "📧" : "📱";
  const title    = isEmail ? "Verificar e-mail" : "Verificar telefone";
  const target   = isEmail ? email : phone;
  const btnLabel = isEmail ? "Enviar código" : "Enviar SMS";

  return (
    <div className="form-card">
      <FormSection title={title} icon={icon}>
        <Hint ok={verified}>
          {verified ? `✓ ${isEmail ? "E-mail" : "Telefone"} confirmado!` : `Código para ${target}`}
        </Hint>
        {!verified && (
          <>
            <button className="btn btn--primary" onClick={() => sendVerification(type)} disabled={sendingCode}
              style={{ padding:"10px 20px", borderRadius:8, fontSize:"0.78rem" }}>
              {sendingCode ? "Enviando..." : btnLabel}
            </button>
            <Row2>
              <Field label="Código" error={errors[errKey]}>
                <input className="inp" value={value}
                  onChange={e => set(fieldKey, e.target.value)}
                  placeholder="000000" maxLength={6} />
              </Field>
              <div style={{ display:"flex", alignItems:"flex-end" }}>
                <button className="btn btn--primary" onClick={() => checkCode(type)}
                  style={{ width:"100%", padding:"11px", borderRadius:8, fontSize:"0.78rem" }}>
                  Verificar
                </button>
              </div>
            </Row2>
          </>
        )}
      </FormSection>
    </div>
  );
}

// ─── Etapa 4 ─────────────────────────────────────────────────────────────────
function Step4({ pj }) {
  return (
    <div className="slide-in" style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <OTPBlock type="email" verified={pj.formData.emailVerified}
        email={pj.formData.email} phone={pj.formData.phone}
        sendingCode={pj.sendingCode} formData={pj.formData}
        set={pj.set} sendVerification={pj.sendVerification}
        checkCode={pj.checkCode} errors={pj.errors} />
      <OTPBlock type="phone" verified={pj.formData.phoneVerified}
        email={pj.formData.email} phone={pj.formData.phone}
        sendingCode={pj.sendingCode} formData={pj.formData}
        set={pj.set} sendVerification={pj.sendVerification}
        checkCode={pj.checkCode} errors={pj.errors} />
    </div>
  );
}

// ─── Etapa 5 ─────────────────────────────────────────────────────────────────
function Step5({ pj }) {
  return (
    <div className="slide-in" style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div className="form-card">
        <FormSection title="Criar senha" icon="🔐">
          <Field label="Senha *" error={pj.errors.password}>
            <div className="pass-wrap">
              <input
                className={`inp${pj.errors.password ? " err" : ""}`}
                type={pj.showPass ? "text" : "password"}
                value={pj.formData.password}
                onChange={e => pj.set("password", e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
              <span className="pass-eye" onClick={() => pj.setShowPass(p => !p)}>
                {pj.showPass ? "🙈" : "👁"}
              </span>
            </div>
            {pj.formData.password && (
              <>
                <div className="score-bar" style={{ marginTop:6 }}>
                  <div className="score-fill" style={{ width:`${pj.pwStrength.score}%`, background:pj.pwStrength.color }} />
                </div>
                <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.68rem", color:pj.pwStrength.color, marginTop:3 }}>
                  {pj.pwStrength.label}
                </div>
              </>
            )}
          </Field>
          <Field label="Confirmar senha *" error={pj.errors.confirmPassword}>
            <div className="pass-wrap">
              <input
                className={`inp${pj.errors.confirmPassword ? " err" : ""}`}
                type={pj.showConfirmPass ? "text" : "password"}
                value={pj.formData.confirmPassword}
                onChange={e => pj.set("confirmPassword", e.target.value)}
                placeholder="Repita a senha"
              />
              <span className="pass-eye" onClick={() => pj.setShowConfirmPass(p => !p)}>
                {pj.showConfirmPass ? "🙈" : "👁"}
              </span>
            </div>
          </Field>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
            {[
              { k:"acceptTerms",     label:"Li e aceito os Termos de Uso",          err:pj.errors.acceptTerms     },
              { k:"acceptPrivacy",   label:"Li e aceito a Política de Privacidade", err:pj.errors.acceptPrivacy   },
              { k:"acceptAntiFraud", label:"Aceito os termos antifraude",           err:pj.errors.acceptAntiFraud },
            ].map(({ k, label, err }) => (
              <div key={k}>
                <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
                  onClick={() => pj.set(k, !pj.formData[k])}>
                  <div className={`check-box${pj.formData[k] ? " on" : ""}`}>
                    {pj.formData[k] && <span style={{ color:"#fff", fontSize:"0.7rem" }}>✓</span>}
                  </div>
                  <span style={{ fontFamily:"var(--font-sans)", fontSize:"0.78rem", color:"var(--ink-light)" }}>{label}</span>
                </div>
                {err && <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.68rem", color:"var(--red)", marginTop:3, marginLeft:30 }}>⚠ {err}</div>}
              </div>
            ))}
          </div>
        </FormSection>
      </div>

      <div className="form-card">
        <Overline style={{ marginBottom:12 }}>VERIFICAÇÕES DE SEGURANÇA</Overline>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:12 }}>
          {FRAUD_RULES.map(t => {
            const done =
              t.id === "cnpj"  ? pj.formData.cnpjVerified  :
              t.id === "tel"   ? pj.formData.phoneVerified  :
              t.id === "email" ? pj.formData.emailVerified  :
              t.id === "doc"   ? !!pj.formData.ownerDoc     :
              t.id === "addr"  ? !!pj.formData.addressProof : false;
            return (
              <div key={t.id} style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:8,
                background: done ? "#5BAA5B08" : "var(--cream)",
                border:`1px solid ${done ? "#5BAA5B30" : "var(--border)"}`,
                transition:"all 0.3s",
              }}>
                <div style={{
                  width:24, height:24, borderRadius:6, flexShrink:0,
                  background: done ? "var(--green)" : "var(--border-mid)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"background 0.3s",
                }}>
                  <span style={{ color:"#fff", fontSize:"0.7rem" }}>{done ? "✓" : "○"}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.78rem", color: done ? "var(--green)" : "var(--ink)", lineHeight:1.5 }}>{t.label}</div>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.65rem", color:"var(--ink-muted)" }}>{t.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export function RegisterPJPage({
  authUser, accountType,
  services, setServices,
  products, setProducts,
  showToast, initialData, onSuccess,
}) {
  const pj = useRegisterPJ({ authUser, services, products, showToast, onSuccess, initialData });

  useAutosave(authUser?.uid, pj.formData);
  useCEP(pj.formData.cep, pj.set, showToast);

  const needsServices = accountType === "salao"      || accountType === "ambos";
  const needsProducts = accountType === "fornecedor" || accountType === "ambos";

  return (
    <div className="slide-in" style={{ maxWidth:640, margin:"0 auto", padding:"32px 24px" }}>
      {/* Score gamificado */}
      <ProfileScore formData={pj.formData} step={pj.step} />

      {/* Barra de etapas */}
      <ProgressBar step={pj.step} goToStep={pj.goToStep} />

      {pj.step === 1 && <Step1 pj={pj} />}
      {pj.step === 2 && <Step2 pj={pj} />}
      {pj.step === 3 && <Step3 pj={pj} />}
      {pj.step === 4 && <Step4 pj={pj} />}
      {pj.step === 5 && <Step5 pj={pj} />}

      {/* Catálogo pré-cadastro */}
      {pj.step === 5 && (needsServices || needsProducts) && (
        <div style={{ marginTop:40 }} className="fade-up">
          <Overline style={{ textAlign:"center", marginBottom:20 }}>PRÉ-CADASTRO DE CATÁLOGO (OPCIONAL)</Overline>
          {needsServices && <ServiceEditor services={services} setServices={setServices} showToast={showToast} />}
          {needsProducts && <ProductEditor products={products} setProducts={setProducts} showToast={showToast} />}
        </div>
      )}

      {/* Navegação */}
      <div style={{ display:"flex", gap:12, marginTop:24 }}>
        {pj.step > 1 && (
          <button className="btn btn--ghost" onClick={pj.prevStep}
            style={{ flex:1, padding:"13px", borderRadius:8, fontSize:"0.82rem" }}>
            ← Anterior
          </button>
        )}
        {pj.step < TOTAL_STEPS ? (
          <button className="btn btn--primary" onClick={pj.nextStep}
            style={{ flex:2, padding:"13px", borderRadius:8, fontSize:"0.82rem", letterSpacing:"2px", fontWeight:500 }}>
            Próximo →
          </button>
        ) : (
          <button
            className="btn btn--gold"
            onClick={pj.handleSubmit}
            disabled={pj.isSubmitting}
            style={{ flex:2, padding:"13px", borderRadius:8, fontSize:"0.82rem", letterSpacing:"2px", fontWeight:500, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
          >
            {pj.isSubmitting && <Spinner />}
            {pj.isSubmitting ? "Salvando no Firebase..." : "ENVIAR CADASTRO ✓"}
          </button>
        )}
      </div>
    </div>
  );
}
