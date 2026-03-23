import { useState, useEffect, useRef } from "react";

const LS_ZONA_KEY = "rb-zona-delivery";
const LS_MENU_KEY = "rb-menu-publico";

function loadZonaAdmin() {
  try { return JSON.parse(localStorage.getItem(LS_ZONA_KEY)) || []; } catch { return []; }
}
function saveZonaAdmin(z) { localStorage.setItem(LS_ZONA_KEY, JSON.stringify(z)); }
function loadMenuAdmin() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_MENU_KEY));
    return saved || { hamburguesas: [], extras: [], bebidas: [] };
  } catch { return { hamburguesas: [], extras: [], bebidas: [] }; }
}
function saveMenuAdmin(m) { localStorage.setItem(LS_MENU_KEY, JSON.stringify(m)); }

const categorias = [
  { key: "hamburguesas", label: "Hamburguesas", icon: "🍔" },
  { key: "extras",       label: "Extras",       icon: "🍟" },
  { key: "bebidas",      label: "Bebidas",       icon: "🥤" },
];

const btnStyle = (color = "#1a7a3a") => ({
  background: color, color: "#fff", border: "none", borderRadius: "6px",
  padding: "6px 12px", cursor: "pointer", fontWeight: "700", fontSize: "12px",
});
const inputSt = {
  border: "1px solid #ccc", borderRadius: "6px", padding: "8px 10px",
  fontSize: "13px", outline: "none",
};

