import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth }    from "../../firebase.js";

export function Navbar({ onHome, onAdmin, onRegister, authUser, isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try { await signOut(auth); } catch { /* silencia */ }
  };

  return (
    <nav style={{
      position:"sticky", top:0, zIndex:100,
      background:"var(--white)", borderBottom:"1px solid var(--border)",
      padding:"0 24px", height:56,
      display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      {/* Logo */}
      <button
        onClick={onHome}
        style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}
      >
        <span style={{ fontFamily:"var(--font-serif)", fontSize:"1.3rem", color:"var(--ink)", letterSpacing:"-0.5px" }}>
          beleza<span style={{ color:"var(--gold)" }}>.hub</span>
        </span>
      </button>

      {/* Ações */}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {isAdmin && (
          <button className="btn btn--ghost" onClick={onAdmin}
            style={{ padding:"6px 14px", borderRadius:6, fontSize:"0.75rem" }}>
            ⚙ Admin
          </button>
        )}
        {authUser ? (
          <>
            <span style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--ink-muted)" }}>
              {authUser.email}
            </span>
            <button className="btn btn--ghost" onClick={handleSignOut}
              style={{ padding:"6px 12px", borderRadius:6, fontSize:"0.72rem" }}>
              Sair
            </button>
          </>
        ) : (
          <button className="btn btn--gold" onClick={onRegister}
            style={{ padding:"7px 18px", borderRadius:6, fontSize:"0.75rem", fontWeight:500 }}>
            Cadastrar negócio
          </button>
        )}
      </div>
    </nav>
  );
}
