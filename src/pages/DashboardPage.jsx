import React, { useState, useEffect } from "react";
import { getEstablishment }    from "../services/firestore.js";
import { ServiceEditor }       from "../components/editors/ServiceEditor.jsx";
import { ProductEditor }       from "../components/editors/ProductEditor.jsx";
import { Overline, EmptyState, Spinner } from "../components/ui/index.jsx";
import { fmtDate }             from "../utils/index.js";

const STATUS_INFO = {
  pending:  { label:"Em análise",  color:"#854F0B", bg:"#FAEEDA", icon:"⏳" },
  active:   { label:"Ativo",       color:"#3B6D11", bg:"#EAF3DE", icon:"✅" },
  rejected: { label:"Reprovado",   color:"#A32D2D", bg:"#FCEBEB", icon:"❌" },
};

export function DashboardPage({ authUser, accountType, services, setServices, products, setProducts, showToast }) {
  const [estab,   setEstab]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("overview");

  useEffect(() => {
    if (!authUser?.uid) return;
    getEstablishment(authUser.uid)
      .then(setEstab)
      .catch(() => showToast("Erro ao carregar dados", "error"))
      .finally(() => setLoading(false));
  }, [authUser]);

  if (loading) return <div style={{ textAlign:"center", padding:"80px" }}><Spinner /></div>;

  if (!estab) return <EmptyState icon="🏢" title="Nenhum cadastro encontrado" desc="Complete seu cadastro para ver o painel." />;

  const status = STATUS_INFO[estab.status] ?? STATUS_INFO.pending;
  const needsServices = accountType === "salao"      || accountType === "ambos";
  const needsProducts = accountType === "fornecedor" || accountType === "ambos";

  const TABS = [
    { id:"overview",  label:"Visão geral" },
    ...(needsServices ? [{ id:"services", label:"Serviços" }] : []),
    ...(needsProducts ? [{ id:"products", label:"Produtos"  }] : []),
  ];

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"32px 24px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:32 }}>
        <div style={{ width:56, height:56, borderRadius:14, background:"var(--cream)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", flexShrink:0 }}>
          {estab.logoUrl ? <img src={estab.logoUrl} alt="logo" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:12 }} /> : "💇"}
        </div>
        <div style={{ flex:1 }}>
          <h2 style={{ fontFamily:"var(--font-serif)", fontSize:"1.5rem", fontWeight:300, marginBottom:4 }}>{estab.businessName}</h2>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ background:status.bg, color:status.color, fontSize:"0.65rem", fontWeight:600, padding:"3px 10px", borderRadius:99, fontFamily:"var(--font-sans)" }}>
              {status.icon} {status.label}
            </span>
            {estab.protocol && (
              <span style={{ fontFamily:"var(--font-sans)", fontSize:"0.68rem", color:"var(--ink-muted)" }}>
                #{estab.protocol}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status banner */}
      {estab.status === "pending" && (
        <div className="fade-up" style={{ background:"#FAEEDA", border:"1px solid #FAC775", borderRadius:10, padding:"12px 16px", marginBottom:24, fontFamily:"var(--font-sans)", fontSize:"0.8rem", color:"#854F0B" }}>
          ⏳ Seu cadastro está em análise. Nossa equipe revisará em até 48 horas úteis.
        </div>
      )}
      {estab.status === "rejected" && (
        <div className="fade-up" style={{ background:"#FCEBEB", border:"1px solid #F7C1C1", borderRadius:10, padding:"12px 16px", marginBottom:24, fontFamily:"var(--font-sans)", fontSize:"0.8rem", color:"#A32D2D" }}>
          ❌ Cadastro reprovado. {estab.rejectReason ? `Motivo: ${estab.rejectReason}` : "Entre em contato para mais informações."}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, borderBottom:"1px solid var(--border)", marginBottom:24 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"8px 16px", border:"none", background:"transparent", cursor:"pointer",
            fontFamily:"var(--font-sans)", fontSize:"0.78rem",
            color:      tab === t.id ? "var(--ink)"      : "var(--ink-muted)",
            borderBottom:`2px solid ${tab === t.id ? "var(--gold)" : "transparent"}`,
            transition:"all 0.2s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Visão geral */}
      {tab === "overview" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            ["E-mail",       estab.email],
            ["Telefone",     estab.phone],
            ["WhatsApp",     estab.whatsapp || "—"],
            ["Instagram",    estab.instagram || "—"],
            ["CNPJ",         estab.cnpj],
            ["Cidade",       `${estab.city}/${estab.state}`],
            ["Endereço",     [estab.street, estab.number, estab.complement].filter(Boolean).join(", ")],
            ["Cadastrado em",fmtDate(estab.createdAt)],
          ].map(([k, v]) => (
            <div key={k} style={{ background:"var(--cream)", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.65rem", color:"var(--ink-muted)", marginBottom:4, letterSpacing:"0.5px", textTransform:"uppercase" }}>{k}</div>
              <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.82rem", color:"var(--ink)", wordBreak:"break-word" }}>{v || "—"}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Serviços */}
      {tab === "services" && (
        <ServiceEditor services={services} setServices={setServices} showToast={showToast} />
      )}

      {/* Tab: Produtos */}
      {tab === "products" && (
        <ProductEditor products={products} setProducts={setProducts} showToast={showToast} />
      )}
    </div>
  );
}
