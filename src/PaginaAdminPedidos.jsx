import { useState, useRef, useEffect } from "react";

const LS_SESSION = "rb-admin-session";
const LS_MENU    = "rb-menu-publico";
const LS_ZONA    = "rb-zona-delivery";
const ADMIN_PASS = "Marcelo52";

function loadMenu() {
  try { return JSON.parse(localStorage.getItem(LS_MENU)) || { hamburguesas: [], extras: [], bebidas: [] }; }
  catch { return { hamburguesas: [], extras: [], bebidas: [] }; }
}
function saveMenu(m) { localStorage.setItem(LS_MENU, JSON.stringify(m)); }
function loadZona() {
  try { return JSON.parse(localStorage.getItem(LS_ZONA)) || []; } catch { return []; }
}
function saveZona(z) { localStorage.setItem(LS_ZONA, JSON.stringify(z)); }

const G = {
  page:   { minHeight: "100vh", background: "#f4f7f5", fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column" },
  header: { background: "#1a3a25", color: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  title:  { fontSize: 20, fontWeight: 900, color: "#a8e6bc" },
  card:   { background: "#fff", border: "1px solid #d0e8d8", borderRadius: 12, padding: "14px 16px", marginBottom: 10 },
  input:  { border: "1px solid #ccc", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" },
  btn:    (bg = "#1a7a3a", txt = "#fff") => ({ background: bg, color: txt, border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }),
};

const NAV_ITEMS = [
  { icon: "🍔", label: "Hamburguesas" },
  { icon: "🍟", label: "Extras" },
  { icon: "🥤", label: "Bebidas" },
  { icon: "🗺️", label: "Zona Delivery" },
];

// ── Login ──────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState(false);
  function intentar() {
    if (pass === ADMIN_PASS) { localStorage.setItem(LS_SESSION, "1"); onLogin(); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  }
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a3a25" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 340, textAlign: "center", boxShadow: "0 8px 40px #0004" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🍔</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#1a3a25", marginBottom: 4 }}>Roses Burgers</div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>Panel de administración</div>
        <input type="password" autoFocus
          style={{ ...G.input, width: "100%", textAlign: "center", fontSize: 15, padding: "12px", marginBottom: 12 }}
          placeholder="Contraseña" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && intentar()} />
        {err && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 10 }}>Contraseña incorrecta</div>}
        <button onClick={intentar} style={{ ...G.btn(), width: "100%", padding: "12px", fontSize: 15 }}>Entrar</button>
      </div>
    </div>
  );
}

