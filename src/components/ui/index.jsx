import React, { useEffect } from "react";

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ toast }) {
  if (!toast) return null;
  const colors = {
    success: { bg:"#EAF3DE", border:"#C0DD97", color:"#3B6D11" },
    error:   { bg:"#FCEBEB", border:"#F7C1C1", color:"#A32D2D" },
    info:    { bg:"#E6F1FB", border:"#B5D4F4", color:"#185FA5" },
  };
  const c = colors[toast.type] ?? colors.info;
  return (
    <div
      key={toast.id}
      className="fade-up"
      style={{
        position:"fixed", bottom:24, right:24, zIndex:9999,
        padding:"12px 18px", borderRadius:10,
        background:c.bg, border:`1px solid ${c.border}`, color:c.color,
        fontFamily:"var(--font-sans)", fontSize:"0.82rem", fontWeight:500,
        maxWidth:340, boxShadow:"0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      {toast.message}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, error, children, style }) {
  return (
    <div style={{ marginBottom:14, ...style }}>
      {label && (
        <label style={{ display:"block", fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--ink-muted)", marginBottom:5, letterSpacing:"0.5px" }}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.68rem", color:"var(--red)", marginTop:4 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

// ─── Hint ─────────────────────────────────────────────────────────────────────
export function Hint({ children, ok }) {
  return (
    <div style={{
      fontFamily:"var(--font-sans)", fontSize:"0.72rem", marginTop:6,
      padding:"8px 12px", borderRadius:8,
      background: ok ? "#5BAA5B10" : "var(--cream)",
      border:`1px solid ${ok ? "#5BAA5B30" : "var(--border)"}`,
      color: ok ? "var(--green)" : "var(--ink-muted)",
    }}>
      {children}
    </div>
  );
}

// ─── FormSection ─────────────────────────────────────────────────────────────
export function FormSection({ title, icon, children }) {
  return (
    <div>
      {(title || icon) && (
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          {icon && (
            <div style={{ width:36, height:36, borderRadius:10, background:"var(--cream)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem" }}>
              {icon}
            </div>
          )}
          {title && (
            <h3 style={{ fontFamily:"var(--font-serif)", fontSize:"1.1rem", fontWeight:400, color:"var(--ink)", margin:0 }}>
              {title}
            </h3>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Row2 ─────────────────────────────────────────────────────────────────────
export function Row2({ children }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
      {children}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ children }) {
  return (
    <h2 style={{ fontFamily:"var(--font-serif)", fontSize:"1.8rem", fontWeight:300, color:"var(--ink)", margin:"0 0 8px" }}>
      {children}
    </h2>
  );
}

// ─── Overline ─────────────────────────────────────────────────────────────────
export function Overline({ children, gold, style }) {
  return (
    <div style={{
      fontFamily:"var(--font-sans)", fontSize:"0.65rem", letterSpacing:"2.5px",
      textTransform:"uppercase", fontWeight:600,
      color: gold ? "var(--gold)" : "var(--ink-muted)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = "🔍", title, desc }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 24px" }}>
      <div style={{ fontSize:"2.5rem", marginBottom:16 }}>{icon}</div>
      {title && <div style={{ fontFamily:"var(--font-serif)", fontSize:"1.2rem", marginBottom:8 }}>{title}</div>}
      {desc  && <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.8rem", color:"var(--ink-muted)" }}>{desc}</div>}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <span style={{ display:"inline-block", width:14, height:14, border:"2px solid currentColor", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
  );
}

// ─── PageLoader ───────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cream)" }}>
      <div style={{ textAlign:"center" }}>
        <Spinner />
        <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.75rem", color:"var(--ink-muted)", marginTop:12 }}>Carregando…</div>
      </div>
    </div>
  );
}

// ─── ImageUpload ──────────────────────────────────────────────────────────────
export function ImageUpload({ preview, onChange, label }) {
  return (
    <label style={{ display:"block", cursor:"pointer" }}>
      <input type="file" accept="image/*" onChange={onChange} style={{ display:"none" }} />
      <div style={{
        border:"2px dashed var(--border)", borderRadius:10, overflow:"hidden",
        minHeight:90, display:"flex", alignItems:"center", justifyContent:"center",
        background:"var(--cream)", transition:"border-color 0.2s",
      }}>
        {preview
          ? <img src={preview} alt="preview" style={{ width:"100%", height:90, objectFit:"cover" }} />
          : <span style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--ink-muted)", padding:12, textAlign:"center" }}>{label}</span>
        }
      </div>
    </label>
  );
}

// ─── DocUpload ────────────────────────────────────────────────────────────────
export function DocUpload({ file, onChange, label }) {
  return (
    <label style={{ display:"block", cursor:"pointer" }}>
      <input type="file" accept="image/*,application/pdf" onChange={onChange} style={{ display:"none" }} />
      <div style={{
        border:"2px dashed var(--border)", borderRadius:10,
        padding:"14px 16px", background:"var(--cream)",
        display:"flex", alignItems:"center", gap:10, transition:"border-color 0.2s",
      }}>
        <span style={{ fontSize:"1.2rem" }}>{file ? "📎" : "📄"}</span>
        <span style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color: file ? "var(--ink)" : "var(--ink-muted)" }}>
          {file ? (file.name ?? "Arquivo selecionado") : label}
        </span>
      </div>
    </label>
  );
}
