import React from "react";
import { Overline } from "../components/ui/index.jsx";

const STEPS_INFO = [
  { icon:"☁️", title:"Dados salvos com segurança",  desc:"Cadastro no Firebase, acessível de qualquer dispositivo" },
  { icon:"📧", title:"Confirmação enviada",          desc:null }, // desc dinâmica com e-mail
  { icon:"👀", title:"Revisão de documentos",        desc:"Nossa equipe analisa CNPJ, documentos e endereço"       },
  { icon:"✅", title:"Aprovação e publicação",       desc:"Seu perfil vai ao ar e começa a aparecer nas buscas"    },
];

export function ReviewPage({ protocol, email, onGoToDashboard }) {
  const steps = STEPS_INFO.map((s, i) =>
    i === 1 ? { ...s, desc:`Protocolo enviado para ${email}` } : s
  );

  return (
    <div className="fade-up" style={{ maxWidth:580, margin:"0 auto", padding:"64px 24px", textAlign:"center" }}>
      <div style={{ fontSize:"4rem", marginBottom:24, animation:"popIn 0.4s ease" }}>🚀</div>

      <Overline gold style={{ marginBottom:8 }}>CADASTRO SALVO NO FIREBASE</Overline>

      <h2 style={{ fontFamily:"var(--font-serif)", fontSize:"2.5rem", fontWeight:300, margin:"16px 0 12px" }}>
        Seu negócio está quase online!
      </h2>
      <p style={{ fontFamily:"var(--font-sans)", fontSize:"0.85rem", color:"var(--ink-light)", lineHeight:1.8, marginBottom:32 }}>
        Seus dados foram salvos com segurança. Nossa equipe revisará em até{" "}
        <strong style={{ color:"var(--ink)" }}>48 horas úteis</strong> e você
        começará a aparecer nas buscas assim que aprovado.
      </p>

      {/* Timeline */}
      <div style={{ background:"var(--white)", border:"1px solid var(--border)", borderRadius:14, padding:"24px", marginBottom:24, textAlign:"left" }}>
        <Overline style={{ marginBottom:16 }}>O QUE ACONTECE AGORA</Overline>
        {steps.map((s, i) => (
          <div
            key={i}
            className="fade-up"
            style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom: i < steps.length - 1 ? 16 : 0, animationDelay:`${i * 0.08}s` }}
          >
            <div style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background:"var(--cream)", border:"1px solid var(--border)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem",
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.8rem", fontWeight:500, color:"var(--ink)" }}>{s.title}</div>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--ink-muted)", marginTop:2 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Protocolo */}
      <div style={{
        background:"var(--cream)", border:"1px solid var(--border)",
        borderRadius:10, padding:"14px", marginBottom:24,
        fontFamily:"var(--font-sans)", fontSize:"0.75rem", color:"var(--ink-light)",
      }}>
        🔒 Protocolo: <strong style={{ color:"var(--ink)", fontFamily:"monospace" }}>{protocol}</strong>
      </div>

      <button
        className="btn btn--primary"
        onClick={onGoToDashboard}
        style={{ width:"100%", padding:"14px", borderRadius:8, fontSize:"0.82rem", letterSpacing:"2px" }}
      >
        IR PARA MEU PAINEL →
      </button>
    </div>
  );
}
