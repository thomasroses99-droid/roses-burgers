import { useState, useEffect, useRef } from "react";

const EMPLEADO_KEY = "rb-empleado-nombre";
const fmt = (n) => "$ " + Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 });
const fmtHoy = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

function tryParse(str, def) {
  try { return JSON.parse(str); } catch { return def; }
}

async function fbSave(cajaDiaria, cajaBanco, ventas) {
  const fb = await import("./firebase.js");
  await fb.setDoc(fb.doc(fb.db, "rb", "empleado"), {
    cajaDiaria: JSON.stringify(cajaDiaria),
    cajaBanco: JSON.stringify(cajaBanco),
    ventas: JSON.stringify(ventas),
  });
}

export default function PaginaEmpleado() {
  const [nombre, setNombre] = useState(localStorage.getItem(EMPLEADO_KEY) || "");
  const [inputNombre, setInputNombre] = useState("");
  const [tab, setTab] = useState(0);
  const [cajaDiaria, setCajaDiaria] = useState([]);
  const [cajaBanco, setCajaBanco] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [burgers, setBurgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState("");
  const cajaRef = useRef([]);
  const bancoRef = useRef([]);
  const ventasRef = useRef([]);

  // Caja/Banco form
  const [concepto, setConcepto] = useState("");
  const [ingreso, setIngreso] = useState("");
  const [egreso, setEgreso] = useState("");

  // Ventas form
  const [burgerId, setBurgerId] = useState("");
  const [cantidad, setCantidad] = useState("1");

  useEffect(() => {
    let unsub;
    import("./firebase.js").then(fb => {
      fb.onSnapshot(fb.doc(fb.db, "rb", "main3"), snap => {
        if (snap.exists()) {
          const d = snap.data();
          setBurgers(tryParse(d["hb-burgers-v2"], []));
        }
        setLoading(false);
      }, () => setLoading(false));

      unsub = fb.onSnapshot(fb.doc(fb.db, "rb", "empleado"), snap => {
        if (snap.exists()) {
          const d = snap.data();
          const cd = tryParse(d.cajaDiaria ?? d.cajaMovs, []);
          const cb = tryParse(d.cajaBanco, []);
          const vt = tryParse(d.ventas, []);
          setCajaDiaria(cd); cajaRef.current = cd;
          setCajaBanco(cb); bancoRef.current = cb;
          setVentas(vt); ventasRef.current = vt;
        }
      }, () => {});
    }).catch(() => setLoading(false));
    return () => { if (unsub) unsub(); };
  }, []);

  const save = async (newCaja, newBanco, newVentas) => {
    setSaving(true);
    try {
      await fbSave(newCaja, newBanco, newVentas);
      setFlash("✓ Guardado");
      setTimeout(() => setFlash(""), 1500);
    } catch {
      setFlash("⚠ Error al guardar");
      setTimeout(() => setFlash(""), 3000);
    }
    setSaving(false);
  };

  const addMovimiento = async (tipo) => {
    if (!concepto.trim() || (!ingreso && !egreso)) return;
    const entry = {
      id: Date.now(),
      fecha: fmtHoy(),
      concepto: concepto.trim(),
      ingreso: Number(ingreso) || 0,
      egreso: Number(egreso) || 0,
      empleado: nombre,
    };
    if (tipo === "caja") {
      const n = [...cajaRef.current, entry];
      cajaRef.current = n; setCajaDiaria(n);
      setConcepto(""); setIngreso(""); setEgreso("");
      await save(n, bancoRef.current, ventasRef.current);
    } else {
      const n = [...bancoRef.current, entry];
      bancoRef.current = n; setCajaBanco(n);
      setConcepto(""); setIngreso(""); setEgreso("");
      await save(cajaRef.current, n, ventasRef.current);
    }
  };

  const delMovimiento = async (tipo, id) => {
    if (tipo === "caja") {
      const n = cajaRef.current.filter(m => m.id !== id);
      cajaRef.current = n; setCajaDiaria(n);
      await save(n, bancoRef.current, ventasRef.current);
    } else {
      const n = bancoRef.current.filter(m => m.id !== id);
      bancoRef.current = n; setCajaBanco(n);
      await save(cajaRef.current, n, ventasRef.current);
    }
  };

  const addVenta = async () => {
    const b = burgers.find(x => x.id === Number(burgerId));
    if (!b || !cantidad || Number(cantidad) <= 0) return;
    const entry = {
      id: Date.now(),
      fecha: fmtHoy(),
      burger_id: b.id,
      burger_nombre: b.nombre,
      cantidad: Number(cantidad),
      precio_unit: b.precio_venta || 0,
      empleado: nombre,
    };
    const n = [...ventasRef.current, entry];
    ventasRef.current = n; setVentas(n);
    setCantidad("1"); setBurgerId("");
    await save(cajaRef.current, bancoRef.current, n);
  };

  const delVenta = async (id) => {
    const n = ventasRef.current.filter(v => v.id !== id);
    ventasRef.current = n; setVentas(n);
    await save(cajaRef.current, bancoRef.current, n);
  };

  const GREEN = "#1a7a3a";
  const mono = "'DM Mono', sans-serif";
  const inputSt = {
    width: "100%", padding: "12px 14px", border: "1px solid #c8e6c9",
    borderRadius: "9px", fontSize: "14px", outline: "none", fontFamily: mono,
    boxSizing: "border-box", background: "#fafff9",
  };
  const lbl = (text) => (
    <div style={{ fontSize: "10px", color: "#5a8a6e", fontFamily: mono, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{text}</div>
  );

  if (!nombre) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1f14", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "36px 28px", width: "100%", maxWidth: "360px", textAlign: "center", boxShadow: "0 8px 40px #00000040" }}>
          <div style={{ fontSize: "44px", marginBottom: "12px" }}>🍔</div>
          <div style={{ fontWeight: "700", fontSize: "20px", color: "#1a3a25", marginBottom: "4px", fontFamily: mono }}>Roses Burgers</div>
          <div style={{ fontSize: "12px", color: "#5a8a6e", marginBottom: "28px", fontFamily: mono }}>Panel de empleado</div>
          <div style={{ textAlign: "left", marginBottom: "16px" }}>
            {lbl("Tu nombre")}
            <input
              value={inputNombre}
              onChange={e => setInputNombre(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && inputNombre.trim()) {
                  localStorage.setItem(EMPLEADO_KEY, inputNombre.trim());
                  setNombre(inputNombre.trim());
                }
              }}
              placeholder="Ej: Nicolás"
              style={inputSt}
              autoFocus
            />
          </div>
          <button
            onClick={() => {
              if (inputNombre.trim()) {
                localStorage.setItem(EMPLEADO_KEY, inputNombre.trim());
                setNombre(inputNombre.trim());
              }
            }}
            style={{ width: "100%", background: GREEN, color: "#fff", border: "none", borderRadius: "9px", padding: "13px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: mono }}
          >
            Ingresar
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1f14", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#6ee49a", fontFamily: mono, fontSize: "12px" }}>Cargando...</div>
      </div>
    );
  }

  const misCaja = cajaDiaria.filter(m => m.empleado === nombre);
  const misBanco = cajaBanco.filter(m => m.empleado === nombre);
  const misVentas = ventas.filter(v => v.empleado === nombre);

  const saldoCaja = misCaja.reduce((s, m) => s + (Number(m.ingreso)||0) - (Number(m.egreso)||0), 0);
  const saldoBanco = misBanco.reduce((s, m) => s + (Number(m.ingreso)||0) - (Number(m.egreso)||0), 0);
  const totalVentasHoy = misVentas.filter(v => v.fecha === fmtHoy()).reduce((s, v) => s + v.precio_unit * v.cantidad, 0);

  const selectedBurger = burgers.find(b => b.id === Number(burgerId));

  const tabBtn = (active) => ({
    flex: 1, padding: "13px 0", border: "none",
    borderBottom: `3px solid ${active ? GREEN : "transparent"}`,
    background: "transparent",
    color: active ? GREEN : "#8aba9e",
    fontWeight: active ? "700" : "400",
    fontSize: "13px", cursor: "pointer", fontFamily: mono,
    transition: "all 0.15s",
  });

  const cardSt = {
    background: "#fff", borderRadius: "12px", padding: "18px",
    border: "1px solid #c8e6c9", marginBottom: "14px",
  };

  const MovsList = ({ movs, tipo }) => (
    movs.length === 0 ? (
      <div style={{ textAlign: "center", padding: "24px 0", color: "#8aba9e", fontSize: "12px", fontFamily: mono }}>Sin movimientos cargados</div>
    ) : (
      <>
        {[...movs].reverse().map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 0", borderBottom: "1px solid #e8f5ec" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", color: "#1a3a25", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.concepto}</div>
              <div style={{ fontSize: "10px", color: "#8aba9e" }}>{m.fecha}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {m.ingreso > 0 && <div style={{ color: GREEN, fontWeight: "700", fontSize: "13px" }}>+{fmt(m.ingreso)}</div>}
              {m.egreso > 0 && <div style={{ color: "#cc4400", fontWeight: "700", fontSize: "13px" }}>-{fmt(m.egreso)}</div>}
            </div>
            <button onClick={() => delMovimiento(tipo, m.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: "16px", padding: "0 3px", flexShrink: 0 }}>✕</button>
          </div>
        ))}
      </>
    )
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5fdf7", fontFamily: mono, maxWidth: "480px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: "#0d1f14", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: GREEN, borderRadius: "8px", padding: "5px 9px", fontSize: "15px" }}>🍔</div>
          <div>
            <div style={{ color: "#fff", fontWeight: "700", fontSize: "13px" }}>Roses Burgers</div>
            <div style={{ color: "#6ee49a", fontSize: "10px" }}>👤 {nombre}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {flash && <div style={{ color: flash.startsWith("✓") ? "#6ee49a" : "#f1948a", fontSize: "11px" }}>{flash}</div>}
          {saving && <div style={{ color: "#aaa", fontSize: "10px" }}>Guardando...</div>}
          <button
            onClick={() => { localStorage.removeItem(EMPLEADO_KEY); setNombre(""); }}
            style={{ background: "none", border: "1px solid #3a6a4a", borderRadius: "6px", color: "#6a9a7e", cursor: "pointer", fontSize: "10px", padding: "4px 10px", fontFamily: mono }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #e0f0e6", margin: "6px 0 4px" }}>
        <button style={tabBtn(tab === 0)} onClick={() => setTab(0)}>💵 Efectivo</button>
        <button style={tabBtn(tab === 1)} onClick={() => setTab(1)}>🏦 Banco</button>
        <button style={tabBtn(tab === 2)} onClick={() => setTab(2)}>🧾 Ventas</button>
      </div>

      <div style={{ padding: "6px 16px 32px" }}>

        {/* CAJA EFECTIVO / BANCO (shared UI) */}
        {(tab === 0 || tab === 1) && (
          <>
            <div style={cardSt}>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a3a25", marginBottom: "16px" }}>
                Nuevo movimiento — {tab === 0 ? "Efectivo" : "Banco"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                <div>
                  {lbl("Concepto / Descripción")}
                  <input value={concepto} onChange={e => setConcepto(e.target.value)} onKeyDown={e => e.key === "Enter" && addMovimiento(tab === 0 ? "caja" : "banco")} placeholder="Ej: Venta efectivo, Pago proveedor..." style={inputSt} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    {lbl("↑ Ingreso $")}
                    <input type="number" value={ingreso} onChange={e => setIngreso(e.target.value)} placeholder="0" style={{ ...inputSt, color: GREEN, fontWeight: "600" }} />
                  </div>
                  <div>
                    {lbl("↓ Egreso $")}
                    <input type="number" value={egreso} onChange={e => setEgreso(e.target.value)} placeholder="0" style={{ ...inputSt, color: "#cc4400", fontWeight: "600" }} />
                  </div>
                </div>
                <button
                  onClick={() => addMovimiento(tab === 0 ? "caja" : "banco")}
                  disabled={saving}
                  style={{ background: GREEN, color: "#fff", border: "none", borderRadius: "9px", padding: "13px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: mono, opacity: saving ? 0.6 : 1 }}
                >
                  + Registrar movimiento
                </button>
              </div>
            </div>

            <div style={cardSt}>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a3a25", marginBottom: "12px" }}>
                Mis movimientos
                <span style={{ fontWeight: "400", fontSize: "11px", color: "#8aba9e", marginLeft: "8px" }}>
                  ({(tab === 0 ? misCaja : misBanco).length})
                </span>
              </div>
              <MovsList movs={tab === 0 ? misCaja : misBanco} tipo={tab === 0 ? "caja" : "banco"} />
            </div>
          </>
        )}

        {/* VENTAS */}
        {tab === 2 && (
          <>
            <div style={cardSt}>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a3a25", marginBottom: "16px" }}>Registrar venta</div>
              {burgers.length === 0 ? (
                <div style={{ color: "#8aba9e", fontSize: "12px", textAlign: "center", padding: "16px 0" }}>No hay hamburguesas cargadas</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                  <div>
                    {lbl("Hamburguesa")}
                    <select value={burgerId} onChange={e => setBurgerId(e.target.value)} style={inputSt}>
                      <option value="">Seleccionar...</option>
                      {burgers.map(b => (
                        <option key={b.id} value={b.id}>{b.nombre} — {fmt(b.precio_venta)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    {lbl("Cantidad")}
                    <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} style={inputSt} />
                  </div>
                  {selectedBurger && (
                    <div style={{ background: "#f0f9f2", borderRadius: "8px", padding: "11px 14px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#5a8a6e" }}>
                      <span>Precio unit: <strong style={{ color: GREEN }}>{fmt(selectedBurger.precio_venta)}</strong></span>
                      <span>Subtotal: <strong style={{ color: GREEN }}>{fmt(selectedBurger.precio_venta * Number(cantidad || 0))}</strong></span>
                    </div>
                  )}
                  <button
                    onClick={addVenta}
                    disabled={saving || !burgerId}
                    style={{ background: GREEN, color: "#fff", border: "none", borderRadius: "9px", padding: "13px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: mono, opacity: (saving || !burgerId) ? 0.6 : 1 }}
                  >
                    + Registrar venta
                  </button>
                </div>
              )}
            </div>

            <div style={cardSt}>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a3a25", marginBottom: "12px" }}>
                Mis ventas
                <span style={{ fontWeight: "400", fontSize: "11px", color: "#8aba9e", marginLeft: "8px" }}>({misVentas.length})</span>
              </div>
              {misVentas.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#8aba9e", fontSize: "12px", fontFamily: mono }}>Sin ventas registradas</div>
              ) : (
                <>
                  {[...misVentas].reverse().map(v => (
                    <div key={v.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 0", borderBottom: "1px solid #e8f5ec" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", color: "#1a3a25", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.burger_nombre}</div>
                        <div style={{ fontSize: "10px", color: "#8aba9e" }}>{v.fecha} · ×{v.cantidad}</div>
                      </div>
                      <div style={{ color: GREEN, fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>{fmt(v.precio_unit * v.cantidad)}</div>
                      <button onClick={() => delVenta(v.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: "16px", padding: "0 3px", flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
