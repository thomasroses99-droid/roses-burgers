import { useState, useEffect } from "react";

const EMPLEADO_KEY = "rb-empleado-nombre";
const GREEN = "#1a7a3a";
const DARK  = "#0d1f14";
const MONO  = "'DM Mono', sans-serif";

const fmt    = (n) => "$ " + Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 });
const fmtHoy = () => { const d = new Date(); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; };
const parse  = (str, def) => { try { return JSON.parse(str); } catch { return def; } };

const inp = { width:"100%", padding:"12px 14px", border:"1px solid #c8e6c9", borderRadius:"9px", fontSize:"14px", outline:"none", fontFamily:MONO, boxSizing:"border-box", background:"#fafff9" };
const card = { background:"#fff", borderRadius:"12px", padding:"18px", border:"1px solid #c8e6c9", marginBottom:"14px" };
const Lbl = ({ t }) => <div style={{ fontSize:"10px", color:"#5a8a6e", fontFamily:MONO, marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.05em" }}>{t}</div>;

async function fbRead(field) {
  const fb = await import("./firebase.js");
  const snap = await fb.getDoc(fb.doc(fb.db, "rb", "main3"));
  return snap.exists() ? parse(snap.data()[field], []) : [];
}
async function fbWrite(field, arr) {
  const fb = await import("./firebase.js");
  await fb.updateDoc(fb.doc(fb.db, "rb", "main3"), { [field]: JSON.stringify(arr) });
}
async function fbAppend(field, entry) {
  const current = await fbRead(field);
  await fbWrite(field, [...current, entry]);
}
async function fbRemove(field, id) {
  const current = await fbRead(field);
  await fbWrite(field, current.filter(x => x.id !== id));
}

// ── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [val, setVal] = useState("");
  const confirm = () => { if (val.trim()) { localStorage.setItem(EMPLEADO_KEY, val.trim()); onLogin(val.trim()); } };
  return (
    <div style={{ minHeight:"100vh", background:DARK, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"16px", padding:"36px 28px", width:"100%", maxWidth:"360px", textAlign:"center", boxShadow:"0 8px 40px #00000040" }}>
        <div style={{ fontSize:"44px", marginBottom:"12px" }}>🍔</div>
        <div style={{ fontWeight:"700", fontSize:"20px", color:"#1a3a25", marginBottom:"4px", fontFamily:MONO }}>Roses Burgers</div>
        <div style={{ fontSize:"12px", color:"#5a8a6e", marginBottom:"28px", fontFamily:MONO }}>Panel de empleado</div>
        <div style={{ textAlign:"left", marginBottom:"16px" }}>
          <Lbl t="Tu nombre" />
          <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && confirm()} placeholder="Ej: Nicolás" style={inp} autoFocus />
        </div>
        <button onClick={confirm} style={{ width:"100%", background:GREEN, color:"#fff", border:"none", borderRadius:"9px", padding:"13px", fontSize:"14px", fontWeight:"700", cursor:"pointer", fontFamily:MONO }}>
          Ingresar
        </button>
      </div>
    </div>
  );
}

