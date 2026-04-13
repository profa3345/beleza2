import React, { useState } from "react";
import { uid, fmtCurrency } from "../../utils/helpers.js";
import { Overline } from "../ui/index.jsx";

const EMPTY = { name:"", category:"", duration:"", price:"", description:"" };

export function ServiceEditor({ services, setServices, showToast }) {
  const [form, setForm]     = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = () => {
    if (!form.name.trim()) { showToast("Nome do serviço obrigatório", "error"); return; }
    if (editId) {
      setServices(p => p.map(s => s.id === editId ? { ...form, id: editId } : s));
      showToast("Serviço atualizado ✓", "success");
    } else {
      setServices(p => [...p, { ...form, id: uid() }]);
      showToast("Serviço adicionado ✓", "success");
    }
    setForm(EMPTY); setEditId(null);
  };

  const remove = (id) => {
    setServices(p => p.filter(s => s.id !== id));
    showToast("Serviço removido", "info");
  };

  const edit = (s) => { setForm(s); setEditId(s.id); };

  return (
    <div style={{ marginBottom:24 }}>
      <Overline style={{ marginBottom:12 }}>SERVIÇOS</Overline>

      {/* Lista */}
      {services.map(s => (
        <div key={s.id} style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"10px 14px", background:"var(--white)", border:"1px solid var(--border)",
          borderRadius:8, marginBottom:8, gap:12,
        }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.82rem", fontWeight:500, color:"var(--ink)" }}>{s.name}</div>
            <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.7rem", color:"var(--ink-muted)" }}>
              {[s.category, s.duration && `${s.duration} min`, s.price && fmtCurrency(parseFloat(s.price))].filter(Boolean).join(" · ")}
            </div>
          </div>
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <button className="btn btn--ghost" onClick={() => edit(s)} style={{ padding:"5px 10px", borderRadius:6, fontSize:"0.7rem" }}>Editar</button>
            <button className="btn btn--ghost" onClick={() => remove(s.id)} style={{ padding:"5px 10px", borderRadius:6, fontSize:"0.7rem", color:"var(--red)" }}>✕</button>
          </div>
        </div>
      ))}

      {/* Formulário */}
      <div style={{ background:"var(--cream)", border:"1px solid var(--border)", borderRadius:10, padding:16, marginTop:8 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <input className="inp" placeholder="Nome do serviço *" value={form.name} onChange={e => set("name", e.target.value)} />
          <input className="inp" placeholder="Categoria" value={form.category} onChange={e => set("category", e.target.value)} />
          <input className="inp" placeholder="Duração (min)" type="number" value={form.duration} onChange={e => set("duration", e.target.value)} />
          <input className="inp" placeholder="Preço (R$)" type="number" value={form.price} onChange={e => set("price", e.target.value)} />
        </div>
        <input className="inp" placeholder="Descrição (opcional)" value={form.description} onChange={e => set("description", e.target.value)} style={{ marginBottom:10, width:"100%" }} />
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn--primary" onClick={save} style={{ padding:"8px 18px", borderRadius:7, fontSize:"0.78rem" }}>
            {editId ? "Salvar edição" : "+ Adicionar serviço"}
          </button>
          {editId && (
            <button className="btn btn--ghost" onClick={() => { setForm(EMPTY); setEditId(null); }} style={{ padding:"8px 12px", borderRadius:7, fontSize:"0.78rem" }}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
