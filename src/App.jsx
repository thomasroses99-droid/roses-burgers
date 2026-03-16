import { useState, useEffect, useCallback } from "react";

// ===================== STORAGE =====================
async function load(key, fallback) {
try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : fallback; }
catch { return fallback; }
}
async function save(key, value) {
try { await window.storage.set(key, JSON.stringify(value)); } catch {}
}
function usePersisted(key, initial) {
const [value, setValue] = useState(null);
const [ready, setReady] = useState(false);
useEffect(() => { load(key, initial).then(v => { setValue(v); setReady(true); }); }, []);
const set = useCallback((v) => {
setValue(prev => { const next = typeof v === “function” ? v(prev) : v; save(key, next); return next; });
}, [key]);
return [value, set, ready];
}

// ===================== INITIAL DATA =====================
const initialInsumos = [
{ id: 1, nombre: “Carne picada”, unidad: “kg”, precio_unidad: 4000, categoria: “Carnes” },
{ id: 2, nombre: “Pan brioche”, unidad: “unidad”, precio_unidad: 250, categoria: “Panificados” },
{ id: 3, nombre: “Queso cheddar”, unidad: “kg”, precio_unidad: 3200, categoria: “Lácteos” },
{ id: 4, nombre: “Bacon”, unidad: “kg”, precio_unidad: 5500, categoria: “Carnes” },
{ id: 5, nombre: “Lechuga”, unidad: “kg”, precio_unidad: 800, categoria: “Verduras” },
{ id: 6, nombre: “Tomate”, unidad: “kg”, precio_unidad: 900, categoria: “Verduras” },
{ id: 7, nombre: “Cebolla”, unidad: “kg”, precio_unidad: 500, categoria: “Verduras” },
{ id: 8, nombre: “Pepinillos”, unidad: “kg”, precio_unidad: 1800, categoria: “Varios” },
{ id: 9, nombre: “Mayonesa”, unidad: “kg”, precio_unidad: 1200, categoria: “Salsas base” },
{ id: 10, nombre: “Ketchup”, unidad: “kg”, precio_unidad: 900, categoria: “Salsas base” },
{ id: 11, nombre: “Mostaza”, unidad: “kg”, precio_unidad: 850, categoria: “Salsas base” },
{ id: 12, nombre: “Ajo”, unidad: “kg”, precio_unidad: 2000, categoria: “Verduras” },
{ id: 13, nombre: “Pimentón ahumado”, unidad: “kg”, precio_unidad: 3500, categoria: “Especias” },
{ id: 14, nombre: “Salsa BBQ industrial”, unidad: “kg”, precio_unidad: 1100, categoria: “Salsas base” },
];

const initialSalsas = [
{
id: 1, nombre: “Salsa especial”, rendimiento_porciones: 20,
ingredientes: [
{ insumo_id: 9, cantidad: 0.5 },
{ insumo_id: 10, cantidad: 0.15 },
{ insumo_id: 11, cantidad: 0.05 },
{ insumo_id: 12, cantidad: 0.02 },
]
},
{
id: 2, nombre: “BBQ casera”, rendimiento_porciones: 15,
ingredientes: [
{ insumo_id: 14, cantidad: 0.3 },
{ insumo_id: 10, cantidad: 0.1 },
{ insumo_id: 13, cantidad: 0.01 },
]
},
];

const initialBurgers = [
{
id: 1, nombre: “Classic Smash”, precio_venta: 3500,
ingredientes: [
{ tipo: “insumo”, ref_id: 1, nombre: “Carne picada”, cantidad: 0.2, unidad: “kg”, merma_pct: 15 },
{ tipo: “insumo”, ref_id: 2, nombre: “Pan brioche”, cantidad: 1, unidad: “unidad”, merma_pct: 0 },
{ tipo: “insumo”, ref_id: 3, nombre: “Queso cheddar”, cantidad: 0.04, unidad: “kg”, merma_pct: 5 },
{ tipo: “insumo”, ref_id: 5, nombre: “Lechuga”, cantidad: 0.03, unidad: “kg”, merma_pct: 20 },
{ tipo: “insumo”, ref_id: 6, nombre: “Tomate”, cantidad: 0.05, unidad: “kg”, merma_pct: 15 },
{ tipo: “insumo”, ref_id: 7, nombre: “Cebolla”, cantidad: 0.04, unidad: “kg”, merma_pct: 10 },
{ tipo: “salsa”, ref_id: 1, nombre: “Salsa especial”, cantidad: 1, unidad: “porcion”, merma_pct: 0 },
]
},
{
id: 2, nombre: “Double Bacon”, precio_venta: 4800,
ingredientes: [
{ tipo: “insumo”, ref_id: 1, nombre: “Carne picada”, cantidad: 0.4, unidad: “kg”, merma_pct: 15 },
{ tipo: “insumo”, ref_id: 2, nombre: “Pan brioche”, cantidad: 1, unidad: “unidad”, merma_pct: 0 },
{ tipo: “insumo”, ref_id: 3, nombre: “Queso cheddar”, cantidad: 0.06, unidad: “kg”, merma_pct: 5 },
{ tipo: “insumo”, ref_id: 4, nombre: “Bacon”, cantidad: 0.06, unidad: “kg”, merma_pct: 10 },
{ tipo: “insumo”, ref_id: 8, nombre: “Pepinillos”, cantidad: 0.03, unidad: “kg”, merma_pct: 5 },
{ tipo: “salsa”, ref_id: 2, nombre: “BBQ casera”, cantidad: 1, unidad: “porcion”, merma_pct: 0 },
]
},
];

const initialCostosFijos = [
{ id: 1, nombre: “Alquiler local”, monto: 120000, categoria: “Inmueble” },
{ id: 2, nombre: “Luz”, monto: 35000, categoria: “Servicios” },
{ id: 3, nombre: “Gas”, monto: 18000, categoria: “Servicios” },
{ id: 4, nombre: “Internet”, monto: 8000, categoria: “Servicios” },
{ id: 5, nombre: “Sueldo empleado”, monto: 180000, categoria: “Personal” },
{ id: 6, nombre: “Seguro”, monto: 15000, categoria: “Seguros” },
];