// ── Tab Caja / Banco ─────────────────────────────────────────────────────────
function TabMovimientos({ tipo, nombre, field }) {
  const [concepto, setConcepto] = useState("");
  const [ingreso,  setIngreso]  = useState("");
  const [egreso,   setEgreso]   = useState("");
  const [movs,     setMovs]     = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [flash,    setFlash]    = useState("");

  // Escuchar cambios en tiempo real
  useEffect(() => {
    let unsub;
    import("./firebase.js").then(fb => {
      unsub = fb.onSnapshot(fb.doc(fb.db, "rb", "main3"), snap => {
        if (snap.exists()) setMovs(parse(snap.data()[field], []));
      }, () => {});
    });
    return () => { if (unsub) unsub(); };
  }, [field]);

  const hoy = fmtHoy();
  const misHoy = movs.filter(m => m.empleado === nombre && m.fecha === hoy);

  const agregar = async () => {
    if (!concepto.trim() || (!ingreso && !egreso)) return;
    const entry = { id: Date.now(), fecha: hoy, concepto: concepto.trim(), ingreso: Number(ingreso)||0, egreso: Number(egreso)||0, empleado: nombre };
    setConcepto(""); setIngreso(""); setEgreso("");
    setSaving(true);
    try {
      await fbAppend(field, entry);
      setFlash("✓ Guardado"); setTimeout(() => setFlash(""), 1500);
    } catch {
      setFlash("⚠ Error"); setTimeout(() => setFlash(""), 3000);
    }
    setSaving(false);
  };

  const eliminar = async (id) => {
    try { await fbRemove(field, id); } catch {}
  };

  return (
    <div style={{ padding:"10px 16px 32px" }}>
      {/* Formulario */}
      <div style={card}>
        <div style={{ fontWeight:"700", fontSize:"14px", color:"#1a3a25", marginBottom:"16px" }}>
          Nuevo movimiento — {tipo === "caja" ? "💵 Efectivo" : "🏦 Banco"}
          {flash && <span style={{ marginLeft:"12px", fontSize:"11px", color: flash.startsWith("✓") ? GREEN : "#cc4400" }}>{flash}</span>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"11px" }}>
          <div>
            <Lbl t="Concepto / Descripción" />
            <input value={concepto} onChange={e => setConcepto(e.target.value)} onKeyDown={e => e.key === "Enter" && agregar()} placeholder="Ej: Pago proveedor, Venta efectivo..." style={inp} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            <div>
              <Lbl t="↑ Ingreso $" />
              <input type="number" value={ingreso} onChange={e => setIngreso(e.target.value)} placeholder="0" style={{ ...inp, color:GREEN, fontWeight:"600" }} />
            </div>
            <div>
              <Lbl t="↓ Egreso $" />
              <input type="number" value={egreso} onChange={e => setEgreso(e.target.value)} placeholder="0" style={{ ...inp, color:"#cc4400", fontWeight:"600" }} />
            </div>
          </div>
          <button onClick={agregar} disabled={saving} style={{ background:GREEN, color:"#fff", border:"none", borderRadius:"9px", padding:"13px", fontSize:"14px", fontWeight:"700", cursor:"pointer", fontFamily:MONO, opacity:saving?0.6:1 }}>
            + Registrar movimiento
          </button>
        </div>
      </div>

      {/* Lo que registré hoy */}
      <div style={card}>
        <div style={{ fontWeight:"700", fontSize:"13px", color:"#1a3a25", marginBottom:"12px" }}>
          Mis registros de hoy <span style={{ fontWeight:"400", fontSize:"11px", color:"#8aba9e" }}>({misHoy.length})</span>
        </div>
        {misHoy.length === 0 ? (
          <div style={{ textAlign:"center", padding:"20px 0", color:"#8aba9e", fontSize:"12px" }}>Nada registrado hoy todavía</div>
        ) : (
          [...misHoy].reverse().map(m => (
            <div key={m.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 0", borderBottom:"1px solid #e8f5ec" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"13px", color:"#1a3a25", fontWeight:"600", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.concepto}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                {m.ingreso > 0 && <div style={{ color:GREEN, fontWeight:"700", fontSize:"13px" }}>+{fmt(m.ingreso)}</div>}
                {m.egreso  > 0 && <div style={{ color:"#cc4400", fontWeight:"700", fontSize:"13px" }}>-{fmt(m.egreso)}</div>}
              </div>
              <button onClick={() => eliminar(m.id)} style={{ background:"none", border:"none", color:"#ccc", cursor:"pointer", fontSize:"16px", padding:"0 4px", flexShrink:0 }}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Tab Ventas ───────────────────────────────────────────────────────────────
function TabVentas({ nombre }) {
  const [burgers,  setBurgers]  = useState([]);
  const [ventas,   setVentas]   = useState([]);
  const [burgerId, setBurgerId] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [saving,   setSaving]   = useState(false);
  const [flash,    setFlash]    = useState("");

  useEffect(() => {
    let unsub;
    import("./firebase.js").then(fb => {
      unsub = fb.onSnapshot(fb.doc(fb.db, "rb", "main3"), snap => {
        if (snap.exists()) {
          const d = snap.data();
          setBurgers(parse(d["hb-burgers-v2"], []));
          setVentas(parse(d["hb-ventas-reg"], []));
        }
      }, () => {});
    });
    return () => { if (unsub) unsub(); };
  }, []);

  const hoy = fmtHoy();
  const misHoy = ventas.filter(v => v.empleado === nombre && v.fecha === hoy);
  const selected = burgers.find(b => b.id === Number(burgerId));

  const agregar = async () => {
    if (!selected || Number(cantidad) <= 0) return;
    const entry = { id: Date.now(), fecha: hoy, burger_id: selected.id, burger_nombre: selected.nombre, cantidad: Number(cantidad), precio_unit: selected.precio_venta || 0, empleado: nombre };
    setBurgerId(""); setCantidad("1");
    setSaving(true);
    try {
      await fbAppend("hb-ventas-reg", entry);
      setFlash("✓ Guardado"); setTimeout(() => setFlash(""), 1500);
    } catch {
      setFlash("⚠ Error"); setTimeout(() => setFlash(""), 3000);
    }
    setSaving(false);
  };

  const eliminar = async (id) => {
    try { await fbRemove("hb-ventas-reg", id); } catch {}
  };

  return (
    <div style={{ padding:"10px 16px 32px" }}>
      <div style={card}>
        <div style={{ fontWeight:"700", fontSize:"14px", color:"#1a3a25", marginBottom:"16px" }}>
          Registrar venta 🧾
          {flash && <span style={{ marginLeft:"12px", fontSize:"11px", color: flash.startsWith("✓") ? GREEN : "#cc4400" }}>{flash}</span>}
        </div>
        {burgers.filter(b => b.disponible !== false).length === 0 ? (
          <div style={{ color:"#8aba9e", fontSize:"12px", textAlign:"center", padding:"16px 0" }}>No hay artículos cargados en el sistema</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"11px" }}>
            <div>
              <Lbl t="Artículo" />
              <select value={burgerId} onChange={e => setBurgerId(e.target.value)} style={inp}>
                <option value="">Seleccionar...</option>
                {burgers.filter(b => b.disponible !== false).map(b => (
                  <option key={b.id} value={b.id}>{b.nombre} — {fmt(b.precio_venta)}</option>
                ))}
              </select>
            </div>
            <div>
              <Lbl t="Cantidad" />
              <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} style={inp} />
            </div>
            {selected && (
              <div style={{ background:"#f0f9f2", borderRadius:"8px", padding:"11px 14px", display:"flex", justifyContent:"space-between", fontSize:"12px", color:"#5a8a6e" }}>
                <span>Precio: <strong style={{ color:GREEN }}>{fmt(selected.precio_venta)}</strong></span>
                <span>Subtotal: <strong style={{ color:GREEN }}>{fmt(selected.precio_venta * Number(cantidad||0))}</strong></span>
              </div>
            )}
            <button onClick={agregar} disabled={saving || !burgerId} style={{ background:GREEN, color:"#fff", border:"none", borderRadius:"9px", padding:"13px", fontSize:"14px", fontWeight:"700", cursor:"pointer", fontFamily:MONO, opacity:(saving||!burgerId)?0.6:1 }}>
              + Registrar venta
            </button>
          </div>
        )}
      </div>

      <div style={card}>
        <div style={{ fontWeight:"700", fontSize:"13px", color:"#1a3a25", marginBottom:"12px" }}>
          Mis ventas de hoy <span style={{ fontWeight:"400", fontSize:"11px", color:"#8aba9e" }}>({misHoy.length})</span>
        </div>
        {misHoy.length === 0 ? (
          <div style={{ textAlign:"center", padding:"20px 0", color:"#8aba9e", fontSize:"12px" }}>Nada vendido hoy todavía</div>
        ) : (
          [...misHoy].reverse().map(v => (
            <div key={v.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 0", borderBottom:"1px solid #e8f5ec" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"13px", color:"#1a3a25", fontWeight:"600", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.burger_nombre}</div>
                <div style={{ fontSize:"10px", color:"#8aba9e" }}>×{v.cantidad}</div>
              </div>
              <div style={{ color:GREEN, fontWeight:"700", fontSize:"13px", flexShrink:0 }}>{fmt(v.precio_unit * v.cantidad)}</div>
              <button onClick={() => eliminar(v.id)} style={{ background:"none", border:"none", color:"#ccc", cursor:"pointer", fontSize:"16px", padding:"0 4px", flexShrink:0 }}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── App principal ────────────────────────────────────────────────────────────
export default function PaginaEmpleado() {
  const [nombre, setNombre] = useState(localStorage.getItem(EMPLEADO_KEY) || "");
  const [tab, setTab] = useState(0);

  if (!nombre) return <Login onLogin={setNombre} />;

  const tabBtn = (active) => ({
    flex:1, padding:"13px 0", border:"none",
    borderBottom:`3px solid ${active ? GREEN : "transparent"}`,
    background:"transparent",
    color: active ? GREEN : "#8aba9e",
    fontWeight: active ? "700" : "400",
    fontSize:"13px", cursor:"pointer", fontFamily:MONO,
  });

  return (
    <div style={{ minHeight:"100vh", background:"#f5fdf7", fontFamily:MONO, maxWidth:"480px", margin:"0 auto" }}>

      {/* Header */}
      <div style={{ background:DARK, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ background:GREEN, borderRadius:"8px", padding:"5px 9px", fontSize:"15px" }}>🍔</div>
          <div>
            <div style={{ color:"#fff", fontWeight:"700", fontSize:"13px" }}>Roses Burgers</div>
            <div style={{ color:"#6ee49a", fontSize:"10px" }}>👤 {nombre}</div>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem(EMPLEADO_KEY); setNombre(""); }}
          style={{ background:"none", border:"1px solid #3a6a4a", borderRadius:"6px", color:"#6a9a7e", cursor:"pointer", fontSize:"10px", padding:"4px 10px", fontFamily:MONO }}>
          Salir
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", background:"#fff", borderBottom:"1px solid #e0f0e6" }}>
        <button style={tabBtn(tab === 0)} onClick={() => setTab(0)}>💵 Efectivo</button>
        <button style={tabBtn(tab === 1)} onClick={() => setTab(1)}>🏦 Banco</button>
        <button style={tabBtn(tab === 2)} onClick={() => setTab(2)}>🧾 Ventas</button>
      </div>

      {tab === 0 && <TabMovimientos tipo="caja"  nombre={nombre} field="hb-caja-diaria"     />}
      {tab === 1 && <TabMovimientos tipo="banco" nombre={nombre} field="hb-caja-banco-movs" />}
      {tab === 2 && <TabVentas nombre={nombre} />}
    </div>
  );
}
