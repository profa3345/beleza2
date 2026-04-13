import React, { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { fetchAdminRecords }           from "../../services/firestore.js";
import { Overline, EmptyState, Spinner } from "../ui/index.jsx";
import { fmtDate }                     from "../../utils/helpers.js";

const functions      = getFunctions(undefined, "southamerica-east1");
const reviewFn       = httpsCallable(functions, "reviewEstablishment");

const STATUS_LABELS = {
  pending:  { label:"Pendente",  color:"#854F0B", bg:"#FAEEDA" },
  active:   { label:"Ativo",     color:"#3B6D11", bg:"#EAF3DE" },
  rejected: { label:"Rejeitado", color:"#A32D2D", bg:"#FCEBEB" },
};

export function AdminPanel({ isAdmin, authUser, showToast }) {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter,  setFilter]    = useState("pending");
  const [selected, setSelected] = useState(null);
  const [reason,  setReason]    = useState("");
  const [acting,  setActing]    = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    fetchAdminRecords(filter)
      .then(setRecords)
      .catch(() => showToast("Erro ao carregar registros", "error"))
      .finally(() => setLoading(false));
  }, [filter, isAdmin]);

  const act = async (uid, action) => {
    setActing(true);
    try {
      await reviewFn({ uid, action, reason });
      showToast(`${action === "approve" ? "Aprovado" : "Rejeitado"} ✓`, "success");
      setRecords(p => p.filter(r => r.id !== uid));
      setSelected(null); setReason("");
    } catch {
      showToast("Erro ao processar. Tente novamente.", "error");
    } finally {
      setActing(false);
    }
  };

  if (!isAdmin) {
    return <EmptyState icon="🔒" title="Acesso restrito" desc="Apenas administradores podem acessar este painel." />;
  }

  return (
    <div style={{ maxWidth:860, margin:"0 auto", padding:"32px 24px" }}>
      <Overline gold style={{ marginBottom:8 }}>PAINEL ADMIN</Overline>
      <h2 style={{ fontFamily:"var(--font-serif)", fontSize:"2rem", fontWeight:300, marginBottom:24 }}>
        Revisão de cadastros
      </h2>

      {/* Filtro de status */}
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            style={{
              padding:"6px 16px", borderRadius:99, fontSize:"0.75rem", fontWeight:500, cursor:"pointer",
              background: filter === k ? v.bg : "var(--cream)",
              color:      filter === k ? v.color : "var(--ink-muted)",
              border:`1px solid ${filter === k ? v.color + "40" : "var(--border)"}`,
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"48px" }}><Spinner /></div>
      ) : records.length === 0 ? (
        <EmptyState icon="✅" title="Nenhum registro" desc={`Sem cadastros ${STATUS_LABELS[filter].label.toLowerCase()}s.`} />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {records.map(r => {
            const s = STATUS_LABELS[r.status] ?? STATUS_LABELS.pending;
            const open = selected === r.id;
            return (
              <div key={r.id} style={{ background:"var(--white)", border:`1px solid ${open ? "var(--gold)" : "var(--border)"}`, borderRadius:12, overflow:"hidden", transition:"border-color 0.2s" }}>
                {/* Header */}
                <div
                  style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}
                  onClick={() => setSelected(open ? null : r.id)}
                >
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"var(--font-serif)", fontSize:"1rem", color:"var(--ink)" }}>{r.businessName}</div>
                    <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.72rem", color:"var(--ink-muted)", marginTop:2 }}>
                      {r.cnpj} · {r.city}/{r.state} · {fmtDate(r.createdAt)}
                    </div>
                  </div>
                  <div style={{ background:s.bg, color:s.color, fontSize:"0.65rem", fontWeight:600, padding:"3px 10px", borderRadius:99, fontFamily:"var(--font-sans)", letterSpacing:"0.5px" }}>
                    {s.label.toUpperCase()}
                  </div>
                  <div style={{ color:"var(--ink-muted)", fontSize:"0.8rem" }}>{open ? "▲" : "▼"}</div>
                </div>

                {/* Detalhe */}
                {open && (
                  <div style={{ borderTop:"1px solid var(--border)", padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontFamily:"var(--font-sans)", fontSize:"0.78rem" }}>
                      {[
                        ["E-mail",      r.email],
                        ["Telefone",    r.phone],
                        ["Responsável", r.ownerName],
                        ["Protocolo",   r.protocol],
                        ["CNPJ verificado", r.cnpjVerified ? "✓ Sim" : "✗ Não"],
                        ["E-mail verificado", r.emailVerified ? "✓ Sim" : "✗ Não"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ color:"var(--ink-muted)", fontSize:"0.65rem", marginBottom:2 }}>{k}</div>
                          <div style={{ color:"var(--ink)" }}>{v || "—"}</div>
                        </div>
                      ))}
                    </div>
                    {filter === "pending" && (
                      <>
                        <textarea
                          className="inp" rows={2} placeholder="Motivo da rejeição (opcional)"
                          value={reason} onChange={e => setReason(e.target.value)}
                          style={{ resize:"none" }}
                        />
                        <div style={{ display:"flex", gap:10 }}>
                          <button className="btn btn--primary" onClick={() => act(r.id, "approve")} disabled={acting} style={{ flex:1, padding:"10px", borderRadius:8, fontSize:"0.78rem", background:"var(--green)" }}>
                            {acting ? <Spinner /> : "✓ Aprovar"}
                          </button>
                          <button className="btn btn--ghost" onClick={() => act(r.id, "reject")} disabled={acting} style={{ flex:1, padding:"10px", borderRadius:8, fontSize:"0.78rem", color:"var(--red)" }}>
                            {acting ? <Spinner /> : "✕ Rejeitar"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