// ===================== HELPERS =====================
const diasDelMes = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
const hoy = new Date().getDate();
const mesActual = new Date().toLocaleString(“es-AR”, { month: “long”, year: “numeric” });
const fmt = (n) => new Intl.NumberFormat(“es-AR”, { style: “currency”, currency: “ARS”, maximumFractionDigits: 0 }).format(n ?? 0);
const fmt2 = (n) => new Intl.NumberFormat(“es-AR”, { style: “currency”, currency: “ARS”, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n ?? 0);
const pct = (n) => `${Math.round(n ?? 0)}%`;

function calcCostoSalsa(salsa, insumos) {
if (!salsa || !insumos) return 0;
const costoTotal = salsa.ingredientes.reduce((s, ing) => {
const ins = insumos.find(i => i.id === ing.insumo_id);
return s + (ins ? ins.precio_unidad * ing.cantidad : 0);
}, 0);
return salsa.rendimiento_porciones > 0 ? costoTotal / salsa.rendimiento_porciones : 0;
}

function calcCostoIngBurger(ing, insumos, salsas) {
let costoBase = 0;
if (ing.tipo === “insumo”) {
const ins = insumos.find(i => i.id === ing.ref_id);
costoBase = ins ? ins.precio_unidad * ing.cantidad : 0;
} else {
const salsa = salsas.find(s => s.id === ing.ref_id);
costoBase = calcCostoSalsa(salsa, insumos) * ing.cantidad;
}
return costoBase * (1 + (ing.merma_pct || 0) / 100);
}

function calcCostoBurger(burger, insumos, salsas) {
if (!burger) return 0;
return burger.ingredientes.reduce((s, ing) => s + calcCostoIngBurger(ing, insumos, salsas), 0);
}

const CATS_INSUMO = [“Carnes”, “Panificados”, “Lácteos”, “Verduras”, “Salsas base”, “Especias”, “Varios”];
const CATS_CF = [“Inmueble”, “Servicios”, “Personal”, “Seguros”, “Impuestos”, “Otro”];
const UNIDADES = [“kg”, “gr”, “unidad”, “litro”, “ml”, “porcion”];

// ===================== UI =====================
function TabBtn({ active, onClick, children, icon }) {
return (
<button onClick={onClick} style={{
background: active ? “#E8FF47” : “transparent”, color: active ? “#1a1a1a” : “#666”,
border: “none”, padding: “8px 13px”, borderRadius: “7px”,
fontFamily: “‘DM Mono’, monospace”, fontWeight: active ? “700” : “400”,
fontSize: “11px”, letterSpacing: “0.05em”, textTransform: “uppercase”,
cursor: “pointer”, display: “flex”, alignItems: “center”, gap: “5px”,
transition: “all 0.12s”, whiteSpace: “nowrap”,
}}>
<span style={{ fontSize: “13px” }}>{icon}</span>{children}
</button>
);
}

const Card = ({ children, style = {} }) => (

<div style={{ background: "#1a1a1a", border: "1px solid #252525", borderRadius: "11px", padding: "18px", ...style }}>{children}</div>
);

function StatBox({ label, value, sub, accent, warn }) {
const c = accent ? “#E8FF47” : warn ? “#FF6B35” : “#fff”;
return (
<div style={{ background: accent ? “#E8FF4708” : warn ? “#FF6B3508” : “#141414”, border: `1px solid ${accent ? "#E8FF4725" : warn ? "#FF6B3525" : "#222"}`, borderRadius: “9px”, padding: “13px 16px” }}>
<div style={{ color: “#444”, fontSize: “10px”, letterSpacing: “0.1em”, textTransform: “uppercase”, fontFamily: “‘DM Mono’, monospace”, marginBottom: “4px” }}>{label}</div>
<div style={{ color: c, fontSize: “19px”, fontWeight: “700”, fontFamily: “‘DM Mono’, monospace” }}>{value}</div>
{sub && <div style={{ color: “#383838”, fontSize: “10px”, marginTop: “2px” }}>{sub}</div>}
</div>
);
}

const IS = { background: “#111”, border: “1px solid #222”, borderRadius: “6px”, color: “#ddd”, padding: “7px 9px”, fontFamily: “‘DM Mono’, monospace”, fontSize: “12px”, outline: “none”, boxSizing: “border-box” };
const Btn = ({ onClick, children, style = {}, variant = “primary” }) => (
<button onClick={onClick} style={{ background: variant === “primary” ? “#E8FF47” : “#222”, color: variant === “primary” ? “#1a1a1a” : “#777”, border: “none”, borderRadius: “6px”, padding: “7px 13px”, cursor: “pointer”, fontFamily: “‘DM Mono’, monospace”, fontSize: “11px”, fontWeight: variant === “primary” ? “700” : “400”, …style }}>{children}</button>
);
const X = ({ onClick }) => <button onClick={onClick} style={{ background: “none”, border: “none”, color: “#2d1a1a”, cursor: “pointer”, fontSize: “15px”, padding: “2px 5px”, lineHeight: 1 }}>✕</button>;
const H = ({ title, children }) => (

<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "13px" }}>
<span style={{ color: "#ccc", fontSize: "13px", fontWeight: "700", fontFamily: "'DM Mono', monospace" }}>{title}</span>
<div style={{ display: "flex", gap: "7px" }}>{children}</div>
</div>
);

// ===================== INSUMOS =====================
function InsumosTab({ insumos, setInsumos }) {
const [form, setForm] = useState({ nombre: “”, unidad: “kg”, precio_unidad: “”, categoria: “Carnes” });
const bycat = CATS_INSUMO.map(cat => ({ cat, items: insumos.filter(i => i.categoria === cat) })).filter(g => g.items.length > 0);
const add = () => { if (!form.nombre || !form.precio_unidad) return; setInsumos([…insumos, { id: Date.now(), …form, precio_unidad: Number(form.precio_unidad) }]); setForm({ …form, nombre: “”, precio_unidad: “” }); };
const upd = (id, f, v) => setInsumos(insumos.map(i => i.id !== id ? i : { …i, [f]: f === “precio_unidad” ? Number(v) : v }));
const del = (id) => setInsumos(insumos.filter(i => i.id !== id));
return (
<div style={{ display: “flex”, flexDirection: “column”, gap: “12px” }}>
<Card>
<H title="Agregar insumo" />
<div style={{ display: “flex”, gap: “7px”, flexWrap: “wrap” }}>
<input placeholder=“Nombre del insumo” value={form.nombre} onChange={e => setForm({ …form, nombre: e.target.value })} style={{ …IS, flex: “1 1 150px” }} />
<select value={form.categoria} onChange={e => setForm({ …form, categoria: e.target.value })} style={{ …IS }}>{CATS_INSUMO.map(c => <option key={c}>{c}</option>)}</select>
<select value={form.unidad} onChange={e => setForm({ …form, unidad: e.target.value })} style={{ …IS, width: “85px” }}>{UNIDADES.map(u => <option key={u}>{u}</option>)}</select>
<input type=“number” placeholder=“Precio / unidad $” value={form.precio_unidad} onChange={e => setForm({ …form, precio_unidad: e.target.value })} style={{ …IS, width: “150px” }} />
<Btn onClick={add}>+ Agregar</Btn>
</div>
</Card>
{bycat.map(({ cat, items }) => (
<Card key={cat}>
<div style={{ marginBottom: “10px”, color: “#383838”, fontSize: “10px”, letterSpacing: “0.12em”, textTransform: “uppercase”, fontFamily: “‘DM Mono’, monospace” }}>{cat}</div>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 85px 1fr auto”, gap: “7px”, padding: “3px 0 8px”, borderBottom: “1px solid #1e1e1e” }}>
{[“Insumo”, “Unidad”, “Precio por unidad”, “”].map((h, i) => <div key={i} style={{ color: “#2a2a2a”, fontSize: “10px”, fontFamily: “‘DM Mono’, monospace”, textTransform: “uppercase” }}>{h}</div>)}
</div>
{items.map(ins => (
<div key={ins.id} style={{ display: “grid”, gridTemplateColumns: “1fr 85px 1fr auto”, gap: “7px”, alignItems: “center”, padding: “6px 0”, borderBottom: “1px solid #161616” }}>
<input value={ins.nombre} onChange={e => upd(ins.id, “nombre”, e.target.value)} style={{ …IS, fontSize: “12px” }} />
<select value={ins.unidad} onChange={e => upd(ins.id, “unidad”, e.target.value)} style={{ …IS, fontSize: “11px” }}>{UNIDADES.map(u => <option key={u}>{u}</option>)}</select>
<div style={{ display: “flex”, alignItems: “center”, gap: “4px” }}>
<span style={{ color: “#333”, fontSize: “12px” }}>$</span>
<input type=“number” value={ins.precio_unidad} onChange={e => upd(ins.id, “precio_unidad”, e.target.value)} style={{ …IS, flex: 1, color: “#E8FF47”, fontWeight: “700”, fontSize: “13px” }} />
<span style={{ color: “#333”, fontSize: “10px” }}>/ {ins.unidad}</span>
</div>
<X onClick={() => del(ins.id)} />
</div>
))}
</Card>
))}
</div>
);
}

// ===================== SALSAS =====================
function SalsasTab({ salsas, setSalsas, insumos }) {
const [sel, setSel] = useState(0);
const [showNew, setShowNew] = useState(false);
const [nf, setNf] = useState({ nombre: “”, rendimiento_porciones: 10 });
const [ni, setNi] = useState({ insumo_id: insumos[0]?.id || “”, cantidad: “” });

const salsa = salsas[sel];
const costoPorcion = salsa ? calcCostoSalsa(salsa, insumos) : 0;
const costoReceta = salsa ? salsa.ingredientes.reduce((s, ing) => { const ins = insumos.find(i => i.id === ing.insumo_id); return s + (ins ? ins.precio_unidad * ing.cantidad : 0); }, 0) : 0;

const addS = () => { if (!nf.nombre) return; setSalsas([…salsas, { id: Date.now(), nombre: nf.nombre, rendimiento_porciones: Number(nf.rendimiento_porciones) || 10, ingredientes: [] }]); setSel(salsas.length); setShowNew(false); setNf({ nombre: “”, rendimiento_porciones: 10 }); };
const delS = (i) => { if (salsas.length <= 1) return; setSalsas(salsas.filter((*, ii) => ii !== i)); setSel(Math.max(0, i - 1)); };
const updS = (f, v) => setSalsas(salsas.map((s, i) => i !== sel ? s : { …s, [f]: f === “rendimiento_porciones” ? Number(v) : v }));
const addI = () => { if (!ni.insumo_id || !ni.cantidad) return; setSalsas(salsas.map((s, i) => i !== sel ? s : { …s, ingredientes: […s.ingredientes, { insumo_id: Number(ni.insumo_id), cantidad: Number(ni.cantidad) }] })); setNi({ insumo_id: insumos[0]?.id || “”, cantidad: “” }); };
const delI = (idx) => setSalsas(salsas.map((s, i) => i !== sel ? s : { …s, ingredientes: s.ingredientes.filter((*, ii) => ii !== idx) }));
const updI = (idx, f, v) => setSalsas(salsas.map((s, i) => i !== sel ? s : { …s, ingredientes: s.ingredientes.map((ing, ii) => ii !== idx ? ing : { …ing, [f]: Number(v) }) }));

return (
<div style={{ display: “flex”, gap: “14px” }}>
<div style={{ width: “190px”, flexShrink: 0 }}>
<div style={{ color: “#333”, fontSize: “10px”, fontFamily: “‘DM Mono’, monospace”, textTransform: “uppercase”, marginBottom: “7px”, letterSpacing: “0.1em” }}>Salsas</div>
{salsas.map((s, i) => (
<div key={s.id} style={{ display: “flex”, gap: “4px”, marginBottom: “4px” }}>
<button onClick={() => setSel(i)} style={{ flex: 1, background: sel === i ? “#E8FF47” : “#1a1a1a”, color: sel === i ? “#1a1a1a” : “#aaa”, border: `1px solid ${sel === i ? "#E8FF47" : "#222"}`, borderRadius: “7px”, padding: “8px 11px”, textAlign: “left”, cursor: “pointer”, fontFamily: “‘DM Mono’, monospace”, fontSize: “11px”, fontWeight: sel === i ? “700” : “400” }}>🧪 {s.nombre}</button>
{salsas.length > 1 && <X onClick={() => delS(i)} />}
</div>
))}
{showNew ? (
<Card style={{ padding: “11px”, marginTop: “5px” }}>
<input placeholder=“Nombre” value={nf.nombre} onChange={e => setNf({ …nf, nombre: e.target.value })} style={{ …IS, width: “100%”, marginBottom: “5px” }} />
<input type=“number” placeholder=“Porciones que rinde” value={nf.rendimiento_porciones} onChange={e => setNf({ …nf, rendimiento_porciones: e.target.value })} style={{ …IS, width: “100%”, marginBottom: “7px” }} />
<div style={{ display: “flex”, gap: “5px” }}><Btn onClick={addS} style={{ flex: 1 }}>Crear</Btn><Btn onClick={() => setShowNew(false)} variant=“ghost” style={{ flex: 1 }}>✕</Btn></div>
</Card>
) : (
<button onClick={() => setShowNew(true)} style={{ width: “100%”, background: “transparent”, color: “#333”, border: “1px dashed #222”, borderRadius: “7px”, padding: “8px”, cursor: “pointer”, fontFamily: “‘DM Mono’, monospace”, fontSize: “10px”, marginTop: “4px” }}>+ Nueva salsa</button>
)}
</div>

```
{salsa && (
<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "11px" }}>
<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "9px" }}>
<StatBox label="Costo total receta" value={fmt(costoReceta)} />
<StatBox label="Porciones que rinde" value={salsa.rendimiento_porciones} />
<StatBox label="Costo por porción" value={fmt2(costoPorcion)} accent />
</div>
<Card>
<div style={{ display: "flex", gap: "11px" }}>
<div style={{ flex: 1 }}><div style={{ color: "#333", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>NOMBRE</div><input value={salsa.nombre} onChange={e => updS("nombre", e.target.value)} style={{ ...IS, width: "100%" }} /></div>
<div style={{ width: "150px" }}><div style={{ color: "#333", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>PORCIONES QUE RINDE</div><input type="number" value={salsa.rendimiento_porciones} onChange={e => updS("rendimiento_porciones", e.target.value)} style={{ ...IS, width: "100%" }} /></div>
</div>
</Card>
<Card>
<H title="Ingredientes de la salsa" />
<div style={{ display: "grid", gridTemplateColumns: "1fr 70px 80px 80px auto", gap: "7px", padding: "3px 0 7px", borderBottom: "1px solid #1e1e1e" }}>
{["Insumo", "Unidad", "Cantidad", "Costo", ""].map((h, i) => <div key={i} style={{ color: "#2a2a2a", fontSize: "10px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{h}</div>)}
</div>
{salsa.ingredientes.map((ing, idx) => {
const ins = insumos.find(i => i.id === ing.insumo_id);
return (
<div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 70px 80px 80px auto", gap: "7px", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #161616" }}>
<select value={ing.insumo_id} onChange={e => updI(idx, "insumo_id", e.target.value)} style={{ ...IS, fontSize: "11px" }}>{insumos.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}</select>
<span style={{ color: "#444", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{ins?.unidad || "-"}</span>
<input type="number" step="0.001" value={ing.cantidad} onChange={e => updI(idx, "cantidad", e.target.value)} style={{ ...IS, fontSize: "12px" }} />
<span style={{ color: "#E8FF47", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>{fmt2(ins ? ins.precio_unidad * ing.cantidad : 0)}</span>
<X onClick={() => delI(idx)} />
</div>
);
})}
<div style={{ display: "flex", gap: "7px", marginTop: "9px", padding: "9px", background: "#111", borderRadius: "7px" }}>
<select value={ni.insumo_id} onChange={e => setNi({ ...ni, insumo_id: e.target.value })} style={{ ...IS, flex: 1 }}>{insumos.map(i => <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>)}</select>
<input type="number" step="0.001" placeholder="Cantidad" value={ni.cantidad} onChange={e => setNi({ ...ni, cantidad: e.target.value })} style={{ ...IS, width: "95px" }} />
<Btn onClick={addI}>+ Agregar</Btn>
</div>
<div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0 0", marginTop: "5px", borderTop: "2px solid #222" }}>
<span style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "11px" }}>TOTAL RECETA</span>
<span style={{ color: "#FF6B35", fontFamily: "'DM Mono', monospace", fontSize: "14px", fontWeight: "700" }}>{fmt(costoReceta)}</span>
</div>
</Card>
</div>
)}
</div>
```

);
}

// ===================== HAMBURGUESAS =====================
function BurgersTab({ burgers, setBurgers, insumos, salsas }) {
const [sel, setSel] = useState(0);
const [showNew, setShowNew] = useState(false);
const [nf, setNf] = useState({ nombre: “”, precio_venta: “” });
const [ni, setNi] = useState({ tipo: “insumo”, ref_id: insumos[0]?.id || “”, cantidad: “”, merma_pct: 0 });

const burger = burgers[sel];
const costoTotal = burger ? calcCostoBurger(burger, insumos, salsas) : 0;
const margen = burger ? burger.precio_venta - costoTotal : 0;
const pctM = burger && burger.precio_venta > 0 ? (margen / burger.precio_venta) * 100 : 0;
const pctC = burger && burger.precio_venta > 0 ? (costoTotal / burger.precio_venta) * 100 : 0;

const addB = () => { if (!nf.nombre) return; setBurgers([…burgers, { id: Date.now(), nombre: nf.nombre, precio_venta: Number(nf.precio_venta) || 0, ingredientes: [] }]); setSel(burgers.length); setShowNew(false); setNf({ nombre: “”, precio_venta: “” }); };
const delB = (i) => { if (burgers.length <= 1) return; setBurgers(burgers.filter((*, ii) => ii !== i)); setSel(Math.max(0, i - 1)); };
const updB = (f, v) => setBurgers(burgers.map((b, i) => i !== sel ? b : { …b, [f]: f === “precio_venta” ? Number(v) : v }));
const refs = () => ni.tipo === “insumo” ? insumos : salsas;
const refNombre = (tipo, id) => (tipo === “insumo” ? insumos : salsas).find(x => x.id === Number(id))?.nombre || “?”;
const refUnidad = (tipo, id) => tipo === “insumo” ? (insumos.find(x => x.id === Number(id))?.unidad || “”) : “porcion”;
const addI = () => {
if (!ni.ref_id || !ni.cantidad) return;
const rid = Number(ni.ref_id);
setBurgers(burgers.map((b, i) => i !== sel ? b : { …b, ingredientes: […b.ingredientes, { tipo: ni.tipo, ref_id: rid, nombre: refNombre(ni.tipo, rid), cantidad: Number(ni.cantidad), unidad: refUnidad(ni.tipo, rid), merma_pct: Number(ni.merma_pct) || 0 }] }));
setNi({ tipo: “insumo”, ref_id: insumos[0]?.id || “”, cantidad: “”, merma_pct: 0 });
};
const delI = (idx) => setBurgers(burgers.map((b, i) => i !== sel ? b : { …b, ingredientes: b.ingredientes.filter((*, ii) => ii !== idx) }));
const updI = (idx, f, v) => setBurgers(burgers.map((b, i) => i !== sel ? b : { …b, ingredientes: b.ingredientes.map((ing, ii) => ii !== idx ? ing : { …ing, [f]: [“cantidad”, “merma_pct”].includes(f) ? Number(v) : v }) }));

return (
<div style={{ display: “flex”, gap: “14px” }}>
<div style={{ width: “190px”, flexShrink: 0 }}>
<div style={{ color: “#333”, fontSize: “10px”, fontFamily: “‘DM Mono’, monospace”, textTransform: “uppercase”, marginBottom: “7px”, letterSpacing: “0.1em” }}>Hamburguesas</div>
{burgers.map((b, i) => (
<div key={b.id} style={{ display: “flex”, gap: “4px”, marginBottom: “4px” }}>
<button onClick={() => setSel(i)} style={{ flex: 1, background: sel === i ? “#E8FF47” : “#1a1a1a”, color: sel === i ? “#1a1a1a” : “#aaa”, border: `1px solid ${sel === i ? "#E8FF47" : "#222"}`, borderRadius: “7px”, padding: “8px 11px”, textAlign: “left”, cursor: “pointer”, fontFamily: “‘DM Mono’, monospace”, fontSize: “11px”, fontWeight: sel === i ? “700” : “400” }}>🍔 {b.nombre}</button>
{burgers.length > 1 && <X onClick={() => delB(i)} />}
</div>
))}
{showNew ? (
<Card style={{ padding: “11px”, marginTop: “5px” }}>
<input placeholder=“Nombre” value={nf.nombre} onChange={e => setNf({ …nf, nombre: e.target.value })} style={{ …IS, width: “100%”, marginBottom: “5px” }} />
<input type=“number” placeholder=“Precio de venta $” value={nf.precio_venta} onChange={e => setNf({ …nf, precio_venta: e.target.value })} style={{ …IS, width: “100%”, marginBottom: “7px” }} />
<div style={{ display: “flex”, gap: “5px” }}><Btn onClick={addB} style={{ flex: 1 }}>Crear</Btn><Btn onClick={() => setShowNew(false)} variant=“ghost” style={{ flex: 1 }}>✕</Btn></div>
</Card>
) : (
<button onClick={() => setShowNew(true)} style={{ width: “100%”, background: “transparent”, color: “#333”, border: “1px dashed #222”, borderRadius: “7px”, padding: “8px”, cursor: “pointer”, fontFamily: “‘DM Mono’, monospace”, fontSize: “10px”, marginTop: “4px” }}>+ Nueva hamburguesa</button>
)}
</div>

```
{burger && (
<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "11px" }}>
<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "9px" }}>
<StatBox label="Costo total" value={fmt(costoTotal)} />
<StatBox label="Precio de venta" value={fmt(burger.precio_venta)} />
<StatBox label="Margen bruto" value={fmt(margen)} accent={margen > 0} warn={margen <= 0} />
<StatBox label="% Margen" value={pct(pctM)} sub={`${pct(pctC)} es costo`} accent={pctM > 40} warn={pctM < 20} />
</div>
<Card style={{ padding: "12px 16px" }}>
<div style={{ height: "16px", background: "#111", borderRadius: "5px", overflow: "hidden", display: "flex" }}>
<div style={{ width: `${Math.min(100, pctC)}%`, background: pctC > 60 ? "#FF6B35" : "#E8873C", transition: "width 0.3s", display: "flex", alignItems: "center", justifyContent: "center" }}>
{pctC > 15 && <span style={{ fontSize: "9px", color: "#fff", fontFamily: "'DM Mono', monospace" }}>{pct(pctC)} costo</span>}
</div>
<div style={{ flex: 1, background: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center" }}>
{pctM > 10 && <span style={{ fontSize: "9px", color: "#fff", fontFamily: "'DM Mono', monospace" }}>{pct(pctM)} margen</span>}
</div>
</div>
</Card>
<Card>
<div style={{ display: "flex", gap: "11px" }}>
<div style={{ flex: 1 }}><div style={{ color: "#333", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>NOMBRE</div><input value={burger.nombre} onChange={e => updB("nombre", e.target.value)} style={{ ...IS, width: "100%" }} /></div>
<div style={{ width: "155px" }}><div style={{ color: "#333", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>PRECIO DE VENTA $</div><input type="number" value={burger.precio_venta} onChange={e => updB("precio_venta", e.target.value)} style={{ ...IS, width: "100%", color: "#E8FF47", fontWeight: "700" }} /></div>
</div>
</Card>
<Card>
<H title="Receta con cantidades y merma" />
<div style={{ display: "grid", gridTemplateColumns: "20px 1fr 60px 60px 75px 90px 85px auto", gap: "6px", padding: "3px 0 7px", borderBottom: "1px solid #1e1e1e" }}>
{["", "Ingrediente", "Tipo", "Unidad", "Cantidad", "% Merma", "Costo final", ""].map((h, i) => <div key={i} style={{ color: "#2a2a2a", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{h}</div>)}
</div>
{burger.ingredientes.map((ing, idx) => {
const costoBase = ing.tipo === "insumo"
? (insumos.find(i => i.id === ing.ref_id)?.precio_unidad || 0) * ing.cantidad
: calcCostoSalsa(salsas.find(s => s.id === ing.ref_id), insumos) * ing.cantidad;
const costoMerma = costoBase * ((ing.merma_pct || 0) / 100);
const costoFinal = costoBase + costoMerma;
return (
<div key={idx} style={{ display: "grid", gridTemplateColumns: "20px 1fr 60px 60px 75px 90px 85px auto", gap: "6px", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #161616" }}>
<span style={{ fontSize: "13px" }}>{ing.tipo === "salsa" ? "🧪" : "🥩"}</span>
<select value={ing.ref_id} onChange={e => { const id = Number(e.target.value); const ref = (ing.tipo === "insumo" ? insumos : salsas).find(x => x.id === id); updI(idx, "ref_id", id); updI(idx, "nombre", ref?.nombre || ""); updI(idx, "unidad", ing.tipo === "insumo" ? ref?.unidad : "porcion"); }} style={{ ...IS, fontSize: "11px" }}>
{(ing.tipo === "insumo" ? insumos : salsas).map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}
</select>
<span style={{ color: ing.tipo === "salsa" ? "#9B59B6" : "#3498DB", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{ing.tipo}</span>
<span style={{ color: "#444", fontSize: "10px", fontFamily: "'DM Mono', monospace" }}>{ing.unidad}</span>
<input type="number" step="0.001" value={ing.cantidad} onChange={e => updI(idx, "cantidad", e.target.value)} style={{ ...IS, fontSize: "11px" }} />
<div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
<input type="number" min="0" max="100" value={ing.merma_pct || 0} onChange={e => updI(idx, "merma_pct", e.target.value)} style={{ ...IS, fontSize: "11px", width: "44px" }} />
<span style={{ color: "#333", fontSize: "10px" }}>%</span>
</div>
<div>
<div style={{ color: "#E8FF47", fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: "700" }}>{fmt2(costoFinal)}</div>
{(ing.merma_pct || 0) > 0 && <div style={{ color: "#444", fontSize: "9px" }}>+{fmt2(costoMerma)} merma</div>}
</div>
<X onClick={() => delI(idx)} />
</div>
);
})}
{/* Agregar */}
<div style={{ marginTop: "9px", padding: "10px", background: "#111", borderRadius: "7px" }}>
<div style={{ color: "#2a2a2a", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "7px" }}>AGREGAR INGREDIENTE</div>
<div style={{ display: "flex", gap: "7px", flexWrap: "wrap", alignItems: "center" }}>
<select value={ni.tipo} onChange={e => setNi({ ...ni, tipo: e.target.value, ref_id: e.target.value === "insumo" ? (insumos[0]?.id || "") : (salsas[0]?.id || "") })} style={{ ...IS, width: "90px" }}>
<option value="insumo">Insumo</option>
<option value="salsa">Salsa</option>
</select>
<select value={ni.ref_id} onChange={e => setNi({ ...ni, ref_id: e.target.value })} style={{ ...IS, flex: "1 1 130px" }}>{refs().map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>
<input type="number" step="0.001" placeholder="Cantidad" value={ni.cantidad} onChange={e => setNi({ ...ni, cantidad: e.target.value })} style={{ ...IS, width: "85px" }} />
<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
<input type="number" min="0" max="100" placeholder="0" value={ni.merma_pct} onChange={e => setNi({ ...ni, merma_pct: e.target.value })} style={{ ...IS, width: "50px" }} />
<span style={{ color: "#333", fontSize: "10px" }}>% merma</span>
</div>
<Btn onClick={addI}>+ Agregar</Btn>
</div>
</div>
{/* Totales */}
<div style={{ marginTop: "9px", padding: "10px 0 0", borderTop: "2px solid #222" }}>
{(() => {
const sinMerma = burger.ingredientes.reduce((s, ing) => {
const b = ing.tipo === "insumo" ? (insumos.find(i => i.id === ing.ref_id)?.precio_unidad || 0) * ing.cantidad : calcCostoSalsa(salsas.find(s => s.id === ing.ref_id), insumos) * ing.cantidad;
return s + b;
}, 0);
const mermaTotal = costoTotal - sinMerma;
return (
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
<div style={{ color: "#444", fontSize: "10px", fontFamily: "'DM Mono', monospace", lineHeight: "1.8" }}>
<div>Sin merma: {fmt(sinMerma)}</div>
<div>Merma total: <span style={{ color: "#FF6B35" }}>+{fmt(mermaTotal)}</span></div>
</div>
<span style={{ color: "#FF6B35", fontFamily: "'DM Mono', monospace", fontSize: "17px", fontWeight: "700" }}>= {fmt(costoTotal)}</span>
</div>
);
})()}
</div>
</Card>
</div>
)}
</div>
```

);
}

// ===================== PUNTO DE EQUILIBRIO =====================
function PuntoEquilibrioTab({ burgers, costosFijos, insumos, salsas }) {
const [mix, setMix] = useState(() => burgers.map(b => ({ id: b.id, pct: Math.round(100 / burgers.length) })));
useEffect(() => { setMix(burgers.map(b => ({ id: b.id, pct: Math.round(100 / burgers.length) }))); }, [burgers.length]);
const totalFijos = costosFijos.reduce((s, c) => s + c.monto, 0);
const margenPond = burgers.reduce((s, b) => { const m = mix.find(v => v.id === b.id); return s + (b.precio_venta - calcCostoBurger(b, insumos, salsas)) * (m ? m.pct / 100 : 0); }, 0);
const unidadesPE = margenPond > 0 ? Math.ceil(totalFijos / margenPond) : 0;
const ventasPE = burgers.reduce((s, b) => { const m = mix.find(v => v.id === b.id); return s + b.precio_venta * (m ? m.pct / 100 : 0) * unidadesPE; }, 0);

return (
<div style={{ display: “flex”, flexDirection: “column”, gap: “12px” }}>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(4, 1fr)”, gap: “9px” }}>
<StatBox label="Costos fijos" value={fmt(totalFijos)} />
<StatBox label="Margen ponderado" value={fmt(margenPond)} />
<StatBox label="Hamburguesas necesarias" value={unidadesPE} accent />
<StatBox label="Ventas necesarias" value={fmt(ventasPE)} />
</div>
<StatBox label={`Hamburguesas por día (26 días laborables) para cubrir costos fijos`} value={`${Math.ceil(unidadesPE / 26)} hamburgesas/día`} sub=“Por debajo de este número estás perdiendo plata” warn />
<Card>
<H title="Mix de ventas" />
{burgers.map(b => {
const m = mix.find(v => v.id === b.id) || { pct: 0 };
const costo = calcCostoBurger(b, insumos, salsas);
return (
<div key={b.id} style={{ padding: “9px 0”, borderTop: “1px solid #1a1a1a” }}>
<div style={{ display: “flex”, justifyContent: “space-between”, marginBottom: “5px” }}>
<span style={{ color: “#bbb”, fontSize: “12px” }}>🍔 {b.nombre}</span>
<div style={{ display: “flex”, gap: “14px” }}>
<span style={{ color: “#383838”, fontSize: “10px”, fontFamily: “‘DM Mono’, monospace” }}>Costo: {fmt(costo)} | Margen: {fmt(b.precio_venta - costo)}</span>
<span style={{ color: “#E8FF47”, fontFamily: “‘DM Mono’, monospace”, fontSize: “12px”, fontWeight: “700”, width: “32px”, textAlign: “right” }}>{m.pct}%</span>
</div>
</div>
<input type=“range” min=“0” max=“100” value={m.pct} onChange={e => setMix(mix.map(v => v.id === b.id ? { …v, pct: Number(e.target.value) } : v))} style={{ width: “100%”, accentColor: “#E8FF47” }} />
</div>
);
})}
</Card>
<Card>
<H title="Análisis por hamburguesa" />
<div style={{ display: “grid”, gridTemplateColumns: “2fr 1fr 1fr 1fr 1fr 1fr”, gap: “7px”, padding: “3px 0 7px”, borderBottom: “1px solid #1e1e1e” }}>
{[“Hamburguesa”, “Costo”, “Precio”, “Margen”, “% Margen”, “”].map((h, i) => <div key={i} style={{ color: “#2a2a2a”, fontSize: “9px”, fontFamily: “‘DM Mono’, monospace”, textTransform: “uppercase” }}>{h}</div>)}
</div>
{burgers.map(b => {
const costo = calcCostoBurger(b, insumos, salsas);
const margen = b.precio_venta - costo;
const pm = b.precio_venta > 0 ? (margen / b.precio_venta) * 100 : 0;
return (
<div key={b.id} style={{ display: “grid”, gridTemplateColumns: “2fr 1fr 1fr 1fr 1fr 1fr”, gap: “7px”, padding: “8px 0”, borderBottom: “1px solid #161616”, alignItems: “center” }}>
<span style={{ color: “#bbb”, fontSize: “12px” }}>🍔 {b.nombre}</span>
<span style={{ color: “#FF6B35”, fontFamily: “‘DM Mono’, monospace”, fontSize: “12px” }}>{fmt(costo)}</span>
<span style={{ color: “#bbb”, fontFamily: “‘DM Mono’, monospace”, fontSize: “12px” }}>{fmt(b.precio_venta)}</span>
<span style={{ color: margen > 0 ? “#4CAF50” : “#FF6B6B”, fontFamily: “‘DM Mono’, monospace”, fontSize: “12px”, fontWeight: “700” }}>{fmt(margen)}</span>
<span style={{ color: pm > 40 ? “#4CAF50” : pm > 20 ? “#E8FF47” : “#FF6B35”, fontFamily: “‘DM Mono’, monospace”, fontSize: “12px”, fontWeight: “700” }}>{pct(pm)}</span>
<div style={{ height: “7px”, background: “#111”, borderRadius: “3px” }}><div style={{ width: `${Math.max(0, pm)}%`, height: “100%”, background: pm > 40 ? “#4CAF50” : pm > 20 ? “#E8FF47” : “#FF6B35”, borderRadius: “3px”, transition: “width 0.3s” }} /></div>
</div>
);
})}
</Card>
</div>
);
}

// ===================== COSTOS FIJOS =====================
function CostosFijosTab({ costosFijos, setCostosFijos, pagos, setPagos, mesKey }) {
const [nf, setNf] = useState({ nombre: “”, monto: “”, categoria: “Servicios” });
const total = costosFijos.reduce((s, c) => s + c.monto, 0);
const pagado = costosFijos.filter(c => pagos[`${mesKey}-${c.id}`]).reduce((s, c) => s + c.monto, 0);
const bycat = CATS_CF.map(cat => ({ cat, items: costosFijos.filter(c => c.categoria === cat) })).filter(g => g.items.length > 0);
const add = () => { if (!nf.nombre || !nf.monto) return; setCostosFijos([…costosFijos, { id: Date.now(), …nf, monto: Number(nf.monto) }]); setNf({ …nf, nombre: “”, monto: “” }); };
const del = (id) => setCostosFijos(costosFijos.filter(c => c.id !== id));
const tog = (id) => { const k = `${mesKey}-${id}`; setPagos({ …pagos, [k]: !pagos[k] }); };
const upd = (id, f, v) => setCostosFijos(costosFijos.map(c => c.id !== id ? c : { …c, [f]: f === “monto” ? Number(v) : v }));
return (
<div style={{ display: “flex”, flexDirection: “column”, gap: “12px” }}>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(3, 1fr)”, gap: “9px” }}>
<StatBox label="Total costos fijos" value={fmt(total)} />
<StatBox label="Ya pagado" value={fmt(pagado)} accent />
<StatBox label=“Pendiente” value={fmt(total - pagado)} warn={total - pagado > 0} />
</div>
<Card style={{ padding: “13px 16px” }}>
<div style={{ display: “flex”, justifyContent: “space-between”, marginBottom: “5px” }}>
<span style={{ color: “#333”, fontSize: “10px”, fontFamily: “‘DM Mono’, monospace” }}>Pagos {mesActual}</span>
<span style={{ color: “#E8FF47”, fontFamily: “‘DM Mono’, monospace”, fontSize: “11px”, fontWeight: “700” }}>{total > 0 ? pct((pagado / total) * 100) : “0%”}</span>
</div>
<div style={{ height: “8px”, background: “#111”, borderRadius: “4px”, overflow: “hidden” }}>
<div style={{ width: `${total > 0 ? (pagado / total) * 100 : 0}%`, height: “100%”, background: “linear-gradient(90deg, #4CAF50, #E8FF47)”, transition: “width 0.3s”, borderRadius: “4px” }} />
</div>
</Card>
{bycat.map(({ cat, items }) => (
<Card key={cat}>
<div style={{ marginBottom: “9px”, color: “#303030”, fontSize: “9px”, letterSpacing: “0.12em”, textTransform: “uppercase”, fontFamily: “‘DM Mono’, monospace” }}>{cat}</div>
{items.map(c => {
const p = pagos[`${mesKey}-${c.id}`];
return (
<div key={c.id} style={{ display: “flex”, alignItems: “center”, gap: “9px”, padding: “7px 0”, borderTop: “1px solid #161616” }}>
<button onClick={() => tog(c.id)} style={{ width: “24px”, height: “24px”, borderRadius: “50%”, background: p ? “#4CAF50” : “#111”, border: `2px solid ${p ? "#4CAF50" : "#222"}`, color: p ? “#fff” : “#333”, cursor: “pointer”, fontSize: “11px”, flexShrink: 0, display: “flex”, alignItems: “center”, justifyContent: “center” }}>{p ? “✓” : “○”}</button>
<input value={c.nombre} onChange={e => upd(c.id, “nombre”, e.target.value)} style={{ …IS, flex: 1, color: p ? “#333” : “#ccc”, textDecoration: p ? “line-through” : “none” }} />
<input type=“number” value={c.monto} onChange={e => upd(c.id, “monto”, e.target.value)} style={{ …IS, width: “115px”, color: p ? “#333” : “#E8FF47”, fontWeight: “700” }} />
<X onClick={() => del(c.id)} />
</div>
);
})}
</Card>
))}
<Card>
<H title="Agregar costo fijo" />
<div style={{ display: “flex”, gap: “7px”, flexWrap: “wrap” }}>
<input placeholder=“Nombre” value={nf.nombre} onChange={e => setNf({ …nf, nombre: e.target.value })} style={{ …IS, flex: “1 1 140px” }} />
<select value={nf.categoria} onChange={e => setNf({ …nf, categoria: e.target.value })} style={{ …IS }}>{CATS_CF.map(c => <option key={c}>{c}</option>)}</select>
<input type=“number” placeholder=“Monto $” value={nf.monto} onChange={e => setNf({ …nf, monto: e.target.value })} style={{ …IS, width: “115px” }} />
<Btn onClick={add}>+ Agregar</Btn>
</div>
</Card>
</div>
);
}

// ===================== CAJA & PROYECCIÓN =====================
function CajaBancoTab({ costosFijos, pagos, mesKey, caja, setCaja, banco, setBanco, pedidosPendientes, setPedidosPendientes, ventasDiarias, setVentasDiarias, registros, setRegistros }) {
const [ventasHoy, setVentasHoy] = useState(””);
const totalFijos = costosFijos.reduce((s, c) => s + c.monto, 0);
const totalPagado = costosFijos.filter(c => pagos[`${mesKey}-${c.id}`]).reduce((s, c) => s + c.monto, 0);
const pendiente = totalFijos - totalPagado;
const disponible = (Number(caja) || 0) + (Number(banco) || 0) + (Number(pedidosPendientes) || 0);
const posNeta = disponible - pendiente;
const diasRest = diasDelMes() - hoy;
const regList = registros || [];
const promDiario = regList.length > 0 ? regList.reduce((s, r) => s + r.ventas, 0) / regList.length : Number(ventasDiarias) || 0;
const proyVentas = promDiario * diasRest;
const proyFinal = disponible + proyVentas - pendiente;
const sc = proyFinal >= 0 ? “#4CAF50” : “#FF6B35”;

return (
<div style={{ display: “flex”, flexDirection: “column”, gap: “12px” }}>
<Card>
<H title={`Estado actual — Día ${hoy} / ${diasDelMes()}`} />
<div style={{ display: “grid”, gridTemplateColumns: “repeat(3, 1fr)”, gap: “11px” }}>
{[[“💵 Caja (efectivo)”, caja, setCaja], [“🏦 Banco”, banco, setBanco], [“📦 Pedidos pendientes cobro”, pedidosPendientes, setPedidosPendientes]].map(([lbl, v, sv]) => (
<div key={lbl}><div style={{ color: “#333”, fontSize: “9px”, fontFamily: “‘DM Mono’, monospace”, marginBottom: “4px” }}>{lbl}</div><input type=“number” placeholder=”$” value={v} onChange={e => sv(e.target.value)} style={{ …IS, width: “100%” }} /></div>
))}
</div>
</Card>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: “10px” }}>
<div style={{ display: “flex”, flexDirection: “column”, gap: “9px” }}>
<StatBox label="Total disponible" value={fmt(disponible)} />
<StatBox label="Costos fijos pendientes" value={fmt(pendiente)} warn={pendiente > 0} />
<StatBox label="Posición neta hoy" value={fmt(posNeta)} accent={posNeta >= 0} warn={posNeta < 0} sub={posNeta >= 0 ? “✓ Superávit” : “⚠ Déficit”} />
</div>
<Card style={{ border: `1px solid ${sc}20`, background: `${sc}05` }}>
<div style={{ color: sc, fontSize: “9px”, letterSpacing: “0.1em”, textTransform: “uppercase”, fontFamily: “‘DM Mono’, monospace”, marginBottom: “5px” }}>Proyección fin de mes</div>
<div style={{ color: sc, fontSize: “28px”, fontWeight: “700”, fontFamily: “‘DM Mono’, monospace”, marginBottom: “9px” }}>{fmt(proyFinal)}</div>
<div style={{ color: “#333”, fontSize: “10px”, lineHeight: “1.9”, fontFamily: “‘DM Mono’, monospace” }}>
<div>Días restantes: <span style={{ color: “#555” }}>{diasRest}</span></div>
<div>Prom venta/día: <span style={{ color: “#555” }}>{fmt(promDiario)}</span></div>
<div>Ventas proyectadas: <span style={{ color: “#555” }}>{fmt(proyVentas)}</span></div>
</div>
<div style={{ marginTop: “10px” }}>
<div style={{ color: “#252525”, fontSize: “9px”, fontFamily: “‘DM Mono’, monospace”, marginBottom: “4px” }}>VENTA DIARIA MANUAL (si no hay registros)</div>
<input type=“number” placeholder=”$” value={ventasDiarias} onChange={e => setVentasDiarias(e.target.value)} style={{ …IS, width: “100%” }} />
</div>
</Card>
</div>
<Card>
<H title="Registro diario de ventas" />
<div style={{ display: “flex”, gap: “7px”, marginBottom: “13px” }}>
<input type=“number” placeholder={`Ventas del día ${hoy} $`} value={ventasHoy} onChange={e => setVentasHoy(e.target.value)} style={{ …IS, flex: 1 }} />
<Btn onClick={() => { if (!ventasHoy) return; setRegistros([…regList, { dia: hoy, ventas: Number(ventasHoy) }]); setVentasHoy(””); }}>Registrar día {hoy}</Btn>
</div>
{regList.length > 0 ? (
<>
<div style={{ display: “flex”, alignItems: “flex-end”, gap: “3px”, height: “50px”, marginBottom: “11px” }}>
{regList.map((r, i) => { const mx = Math.max(…regList.map(x => x.ventas)); const h = mx > 0 ? (r.ventas / mx) * 100 : 0; return <div key={i} style={{ flex: 1, display: “flex”, flexDirection: “column”, alignItems: “center”, gap: “1px” }}><div style={{ width: “100%”, height: `${h}%`, background: “#E8FF47”, borderRadius: “2px 2px 0 0”, minHeight: “3px” }} title={`Día ${r.dia}: ${fmt(r.ventas)}`} /><span style={{ color: “#2a2a2a”, fontSize: “8px” }}>{r.dia}</span></div>; })}
</div>
{regList.map((r, i) => (
<div key={i} style={{ display: “flex”, alignItems: “center”, gap: “9px”, padding: “6px 0”, borderBottom: “1px solid #161616” }}>
<span style={{ color: “#333”, fontFamily: “‘DM Mono’, monospace”, fontSize: “10px”, width: “45px” }}>Día {r.dia}</span>
<span style={{ color: “#E8FF47”, fontFamily: “‘DM Mono’, monospace”, fontSize: “12px”, fontWeight: “700”, flex: 1 }}>{fmt(r.ventas)}</span>
<X onClick={() => setRegistros(regList.filter((_, ii) => ii !== i))} />
</div>
))}
<div style={{ display: “flex”, justifyContent: “space-between”, padding: “9px 0 0”, borderTop: “2px solid #1e1e1e” }}>
<span style={{ color: “#444”, fontFamily: “‘DM Mono’, monospace”, fontSize: “11px” }}>Total acumulado</span>
<span style={{ color: “#4CAF50”, fontFamily: “‘DM Mono’, monospace”, fontSize: “13px”, fontWeight: “700” }}>{fmt(regList.reduce((s, r) => s + r.ventas, 0))}</span>
</div>
</>
) : (
<div style={{ textAlign: “center”, padding: “18px”, color: “#222”, fontFamily: “‘DM Mono’, monospace”, fontSize: “11px” }}>No hay ventas registradas este mes</div>
)}
</Card>
</div>
);
}

// ===================== APP =====================
const KEYS = {
insumos: “hb-insumos-v2”, salsas: “hb-salsas-v2”, burgers: “hb-burgers-v2”,
costosFijos: “hb-costos-fijos”, pagos: “hb-pagos”,
caja: “hb-caja”, banco: “hb-banco”, pedidos: “hb-pedidos”,
ventasDiarias: “hb-ventas-diarias”, registros: “hb-registros”,
};

export default function App() {
const [tab, setTab] = useState(0);
const [insumos, setInsumos, r0] = usePersisted(KEYS.insumos, initialInsumos);
const [salsas, setSalsas, r1] = usePersisted(KEYS.salsas, initialSalsas);
const [burgers, setBurgers, r2] = usePersisted(KEYS.burgers, initialBurgers);
const [costosFijos, setCostosFijos, r3] = usePersisted(KEYS.costosFijos, initialCostosFijos);
const [pagos, setPagos, r4] = usePersisted(KEYS.pagos, {});
const [caja, setCaja, r5] = usePersisted(KEYS.caja, “”);
const [banco, setBanco, r6] = usePersisted(KEYS.banco, “”);
const [pedidos, setPedidos, r7] = usePersisted(KEYS.pedidos, “”);
const [ventasDiarias, setVentasDiarias, r8] = usePersisted(KEYS.ventasDiarias, “”);
const [registros, setRegistros, r9] = usePersisted(KEYS.registros, []);
const mesKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
if (![r0,r1,r2,r3,r4,r5,r6,r7,r8,r9].every(Boolean)) return (
<div style={{ minHeight: “100vh”, background: “#0D0D0D”, display: “flex”, alignItems: “center”, justifyContent: “center”, flexDirection: “column”, gap: “12px” }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;700&display=swap');`}</style>
<div style={{ fontSize: “28px” }}>🍔</div>
<div style={{ color: “#E8FF47”, fontFamily: “‘DM Mono’, monospace”, fontSize: “12px”, letterSpacing: “0.1em” }}>Cargando…</div>
</div>
);

const tabs = [
{ label: “Insumos”, icon: “🛒” },
{ label: “Salsas”, icon: “🧪” },
{ label: “Hamburguesas”, icon: “🍔” },
{ label: “Equilibrio”, icon: “⚖️” },
{ label: “Costos fijos”, icon: “📋” },
{ label: “Caja”, icon: “📊” },
];

return (
<div style={{ minHeight: “100vh”, background: “#0D0D0D”, color: “#fff”, fontFamily: “‘DM Sans’, sans-serif” }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=DM+Sans:wght@400;500;700&display=swap'); * { box-sizing: border-box; } input[type=range] { accent-color: #E8FF47; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; } select option { background: #1a1a1a; } input:focus, select:focus { border-color: #E8FF4760 !important; }`}</style>
<div style={{ background: “#0f0f0f”, borderBottom: “1px solid #1a1a1a”, padding: “13px 22px” }}>
<div style={{ maxWidth: “1200px”, margin: “0 auto”, display: “flex”, alignItems: “center”, justifyContent: “space-between” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: “11px” }}>
<div style={{ background: “#E8FF47”, color: “#1a1a1a”, borderRadius: “9px”, padding: “6px 11px”, fontSize: “17px” }}>🍔</div>
<div>
<div style={{ fontFamily: “‘DM Mono’, monospace”, fontWeight: “700”, fontSize: “14px” }}>HamburgeriaOS</div>
<div style={{ color: “#333”, fontSize: “9px”, fontFamily: “‘DM Mono’, monospace” }}>Sistema de costos y gestión</div>
</div>
</div>
<div style={{ color: “#2a2a2a”, fontFamily: “‘DM Mono’, monospace”, fontSize: “10px”, textAlign: “right” }}>
<div style={{ color: “#E8FF4780” }}>{mesActual.toUpperCase()}</div>
<div>Día {hoy} de {diasDelMes()}</div>
<div style={{ color: “#1e3a1e”, fontSize: “9px”, marginTop: “1px” }}>💾 auto-guardado</div>
</div>
</div>
</div>
<div style={{ background: “#0f0f0f”, borderBottom: “1px solid #1a1a1a”, padding: “0 22px”, overflowX: “auto” }}>
<div style={{ maxWidth: “1200px”, margin: “0 auto”, display: “flex”, gap: “2px”, padding: “5px 0” }}>
{tabs.map((t, i) => <TabBtn key={i} active={tab === i} onClick={() => setTab(i)} icon={t.icon}>{t.label}</TabBtn>)}
</div>
</div>
<div style={{ maxWidth: “1200px”, margin: “0 auto”, padding: “18px 22px” }}>
{tab === 0 && <InsumosTab insumos={insumos} setInsumos={setInsumos} />}
{tab === 1 && <SalsasTab salsas={salsas} setSalsas={setSalsas} insumos={insumos} />}
{tab === 2 && <BurgersTab burgers={burgers} setBurgers={setBurgers} insumos={insumos} salsas={salsas} />}
{tab === 3 && <PuntoEquilibrioTab burgers={burgers} costosFijos={costosFijos} insumos={insumos} salsas={salsas} />}
{tab === 4 && <CostosFijosTab costosFijos={costosFijos} setCostosFijos={setCostosFijos} pagos={pagos} setPagos={setPagos} mesKey={mesKey} />}
{tab === 5 && <CajaBancoTab costosFijos={costosFijos} pagos={pagos} mesKey={mesKey} caja={caja} setCaja={setCaja} banco={banco} setBanco={setBanco} pedidosPendientes={pedidos} setPedidosPendientes={setPedidos} ventasDiarias={ventasDiarias} setVentasDiarias={setVentasDiarias} registros={registros || []} setRegistros={setRegistros} />}
</div>
</div>
);
}