export default function PedidosOnlineTab() {
  const [subtab, setSubtab] = useState(0);
  const [menu, setMenu] = useState(loadMenuAdmin);
  const [zona, setZona] = useState(loadZonaAdmin);
  const [nuevoItem, setNuevoItem] = useState({ nombre: "", descripcion: "", precio: "", categoria: "hamburguesas" });
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const drawnRef = useRef(null);

  function agregarItem() {
    if (!nuevoItem.nombre.trim()) return;
    const item = {
      id: Date.now(),
      nombre: nuevoItem.nombre.trim(),
      descripcion: nuevoItem.descripcion.trim(),
      precio: parseFloat(nuevoItem.precio) || 0,
      disponible: true,
    };
    const newMenu = { ...menu, [nuevoItem.categoria]: [...(menu[nuevoItem.categoria] || []), item] };
    setMenu(newMenu);
    saveMenuAdmin(newMenu);
    setNuevoItem(p => ({ ...p, nombre: "", descripcion: "", precio: "" }));
  }

  function toggleDisponible(cat, id) {
    const newMenu = { ...menu, [cat]: menu[cat].map(i => i.id === id ? { ...i, disponible: !i.disponible } : i) };
    setMenu(newMenu);
    saveMenuAdmin(newMenu);
  }

  function eliminarItem(cat, id) {
    const newMenu = { ...menu, [cat]: menu[cat].filter(i => i.id !== id) };
    setMenu(newMenu);
    saveMenuAdmin(newMenu);
  }

  function editarPrecio(cat, id, precio) {
    const newMenu = { ...menu, [cat]: menu[cat].map(i => i.id === id ? { ...i, precio: parseFloat(precio) || 0 } : i) };
    setMenu(newMenu);
    saveMenuAdmin(newMenu);
  }

  useEffect(() => {
    if (subtab !== 1 || !mapRef.current || leafletRef.current) return;
    import("leaflet").then(Lmod => {
      const L = Lmod.default || Lmod;
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      const map = L.map(mapRef.current).setView([-31.42, -64.18], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const zonaActual = loadZonaAdmin();
      if (zonaActual.length > 2) {
        L.polygon(zonaActual, { color: "#1a7a3a", fillColor: "#1a7a3a", fillOpacity: 0.2, weight: 2 }).addTo(map);
      }

      const puntos = [];
      const markers = [];
      let polyLine = null;

      map.on("click", e => {
        const { lat, lng } = e.latlng;
        puntos.push([lat, lng]);
        const m = L.circleMarker([lat, lng], { radius: 5, color: "#1a7a3a", fillColor: "#1a7a3a", fillOpacity: 1 }).addTo(map);
        markers.push(m);
        if (polyLine) polyLine.remove();
        if (puntos.length > 1) {
          polyLine = L.polyline([...puntos, puntos[0]], { color: "#1a7a3a", weight: 2 }).addTo(map);
        }
      });

      drawnRef.current = { puntos, markers, map, getLine: () => polyLine };
      leafletRef.current = map;
    });
    return () => {
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; drawnRef.current = null; }
    };
  }, [subtab]);

  function guardarZona() {
    const dl = drawnRef.current;
    if (!dl || dl.puntos.length < 3) { alert("Marcá al menos 3 puntos en el mapa"); return; }
    const newZona = [...dl.puntos];
    setZona(newZona);
    saveZonaAdmin(newZona);
    alert("Zona guardada correctamente");
  }

  function limpiarZona() {
    const dl = drawnRef.current;
    if (dl) {
      dl.markers.forEach(m => m.remove());
      dl.markers.length = 0;
      dl.puntos.length = 0;
      const pl = dl.getLine();
      if (pl) pl.remove();
    }
    setZona([]);
    saveZonaAdmin([]);
  }

  const cardStyle = {
    background: "#fff", border: "1px solid #d4edd9", borderRadius: "10px",
    padding: "14px 16px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px",
  };

  const urlPedido = `${window.location.origin}/pedido`;

  return (
    <div>
      {/* Link público */}
      <div style={{ background: "#e8f5ec", border: "1px solid #a8d5b5", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px" }}>
        <div style={{ fontWeight: "700", fontSize: "13px", color: "#1a3a25", marginBottom: "6px" }}>🔗 Link público para clientes</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <code style={{ background: "#fff", border: "1px solid #c0dcc8", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", color: "#1a7a3a", flex: 1, wordBreak: "break-all" }}>
            {urlPedido}
          </code>
          <button style={btnStyle()} onClick={() => navigator.clipboard.writeText(urlPedido)}>Copiar</button>
          <button style={btnStyle("#2563eb")} onClick={() => window.open(urlPedido, "_blank")}>Abrir</button>
        </div>
        <div style={{ fontSize: "11px", color: "#5a8a6a", marginTop: "6px" }}>Compartí este link con tus clientes para que puedan hacer pedidos</div>
      </div>

      {/* Subtabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["📋 Menú", "🗺️ Zona de Delivery"].map((t, i) => (
          <button key={i} onClick={() => setSubtab(i)} style={{
            padding: "8px 16px", borderRadius: "8px", border: "1px solid",
            borderColor: subtab === i ? "#1a7a3a" : "#ccc",
            background: subtab === i ? "#1a7a3a" : "#fff",
            color: subtab === i ? "#fff" : "#555",
            fontWeight: "700", fontSize: "13px", cursor: "pointer",
          }}>{t}</button>
        ))}
      </div>

      {/* ── MENÚ ── */}
      {subtab === 0 && (
        <div>
          <div style={{ background: "#fff", border: "1px solid #d4edd9", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
            <div style={{ fontWeight: "700", fontSize: "13px", marginBottom: "12px", color: "#1a3a25" }}>+ Agregar producto</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: "2 1 160px" }}>
                <span style={{ fontSize: "11px", color: "#666" }}>Nombre *</span>
                <input style={inputSt} placeholder="Ej: Clásica Doble" value={nuevoItem.nombre} onChange={e => setNuevoItem(p => ({ ...p, nombre: e.target.value }))} onKeyDown={e => e.key === "Enter" && agregarItem()} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: "3 1 200px" }}>
                <span style={{ fontSize: "11px", color: "#666" }}>Descripción</span>
                <input style={inputSt} placeholder="Ingredientes, detalles..." value={nuevoItem.descripcion} onChange={e => setNuevoItem(p => ({ ...p, descripcion: e.target.value }))} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: "1 1 100px" }}>
                <span style={{ fontSize: "11px", color: "#666" }}>Precio ($)</span>
                <input style={inputSt} type="number" placeholder="0" value={nuevoItem.precio} onChange={e => setNuevoItem(p => ({ ...p, precio: e.target.value }))} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: "1 1 130px" }}>
                <span style={{ fontSize: "11px", color: "#666" }}>Categoría</span>
                <select style={inputSt} value={nuevoItem.categoria} onChange={e => setNuevoItem(p => ({ ...p, categoria: e.target.value }))}>
                  {categorias.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <button style={{ ...btnStyle(), padding: "9px 18px", fontSize: "13px" }} onClick={agregarItem}>Agregar</button>
            </div>
          </div>

          {categorias.map(cat => (
            <div key={cat.key} style={{ marginBottom: "24px" }}>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a3a25", marginBottom: "10px" }}>
                {cat.icon} {cat.label} <span style={{ fontWeight: "400", color: "#888", fontSize: "12px" }}>({(menu[cat.key] || []).length})</span>
              </div>
              {(menu[cat.key] || []).length === 0 && <div style={{ color: "#aaa", fontSize: "13px", paddingBottom: "8px" }}>Sin productos aún</div>}
              {(menu[cat.key] || []).map(item => (
                <div key={item.id} style={{ ...cardStyle, opacity: item.disponible ? 1 : 0.5 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "14px" }}>{item.nombre}</div>
                    {item.descripcion && <div style={{ fontSize: "12px", color: "#666" }}>{item.descripcion}</div>}
                  </div>
                  <input type="number" style={{ ...inputSt, width: "110px", textAlign: "right" }} value={item.precio} onChange={e => editarPrecio(cat.key, item.id, e.target.value)} />
                  <span style={{ fontSize: "11px", color: "#888" }}>$</span>
                  <button style={btnStyle(item.disponible ? "#f59e0b" : "#1a7a3a")} onClick={() => toggleDisponible(cat.key, item.id)}>
                    {item.disponible ? "Ocultar" : "Mostrar"}
                  </button>
                  <button style={btnStyle("#dc2626")} onClick={() => eliminarItem(cat.key, item.id)}>Eliminar</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── ZONA ── */}
      {subtab === 1 && (
        <div>
          <div style={{ background: "#e8f5ec", border: "1px solid #a8d5b5", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", fontSize: "13px", color: "#1a3a25" }}>
            <strong>Cómo definir la zona:</strong> Hacé click en el mapa para marcar los puntos que delimitan tu área de delivery. Cuando termines, guardá.
            {zona.length > 2 && <span style={{ color: "#1a7a3a", fontWeight: "700" }}> ✅ Zona guardada ({zona.length} puntos).</span>}
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <button style={btnStyle()} onClick={guardarZona}>✅ Guardar zona</button>
            <button style={btnStyle("#dc2626")} onClick={limpiarZona}>🗑 Limpiar y redibujar</button>
          </div>
          <div ref={mapRef} style={{ height: "450px", borderRadius: "10px", overflow: "hidden", border: "1px solid #d4edd9" }} />
        </div>
      )}
    </div>
  );
}