// ── Sección items ──────────────────────────────────────────────────
function SeccionItems({ titulo, icon, items, onUpdate }) {
  const [nuevo, setNuevo] = useState({ nombre: "", descripcion: "", precio: "" });

  function set(id, campo, valor) {
    onUpdate(items.map(i => i.id === id ? { ...i, [campo]: valor } : i));
  }
  function agregar() {
    if (!nuevo.nombre.trim()) return;
    onUpdate([...items, { id: Date.now(), nombre: nuevo.nombre.trim(), descripcion: nuevo.descripcion.trim(), precio: parseFloat(nuevo.precio) || 0, disponible: true }]);
    setNuevo({ nombre: "", descripcion: "", precio: "" });
  }
  function eliminar(id) {
    if (!confirm("¿Eliminar este item?")) return;
    onUpdate(items.filter(i => i.id !== id));
  }

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#1a3a25", marginBottom: 16 }}>{icon} {titulo}</div>

      {/* Agregar nuevo */}
      <div style={{ ...G.card, background: "#f0fdf4", border: "1px solid #86efac", marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#1a3a25", marginBottom: 10 }}>+ Agregar nuevo</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <input style={{ ...G.input, flex: "2 1 160px" }} placeholder="Nombre *"
            value={nuevo.nombre} onChange={e => setNuevo(p => ({ ...p, nombre: e.target.value }))} onKeyDown={e => e.key === "Enter" && agregar()} />
          <input style={{ ...G.input, flex: "2 1 160px" }} placeholder="Descripción (opcional)"
            value={nuevo.descripcion} onChange={e => setNuevo(p => ({ ...p, descripcion: e.target.value }))} />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#888" }}>$</span>
            <input type="number" style={{ ...G.input, width: 100, textAlign: "right" }} placeholder="Precio"
              value={nuevo.precio} onChange={e => setNuevo(p => ({ ...p, precio: e.target.value }))} />
          </div>
          <button style={G.btn()} onClick={agregar}>✅ Agregar</button>
        </div>
      </div>

      {/* Lista */}
      {items.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa", fontSize: 14 }}>No hay items — agregá uno arriba</div>
      )}
      {items.map(item => (
        <div key={item.id} style={{ ...G.card, opacity: item.disponible ? 1 : 0.55 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "2 1 160px", display: "flex", flexDirection: "column", gap: 6 }}>
              <input style={{ ...G.input, width: "100%", fontWeight: 700, fontSize: 14 }}
                value={item.nombre} onChange={e => set(item.id, "nombre", e.target.value)} />
              <input style={{ ...G.input, width: "100%", fontSize: 12, color: "#555" }}
                value={item.descripcion || ""} onChange={e => set(item.id, "descripcion", e.target.value)} placeholder="Descripción..." />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12, color: "#888" }}>$</span>
              <input type="number" style={{ ...G.input, width: 110, textAlign: "right" }}
                value={item.precio} onChange={e => set(item.id, "precio", parseFloat(e.target.value) || 0)} />
            </div>
            <button style={G.btn(item.disponible ? "#f59e0b" : "#1a7a3a")} onClick={() => set(item.id, "disponible", !item.disponible)}>
              {item.disponible ? "Ocultar" : "Mostrar"}
            </button>
            <button style={G.btn("#dc2626")} onClick={() => eliminar(item.id)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Mapa zona delivery ─────────────────────────────────────────────
function MapaAdmin({ zona, onGuardar, onLimpiar }) {
  const ref      = useRef(null);
  const mapRef   = useRef(null);
  const drawnRef = useRef(null);

  function initMap(el) {
    if (!el || mapRef.current) return;
    import("leaflet").then(Lmod => {
      const L = Lmod.default || Lmod;
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css"; link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      const map = L.map(el).setView([-32.94, -60.70], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);
      if (zona.length > 2) { L.polygon(zona, { color: "#1a7a3a", fillColor: "#1a7a3a", fillOpacity: 0.15, weight: 2 }).addTo(map); map.fitBounds(zona); }
      const puntos = [], markers = [];
      let polyLine = null;
      map.on("click", e => {
        puntos.push([e.latlng.lat, e.latlng.lng]);
        markers.push(L.circleMarker([e.latlng.lat, e.latlng.lng], { radius: 5, color: "#1a7a3a", fillOpacity: 1 }).addTo(map));
        if (polyLine) polyLine.remove();
        if (puntos.length > 1) polyLine = L.polyline([...puntos, puntos[0]], { color: "#1a7a3a", weight: 2 }).addTo(map);
      });
      drawnRef.current = { puntos, markers, getLine: () => polyLine };
      mapRef.current = map;
    });
  }

  function guardar() {
    const dl = drawnRef.current;
    if (!dl || dl.puntos.length < 3) { alert("Marcá al menos 3 puntos en el mapa"); return; }
    onGuardar([...dl.puntos]);
  }
  function limpiar() {
    const dl = drawnRef.current;
    if (dl) { dl.markers.forEach(m => m.remove()); dl.markers.length = 0; dl.puntos.length = 0; const pl = dl.getLine(); if (pl) pl.remove(); }
    onLimpiar();
  }

  return (
    <div>
      <div style={{ background: "#e8f5ec", border: "1px solid #a8d5b5", borderRadius: 10, padding: "12px 16px", marginBottom: 14, fontSize: 13, color: "#1a3a25" }}>
        <strong>Cómo usar:</strong> Hacé click en el mapa para marcar los puntos del área de delivery.
        {zona.length > 2 && <span style={{ color: "#1a7a3a", fontWeight: 700 }}> ✅ Zona guardada ({zona.length} puntos).</span>}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button style={G.btn()} onClick={guardar}>✅ Guardar zona</button>
        <button style={G.btn("#dc2626")} onClick={limpiar}>🗑 Limpiar</button>
      </div>
      <div ref={el => initMap(el)} style={{ height: 460, borderRadius: 12, overflow: "hidden", border: "1px solid #d4edd9" }} />
    </div>
  );
}

// ── Panel principal ────────────────────────────────────────────────
export default function PaginaAdminPedidos() {
  const [logueado, setLogueado] = useState(() => localStorage.getItem(LS_SESSION) === "1");
  const [tab, setTab]           = useState(0);
  const [flashOk, setFlashOk]   = useState(false);

  const [menu, setMenu] = useState(loadMenu);
  const [zona, setZona] = useState(loadZona);

  function guardarMenu(nuevoMenu) {
    const m = nuevoMenu || menu;
    saveMenu(m);
    setFlashOk(true);
    setTimeout(() => setFlashOk(false), 2500);
  }

  function updateCategoria(cat, items) {
    const nuevo = { ...menu, [cat]: items };
    setMenu(nuevo);
  }

  function guardarZona(z) {
    setZona(z);
    saveZona(z);
    alert("✅ Zona guardada");
  }

  if (!logueado) return <Login onLogin={() => setLogueado(true)} />;

  const urlCliente = `${window.location.origin}/pedido`;

  return (
    <div style={G.page}>
      {/* Header */}
      <div style={G.header}>
        <div>
          <div style={G.title}>🍔 Roses Burgers — Admin</div>
          <div style={{ fontSize: 12, color: "#6ab88a", marginTop: 2 }}>Panel de pedidos online</div>
        </div>
        <button onClick={() => { localStorage.removeItem(LS_SESSION); setLogueado(false); }} style={{ ...G.btn("#ffffff22", "#fff"), fontSize: 12 }}>
          Cerrar sesión
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Sidebar */}
        <div style={{ width: 210, background: "#1e4530", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Link cliente */}
          <div style={{ padding: "16px 14px", borderBottom: "1px solid #2d5a40" }}>
            <div style={{ fontSize: 11, color: "#6ab88a", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Link clientes</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ ...G.btn("#2d6a45", "#a8e6bc"), fontSize: 11, flex: 1, padding: "7px 8px" }} onClick={() => navigator.clipboard.writeText(urlCliente)}>📋 Copiar</button>
              <button style={{ ...G.btn("#2563eb"), fontSize: 11, flex: 1, padding: "7px 8px" }} onClick={() => window.open(urlCliente, "_blank")}>🔍 Ver</button>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "10px 0" }}>
            {NAV_ITEMS.map((item, i) => (
              <button key={i} onClick={() => setTab(i)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 18px",
                background: tab === i ? "#1a7a3a" : "transparent",
                color: tab === i ? "#fff" : "#a8c8b4",
                border: "none", cursor: "pointer", fontSize: 14,
                fontWeight: tab === i ? 700 : 400, textAlign: "left",
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ padding: "14px", borderTop: "1px solid #2d5a40" }}>
            <button onClick={() => window.open(urlCliente, "_blank")}
              style={{ width: "100%", padding: "9px", borderRadius: 8, border: "1px solid #3d6a50", cursor: "pointer", background: "transparent", color: "#a8c8b4", fontWeight: 700, fontSize: 12 }}>
              🔍 Abrir en modo prueba
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {flashOk && (
            <div style={{ background: "#e8f5ec", border: "1px solid #1a7a3a", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontWeight: 700, color: "#1a7a3a", fontSize: 13 }}>
              ✅ Cambios guardados — ya los ven todos los clientes
            </div>
          )}

          {tab !== 3 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={() => guardarMenu()} style={{ ...G.btn(), padding: "10px 24px", fontSize: 14 }}>
                💾 Guardar cambios
              </button>
            </div>
          )}

          {tab === 0 && <SeccionItems titulo="Hamburguesas" icon="🍔" items={menu.hamburguesas || []} onUpdate={items => updateCategoria("hamburguesas", items)} />}
          {tab === 1 && <SeccionItems titulo="Extras y guarniciones" icon="🍟" items={menu.extras || []} onUpdate={items => updateCategoria("extras", items)} />}
          {tab === 2 && <SeccionItems titulo="Bebidas" icon="🥤" items={menu.bebidas || []} onUpdate={items => updateCategoria("bebidas", items)} />}
          {tab === 3 && <MapaAdmin zona={zona} onGuardar={guardarZona} onLimpiar={() => { setZona([]); saveZona([]); }} />}
        </div>
      </div>
    </div>
  );
}
