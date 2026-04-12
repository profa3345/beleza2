import React from "react";
import { EmptyState, Overline } from "../components/ui/index.jsx";
import { SERVICE_CATEGORIES }  from "../constants/index.js";
import { truncate }            from "../utils/index.js";

function EstablishmentCard({ r }) {
  const cat = SERVICE_CATEGORIES.find(c => c.id === r.category)?.label ?? r.category ?? "";
  return (
    <div style={{ background:"var(--white)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
      {/* Capa */}
      <div style={{ height:100, background:"var(--cream)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
        {r.coverUrl
          ? <img src={r.coverUrl} alt={r.businessName} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          : <span style={{ fontSize:"2rem" }}>💇</span>
        }
        {r.logoUrl && (
          <img src={r.logoUrl} alt="logo" style={{ position:"absolute", bottom:-20, left:16, width:40, height:40, borderRadius:10, objectFit:"cover", border:"2px solid var(--white)" }} />
        )}
      </div>
      {/* Conteúdo */}
      <div style={{ padding:"28px 16px 16px" }}>
        <div style={{ fontFamily:"var(--font-serif)", fontSize:"1rem", marginBottom:2 }}>{r.businessName}</div>
        {r.tradeName && <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--ink-muted)", marginBottom:4 }}>{r.tradeName}</div>}
        {cat && <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.68rem", color:"var(--gold)", fontWeight:500, marginBottom:6 }}>{cat}</div>}
        <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--ink-muted)", marginBottom:8 }}>
          📍 {[r.city, r.state].filter(Boolean).join("/")}
        </div>
        {r.description && (
          <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--ink-light)", lineHeight:1.5 }}>
            {truncate(r.description, 80)}
          </div>
        )}
        {r.whatsapp && (
          <a href={`https://wa.me/55${r.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
            style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:12, fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"#25D366", textDecoration:"none", fontWeight:500 }}>
            💬 WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

export function ResultsPage({ results, searchQuery, searchCategory, onBack }) {
  const catLabel = SERVICE_CATEGORIES.find(c => c.id === searchCategory)?.label ?? "";

  return (
    <div style={{ maxWidth:960, margin:"0 auto", padding:"32px 24px" }}>
      <button className="btn btn--ghost" onClick={onBack} style={{ marginBottom:20, fontSize:"0.78rem", padding:"6px 14px", borderRadius:6 }}>
        ← Voltar à busca
      </button>

      <div style={{ marginBottom:24 }}>
        <Overline style={{ marginBottom:6 }}>{results.length} RESULTADO{results.length !== 1 ? "S" : ""}</Overline>
        <h2 style={{ fontFamily:"var(--font-serif)", fontSize:"1.5rem", fontWeight:300 }}>
          {searchQuery ? `"${searchQuery}"` : catLabel || "Todos os estabelecimentos"}
        </h2>
      </div>

      {results.length === 0 ? (
        <EmptyState icon="🔍" title="Nenhum resultado" desc="Tente outros termos ou uma categoria diferente." />
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
          {results.map(r => <EstablishmentCard key={r.id} r={r} />)}
        </div>
      )}
    </div>
  );
}
