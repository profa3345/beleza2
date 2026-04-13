import React, { useState } from "react";
import { uid, fmtCurrency } from "../../utils/helpers.js";
import { Overline } from "../ui/index.jsx";

const EMPTY = { name:"", brand:"", category:"", price:"", stock:"", description:"", imagePreview:"" };

export function ProductEditor({ products, setProducts, showToast }) {
  const [form, setForm]     = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("Imagem deve ter menos de 5MB", "error"); return; }
    const reader = new FileReader();
    reader.onload = ev => set("imagePreview", ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.name.trim()) { showToast("Nome do produto obrigatório", "error"); return; }
    if (editId) {
      setProducts(p => p.map(s => s.id === editId ? { ...form, id: editId } : s));
      showToast("Produto atualizado ✓", "success");
    } else {
      setProducts(p => [...p, { ...form, id: uid() }]);
      showToast("Produto adicionado ✓", "success");
    }
    setForm(EMPTY); setEditId(null);
  };

  const remove = (id) => { setProducts(p => p.filter(s => s.id !== id)); showToast("Produto removido", "info"); };
  const edit   = (s)  => { setForm(s); setEditId(s.id); };

  return (
    <div style={{ marginBottom:24 }}>
      <Overline style={{ marginBottom:12 }}>PRODUTOS</Overline>

      {products.map(p => (
        <div key={p.id} style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"10px 14px", background:"var(--white)", border:"1px solid var(--border)",
          borderRadius:8, marginBottom:8, gap:12,
        }}>
          {p.imagePreview && <img src={p.imagePreview} alt={p.name} style={{ width:40, height:40, objectFit:"cover", borderRadius:6, flexShrink:0 }} />}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.82rem", fontWeight:500, color:"var(--ink)" }}>{p.name}</div>
            <div style={{ fontFamily:"var(--font-sans)", fontSize:"0.7rem", color:"var(--ink-muted)" }}>
              {[p.brand, p.price && fmtCurrency(parseFloat(p.price)), p.stock && `Estoque: ${p.stock}`].filter(Boolean).join(" · ")}
            </div>
          </div>
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <button className="btn btn--ghost" onClick={() => edit(p)} style={{ padding:"5px 10px", borderRadius:6, fontSize:"0.7rem" }}>Editar</button>
            <button className="btn btn--ghost" onClick={() => remove(p.id)} style={{ padding:"5px 10px", borderRadius:6, fontSize:"0.7rem", color:"var(--red)" }}>✕</button>
          </div>
        </div>
      ))}

      <div style={{ background:"var(--cream)", border:"1px solid var(--border)", borderRadius:10, padding:16, marginTop:8 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <input className="inp" placeholder="Nome do produto *" value={form.name} onChange={e => set("name", e.target.value)} />
          <input className="inp" placeholder="Marca" value={form.brand} onChange={e => set("brand", e.target.value)} />
          <input className="inp" placeholder="Categoria" value={form.category} onChange={e => set("category", e.target.value)} />
          <input className="inp" placeholder="Preço (R$)" type="number" value={form.price} onChange={e => set("price", e.target.value)} />
          <input className="inp" placeholder="Estoque (unid.)" type="number" value={form.stock} onChange={e => set("stock", e.target.value)} />
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
            <input type="file" accept="image/*" onChange={handleImage} style={{ display:"none" }} />
            <div className="btn btn--ghost" style={{ padding:"9px 14px", borderRadius:8, fontSize:"0.72rem", width:"100%", textAlign:"center" }}>
              {form.imagePreview ? "✓ Imagem" : "📷 Foto"}
            </div>
          </label>
        </div>
        <input className="inp" placeholder="Descrição (opcional)" value={form.description} onChange={e => set("description", e.target.value)} style={{ marginBottom:10, width:"100%" }} />
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn--primary" onClick={save} style={{ padding:"8px 18px", borderRadius:7, fontSize:"0.78rem" }}>
            {editId ? "Salvar edição" : "+ Adicionar produto"}
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
