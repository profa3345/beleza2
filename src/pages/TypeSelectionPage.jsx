import React, { useState } from "react";
import { REG_TYPES, PLAN_TYPES } from "../../constants/index.js";
import { FormPF } from "../components/forms/FormPF.jsx";

/**
 * TypeSelectionPage
 *
 * Fluxo:
 *   1. Usuário escolhe PJ ou PF  → regType
 *   2a. PJ: escolhe o tipo de plano → accountType → onContinuePJ(accountType)
 *   2b. PF: renderiza FormPF inline → onSuccess()
 */
export function TypeSelectionPage({
  accountType,
  onSelectAccountType,
  onContinuePJ,
  onSuccessPF,
  showToast,
}) {
  const [regType, setRegType] = useState(null);

  // ── Step 1: escolha PJ / PF
  if (!regType) {
    return (
      <div className="slide-in" style={{ maxWidth:720, margin:"0 auto", padding:"48px 24px" }}>
        <h2 style={{ fontFamily:"var(--font-serif)", fontSize:"2.2rem", fontWeight:300, marginBottom:8, textAlign:"center" }}>
          Como você atua?
        </h2>
        <p style={{ fontFamily:"var(--font-sans)", fontSize:"0.82rem", color:"var(--ink-muted)", textAlign:"center", marginBottom:40 }}>
          Isso define o tipo de cadastro e as verificações necessárias
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {REG_TYPES.map(t => (
            <div
              key={t.id}
              onClick={() => setRegType(t.id)}
              className="hov"
              style={{
                background:"var(--white)", borderRadius:14, padding:"24px",
                border:`2px solid ${t.color}`, cursor:"pointer",
                display:"flex", alignItems:"center", gap:20,
              }}
            >
              <div style={{
                width:56, height:56, borderRadius:12, flexShrink:0,
                background:`${t.color}15`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem",
              }}>
                {t.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--font-serif)", fontSize:"1.3rem", marginBottom:4, color:"var(--ink)" }}>{t.label}</div>
                <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.78rem", color:"var(--ink-light)" }}>{t.desc}</div>
              </div>
              <div style={{ fontSize:"1.2rem", color:t.color }}>→</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Step 2b: PF — formulário completo
  if (regType === "pf") {
    return (
      <div className="slide-in" style={{ maxWidth:720, margin:"0 auto" }}>
        <button
          className="btn"
          onClick={() => setRegType(null)}
          style={{ fontFamily:"var(--font-sans)", fontSize:"0.75rem", color:"var(--ink-muted)", background:"transparent", padding:"24px 24px 0" }}
        >
          ← Voltar
        </button>
        <FormPF
          showToast={showToast}
          onSuccess={onSuccessPF}
        />
      </div>
    );
  }

  // ── Step 2a: PJ — seleção de plano
  return (
    <div className="slide-in" style={{ maxWidth:720, margin:"0 auto", padding:"48px 24px" }}>
      <button
        className="btn"
        onClick={() => setRegType(null)}
        style={{ fontFamily:"var(--font-sans)", fontSize:"0.75rem", color:"var(--ink-muted)", background:"transparent", marginBottom:24 }}
      >
        ← Voltar
      </button>

      <h2 style={{ fontFamily:"var(--font-serif)", fontSize:"2.2rem", fontWeight:300, marginBottom:8, textAlign:"center" }}>
        Qual é o seu tipo de negócio?
      </h2>
      <p style={{ fontFamily:"var(--font-sans)", fontSize:"0.82rem", color:"var(--ink-muted)", textAlign:"center", marginBottom:40 }}>
        Isso define quais seções você vai preencher no cadastro
      </p>

      <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:32 }}>
        {PLAN_TYPES.map(t => (
          <div
            key={t.id}
            onClick={() => onSelectAccountType(t.id)}
            className={`plan-card${t.id === "ambos" ? " plan-card--ambos" : ""}${accountType === t.id ? " selected" : ""}`}
            style={{
              border:`2px solid ${accountType === t.id ? t.color : "var(--border)"}`,
              boxShadow: accountType === t.id ? `0 0 0 4px ${t.color}18` : "none",
            }}
          >
            {t.badge && <div className="plan-card__badge">{t.badge}</div>}
            <div className="plan-card__icon" style={{ background:`${t.color}15` }}>{t.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"var(--font-serif)", fontSize:"1.2rem", marginBottom:4 }}>{t.label}</div>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.78rem", color:"var(--ink-light)" }}>{t.desc}</div>
            </div>
            <div
              className="plan-card__radio"
              style={{
                border:`2px solid ${accountType === t.id ? t.color : "var(--border-mid)"}`,
                background: accountType === t.id ? t.color : "transparent",
              }}
            >
              {accountType === t.id && <div className="plan-card__radio-dot" />}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:12 }}>
        <button
          className="btn btn--ghost"
          onClick={() => setRegType(null)}
          style={{ flex:1, padding:"13px", borderRadius:8, fontSize:"0.82rem" }}
        >
          ← Voltar
        </button>
        <button
          className="btn btn--primary"
          disabled={!accountType}
          onClick={() => { if (accountType) onContinuePJ(); }}
          style={{ flex:2, padding:"13px", borderRadius:8, fontSize:"0.82rem", letterSpacing:"1px" }}
        >
          CONTINUAR →
        </button>
      </div>
    </div>
  );
}
