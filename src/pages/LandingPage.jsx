import React from "react";
import { PLAN_TYPES } from "../constants/index.js";
import { Overline } from "../components/ui/index.jsx";

const BENEFITS = [
  { icon:"🔍", label:"Visibilidade", desc:"Apareça nas buscas de clientes da região" },
  { icon:"✅", label:"Verificado",   desc:"Selo de estabelecimento verificado pelo beleza.hub" },
  { icon:"📊", label:"Dashboard",    desc:"Gerencie serviços, produtos e avaliações" },
  { icon:"🚀", label:"Gratuito",     desc:"Cadastro 100% gratuito — sem taxas ocultas" },
];

export function LandingPage({ onStart }) {
  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"64px 24px" }}>
      {/* Hero */}
      <div className="fade-up" style={{ textAlign:"center", marginBottom:56 }}>
        <Overline gold style={{ marginBottom:12 }}>PARA NEGÓCIOS DE BELEZA</Overline>
        <h1 style={{ fontFamily:"var(--font-serif)", fontSize:"clamp(2rem,5vw,3rem)", fontWeight:300, color:"var(--ink)", lineHeight:1.2, marginBottom:16 }}>
          Coloque seu negócio<br />no mapa da beleza
        </h1>
        <p style={{ fontFamily:"var(--font-sans)", fontSize:"0.88rem", color:"var(--ink-muted)", lineHeight:1.8, maxWidth:480, margin:"0 auto 32px" }}>
          Cadastre seu salão, clínica ou distribuidora e comece a receber clientes que estão buscando exatamente o que você oferece.
        </p>
        <button
          className="btn btn--gold"
          onClick={onStart}
          style={{ padding:"14px 36px", borderRadius:10, fontSize:"0.88rem", fontWeight:500, letterSpacing:"1.5px" }}
        >
          COMEÇAR AGORA →
        </button>
      </div>

      {/* Benefits */}
      <div className="fade-up" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:48 }}>
        {BENEFITS.map(b => (
          <div key={b.label} style={{ background:"var(--white)", border:"1px solid var(--border)", borderRadius:14, padding:"20px" }}>
            <div style={{ fontSize:"1.5rem", marginBottom:10 }}>{b.icon}</div>
            <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.82rem", fontWeight:500, color:"var(--ink)", marginBottom:4 }}>{b.label}</div>
            <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.75rem", color:"var(--ink-muted)", lineHeight:1.5 }}>{b.desc}</div>
          </div>
        ))}
      </div>

      {/* Planos */}
      <div className="fade-up">
        <Overline style={{ textAlign:"center", marginBottom:20 }}>TIPOS DE CADASTRO</Overline>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {PLAN_TYPES.map(t => (
            <div
              key={t.id}
              onClick={onStart}
              className="hov"
              style={{ background:"var(--white)", border:`2px solid var(--border)`, borderRadius:14, padding:"18px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:16, transition:"border-color 0.2s" }}
            >
              <div style={{ width:48, height:48, borderRadius:12, background:`${t.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", flexShrink:0 }}>
                {t.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--font-serif)", fontSize:"1rem", marginBottom:2 }}>{t.label}</div>
                <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.75rem", color:"var(--ink-muted)" }}>{t.desc}</div>
              </div>
              {t.badge && (
                <div style={{ background:`${t.color}15`, color:t.color, fontSize:"0.62rem", fontWeight:600, padding:"3px 10px", borderRadius:99, letterSpacing:"0.5px", whiteSpace:"nowrap" }}>
                  {t.badge}
                </div>
              )}
              <div style={{ color:"var(--gold)", fontSize:"1rem" }}>→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
