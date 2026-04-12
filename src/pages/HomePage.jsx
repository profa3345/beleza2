import React from "react";
import { SERVICE_CATEGORIES } from "../constants/index.js";
import { Spinner } from "../components/ui/index.jsx";

export function HomePage({ searchQuery, setSearchQuery, searchCategory, setSearchCategory, onSearch, searching }) {
  const handleKey = (e) => { if (e.key === "Enter") onSearch(); };

  return (
    <div style={{ minHeight:"calc(100vh - 56px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px" }}>
      {/* Hero */}
      <div style={{ textAlign:"center", marginBottom:48, maxWidth:600 }}>
        <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", letterSpacing:"3px", color:"var(--gold)", marginBottom:16, textTransform:"uppercase" }}>
          Encontre profissionais perto de você
        </div>
        <h1 style={{ fontFamily:"var(--font-serif)", fontSize:"clamp(2.2rem, 5vw, 3.5rem)", fontWeight:300, color:"var(--ink)", lineHeight:1.15, marginBottom:16 }}>
          Beleza que transforma.<br />Negócios que crescem.
        </h1>
        <p style={{ fontFamily:"var(--font-sans)", fontSize:"0.85rem", color:"var(--ink-muted)", lineHeight:1.8 }}>
          Descubra salões, clínicas de estética, barbearias e profissionais autônomos verificados.
        </p>
      </div>

      {/* Busca */}
      <div style={{ width:"100%", maxWidth:560 }}>
        <div style={{ display:"flex", gap:0, borderRadius:12, border:"1px solid var(--border)", background:"var(--white)", overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
          <input
            className="inp"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Buscar por nome, serviço ou cidade…"
            style={{ border:"none", borderRadius:0, flex:1, padding:"14px 18px", fontSize:"0.88rem" }}
          />
          <button
            onClick={onSearch}
            disabled={searching}
            style={{
              padding:"14px 24px", background:"var(--gold)", border:"none", cursor:"pointer",
              fontFamily:"var(--font-sans)", fontSize:"0.82rem", fontWeight:500, color:"#fff",
              display:"flex", alignItems:"center", gap:8, flexShrink:0,
            }}
          >
            {searching ? <Spinner /> : "Buscar"}
          </button>
        </div>

        {/* Categorias */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:14, justifyContent:"center" }}>
          {SERVICE_CATEGORIES.slice(1).map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSearchCategory(cat.id); }}
              style={{
                padding:"5px 14px", borderRadius:99, fontSize:"0.72rem", cursor:"pointer",
                background: searchCategory === cat.id ? "var(--gold)" : "var(--white)",
                color:      searchCategory === cat.id ? "#fff"        : "var(--ink-muted)",
                border:`1px solid ${searchCategory === cat.id ? "var(--gold)" : "var(--border)"}`,
                transition:"all 0.15s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
