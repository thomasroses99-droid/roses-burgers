import { useState, useEffect, useRef } from "react";

// ─── Configuración ───────────────────────────────────────────────
const WA_NUMBER = "543417408076";
const NOMBRE_LOCAL = "Roses Burgers";

const ZONAS_ENVIO = [
  { id: "fisherton", label: "Fisherton", precio: 2500 },
  { id: "funes",     label: "Funes",     precio: 3000 },
];

const BURGER_IMAGES = {
  "Cheeseburger":  "/images/burgers/cheeseburger.jpg",
  "Roses":         "/images/burgers/roses.jpg",
  "1967":          "/images/burgers/1967.jpg",
  "Classic":       "/images/burgers/classic.jpg",
  "Cheese Onion":  "/images/burgers/cheese-onion.jpg",
  "Cowboy":        "/images/burgers/cowboy.jpg",
  "Smokey Bacon":  "/images/burgers/smokey-bacon.jpg",
  "Blue Cheese":   "/images/burgers/blue-cheese.jpg",
  "Stacked Onion": "/images/burgers/stacked-onion.jpg",
  "Cheese Bacon":  "/images/burgers/cheese-bacon.jpg",
  "Biggie Burger": "/images/burgers/biggie-burger.jpg",
  "Crispy Garlic": "/images/burgers/crispy-garlic.jpg",
  "Ruby Clove":    "/images/burgers/ruby-clove.jpg",
};

// Zona de delivery por defecto (polígono vacío → admin debe configurarla)
const LS_ZONA_KEY = "rb-zona-delivery";
const LS_MENU_KEY = "rb-menu-publico";

function loadZona() {
  try { return JSON.parse(localStorage.getItem(LS_ZONA_KEY)) || []; } catch { return []; }
}
function loadMenu() {
  try { return JSON.parse(localStorage.getItem(LS_MENU_KEY)) || menuDefault; } catch { return menuDefault; }
}

// Menú por defecto hasta que el admin cargue el real
const menuDefault = {
  hamburguesas: [
    { id: 1, nombre: "Clásica", descripcion: "Medallón de carne, lechuga, tomate, cebolla", precio: 0, disponible: true },
    { id: 2, nombre: "Doble", descripcion: "Doble medallón de carne, queso cheddar", precio: 0, disponible: true },
  ],
  extras: [
    { id: 101, nombre: "Papas fritas", precio: 0, disponible: true },
    { id: 102, nombre: "Bebida", precio: 0, disponible: true },
  ],
  bebidas: [],
};

// ─── Utilidades ──────────────────────────────────────────────────
function puntoDentroDePoligono(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    if ((yi > lng) !== (yj > lng) && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

async function geocodificarDireccion(direccion) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "es" } });
  const data = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
}

// ─── Estilos ─────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "#0f0f0f",
    color: "#f0f0f0",
    fontFamily: "'Segoe UI', sans-serif",
    paddingBottom: "120px",
  },
  header: {
    background: "#1a1a1a",
    borderBottom: "3px solid #e8b84b",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#e8b84b",
    letterSpacing: "-1px",
  },
  subtitle: { fontSize: "12px", color: "#888", marginTop: "2px" },
  section: { padding: "20px 16px 0" },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#e8b84b",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "12px",
    borderBottom: "1px solid #2a2a2a",
    paddingBottom: "6px",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  cardSelected: { borderColor: "#e8b84b", background: "#1f1c0f" },
  itemName: { fontWeight: "700", fontSize: "15px" },
  itemDesc: { fontSize: "12px", color: "#888", marginTop: "2px" },
  itemPrice: { fontWeight: "700", color: "#e8b84b", fontSize: "15px", marginLeft: "auto", whiteSpace: "nowrap" },
  counter: { display: "flex", alignItems: "center", gap: "10px" },
  btn: {
    width: "30px", height: "30px", borderRadius: "50%",
    border: "1px solid #e8b84b", background: "transparent",
    color: "#e8b84b", fontWeight: "900", fontSize: "18px",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  qty: { fontWeight: "700", fontSize: "15px", minWidth: "20px", textAlign: "center" },
  input: {
    width: "100%", background: "#1a1a1a", border: "1px solid #333",
    borderRadius: "8px", padding: "12px 14px", color: "#f0f0f0",
    fontSize: "14px", boxSizing: "border-box", outline: "none",
  },
  inputFocus: { borderColor: "#e8b84b" },
  label: { fontSize: "12px", color: "#888", marginBottom: "6px", display: "block" },
  toggle: {
    display: "flex", gap: "8px", marginBottom: "16px",
  },
  toggleBtn: {
    flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #333",
    background: "#1a1a1a", color: "#888", fontWeight: "700", fontSize: "14px",
    cursor: "pointer", textAlign: "center",
  },
  toggleBtnActive: { borderColor: "#e8b84b", background: "#1f1c0f", color: "#e8b84b" },
  payBtn: {
    flex: 1, padding: "10px 6px", borderRadius: "8px", border: "1px solid #333",
    background: "#1a1a1a", color: "#888", fontWeight: "600", fontSize: "12px",
    cursor: "pointer", textAlign: "center",
  },
  payBtnActive: { borderColor: "#e8b84b", background: "#1f1c0f", color: "#e8b84b" },
  waBtn: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    background: "#25d366", border: "none",
    padding: "18px 20px", cursor: "pointer",
    fontWeight: "900", fontSize: "16px", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
    zIndex: 200,
  },
  waBtnDisabled: { background: "#2a2a2a", color: "#555", cursor: "not-allowed" },
  badge: {
    background: "#e8b84b", color: "#000", borderRadius: "50%",
    width: "22px", height: "22px", display: "inline-flex",
    alignItems: "center", justifyContent: "center",
    fontWeight: "900", fontSize: "12px", marginLeft: "6px",
  },
  alert: {
    padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
    marginTop: "8px", fontWeight: "600",
  },
  alertOk: { background: "#0f2e1a", border: "1px solid #1a7a3a", color: "#6ee49a" },
  alertErr: { background: "#2e0f0f", border: "1px solid #7a1a1a", color: "#e49a9a" },
  alertWarn: { background: "#2e2200", border: "1px solid #7a5a00", color: "#e4c96a" },
  notas: {
    width: "100%", background: "#1a1a1a", border: "1px solid #333",
    borderRadius: "8px", padding: "12px 14px", color: "#f0f0f0",
    fontSize: "14px", boxSizing: "border-box", outline: "none",
    resize: "vertical", minHeight: "70px",
  },
};

// ─── Mapa con Leaflet ─────────────────────────────────────────────
function MapaDelivery({ coords, zona, onMapReady }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    import("leaflet").then(L => {
      L = L.default || L;
      // CSS de Leaflet
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      const map = L.map(ref.current).setView(
        coords ? [coords.lat, coords.lng] : [-31.42, -64.18], 13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      if (zona && zona.length > 2) {
        L.polygon(zona.map(p => [p[0], p[1]]), {
          color: "#e8b84b", fillColor: "#e8b84b", fillOpacity: 0.15, weight: 2,
        }).addTo(map);
      }

      if (coords) {
        const icon = L.divIcon({
          html: '<div style="background:#e8b84b;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px #0008"></div>',
          className: "",
          iconAnchor: [7, 7],
        });
        markerRef.current = L.marker([coords.lat, coords.lng], { icon }).addTo(map);
      }

      mapRef.current = map;
      if (onMapReady) onMapReady(map);
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // Actualizar marcador cuando cambian coords
  useEffect(() => {
    if (!mapRef.current || !coords) return;
    import("leaflet").then(L => {
      L = L.default || L;
      if (markerRef.current) markerRef.current.remove();
      const icon = L.divIcon({
        html: '<div style="background:#e8b84b;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px #0008"></div>',
        className: "",
        iconAnchor: [7, 7],
      });
      markerRef.current = L.marker([coords.lat, coords.lng], { icon }).addTo(mapRef.current);
      mapRef.current.setView([coords.lat, coords.lng], 15);
    });
  }, [coords]);

  return (
    <div ref={ref} style={{ height: "220px", borderRadius: "10px", overflow: "hidden", border: "1px solid #333", marginTop: "10px" }} />
  );
}

// ─── Componente principal ─────────────────────────────────────────
export default function PaginaPedido() {
  const [menu] = useState(loadMenu);
  const [zona] = useState(loadZona);
  const [carrito, setCarrito] = useState({}); // { id: qty }
  const [tipo, setTipo] = useState("delivery"); // "delivery" | "retiro"
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [geoCoords, setGeoCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState(null); // null | "ok" | "err" | "fuera" | "buscando"
  const [zonaEnvio, setZonaEnvio] = useState("");
  const [pago, setPago] = useState("");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const geoTimer = useRef(null);

  const todasItems = [
    ...(menu.hamburguesas || []),
    ...(menu.extras || []),
    ...(menu.bebidas || []),
  ];

  const totalItems = Object.values(carrito).reduce((a, b) => a + b, 0);
  const totalProductos = Object.entries(carrito).reduce((sum, [id, qty]) => {
    const item = todasItems.find(i => String(i.id) === String(id));
    return sum + (item ? item.precio * qty : 0);
  }, 0);
  const costoEnvio = tipo === "delivery" ? (ZONAS_ENVIO.find(z => z.id === zonaEnvio)?.precio || 0) : 0;
  const totalPrecio = totalProductos + costoEnvio;

  function cambiarQty(id, delta) {
    setCarrito(prev => {
      const cur = prev[id] || 0;
      const next = Math.max(0, cur + delta);
      if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  }

  // Geocodificación con debounce
  useEffect(() => {
    if (tipo !== "delivery" || !direccion.trim() || direccion.trim().length < 8) {
      setGeoCoords(null);
      setGeoStatus(null);
      return;
    }
    setGeoStatus("buscando");
    clearTimeout(geoTimer.current);
    geoTimer.current = setTimeout(async () => {
      try {
        const coords = await geocodificarDireccion(direccion);
        if (!coords) { setGeoStatus("err"); setGeoCoords(null); return; }
        setGeoCoords(coords);
        if (zona.length > 2) {
          const dentro = puntoDentroDePoligono(coords.lat, coords.lng, zona);
          setGeoStatus(dentro ? "ok" : "fuera");
        } else {
          setGeoStatus("ok"); // Sin zona configurada: acepta todo
        }
      } catch { setGeoStatus("err"); setGeoCoords(null); }
    }, 1000);
    return () => clearTimeout(geoTimer.current);
  }, [direccion, tipo, zona]);

  const pedidoValido = (() => {
    if (totalItems === 0) return false;
    if (!nombre.trim()) return false;
    if (!pago) return false;
    if (tipo === "delivery") {
      if (!direccion.trim()) return false;
      if (!zonaEnvio) return false;
      if (geoStatus === "fuera") return false;
      if (geoStatus === "buscando") return false;
    }
    return true;
  })();

  function generarMensajeWA() {
    const lineas = ["🍔 *NUEVO PEDIDO - Roses Burgers*", ""];

    // Items
    lineas.push("📋 *PEDIDO:*");
    for (const [id, qty] of Object.entries(carrito)) {
      const item = todasItems.find(i => String(i.id) === String(id));
      if (item) {
        const precio = item.precio > 0 ? ` ($${item.precio.toLocaleString("es-AR")})` : "";
        lineas.push(`• ${qty}x ${item.nombre}${precio}`);
      }
    }

    lineas.push("");
    lineas.push(`👤 *Cliente:* ${nombre}`);
    lineas.push(`📦 *Tipo:* ${tipo === "delivery" ? "🛵 Delivery" : "🏠 Retiro en local"}`);

    if (tipo === "delivery") {
      const zona = ZONAS_ENVIO.find(z => z.id === zonaEnvio);
      lineas.push(`📍 *Dirección:* ${direccion}`);
      if (zona) lineas.push(`📌 *Zona:* ${zona.label} (envío $${zona.precio.toLocaleString("es-AR")})`);
    }

    lineas.push(`💳 *Pago:* ${pago}`);

    if (notas.trim()) {
      lineas.push(`📝 *Notas:* ${notas.trim()}`);
    }

    if (totalPrecio > 0) {
      lineas.push("");
      lineas.push(`💰 *Total: $${totalPrecio.toLocaleString("es-AR")}*`);
    }

    return lineas.join("\n");
  }

  function confirmarPedido() {
    if (!pedidoValido || enviando) return;
    setEnviando(true);
    const msg = generarMensajeWA();
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setTimeout(() => setEnviando(false), 2000);
  }

  const pagoOpciones = ["Efectivo", "Transferencia", "Link de pago"];

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.logo}>{NOMBRE_LOCAL}</div>
          <div style={S.subtitle}>Hacé tu pedido online</div>
        </div>
        {totalItems > 0 && (
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ color: "#e8b84b", fontWeight: "900", fontSize: "18px" }}>
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </div>
            {totalPrecio > 0 && (
              <div style={{ color: "#888", fontSize: "12px" }}>${totalPrecio.toLocaleString("es-AR")}</div>
            )}
          </div>
        )}
      </div>

      {/* ── Hamburguesas ── */}
      {menu.hamburguesas?.filter(i => i.disponible).length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>🍔 Hamburguesas</div>
          {menu.hamburguesas.filter(i => i.disponible).map(item => (
            <ItemCard key={item.id} item={item} qty={carrito[item.id] || 0} onChange={d => cambiarQty(item.id, d)} />
          ))}
        </div>
      )}

      {/* ── Extras ── */}
      {menu.extras?.filter(i => i.disponible).length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>🍟 Extras y guarniciones</div>
          {menu.extras.filter(i => i.disponible).map(item => (
            <ItemCard key={item.id} item={item} qty={carrito[item.id] || 0} onChange={d => cambiarQty(item.id, d)} />
          ))}
        </div>
      )}

      {/* ── Bebidas ── */}
      {menu.bebidas?.filter(i => i.disponible).length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>🥤 Bebidas</div>
          {menu.bebidas.filter(i => i.disponible).map(item => (
            <ItemCard key={item.id} item={item} qty={carrito[item.id] || 0} onChange={d => cambiarQty(item.id, d)} />
          ))}
        </div>
      )}

      {/* ── Datos del pedido ── */}
      {totalItems > 0 && (
        <div style={{ ...S.section, paddingTop: "24px" }}>
          <div style={S.sectionTitle}>📋 Datos del pedido</div>

          {/* Nombre */}
          <label style={S.label}>Tu nombre</label>
          <input
            style={S.input}
            placeholder="Ej: Juan García"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />

          {/* Tipo */}
          <div style={{ ...S.toggle, marginTop: "16px" }}>
            <button
              style={{ ...S.toggleBtn, ...(tipo === "delivery" ? S.toggleBtnActive : {}) }}
              onClick={() => setTipo("delivery")}
            >🛵 Delivery</button>
            <button
              style={{ ...S.toggleBtn, ...(tipo === "retiro" ? S.toggleBtnActive : {}) }}
              onClick={() => setTipo("retiro")}
            >🏠 Retiro en local</button>
          </div>

          {/* Zona de envío */}
          {tipo === "delivery" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={S.label}>Zona de envío</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {ZONAS_ENVIO.map(z => (
                  <button key={z.id}
                    style={{ ...S.toggleBtn, flex: 1, ...(zonaEnvio === z.id ? S.toggleBtnActive : {}) }}
                    onClick={() => setZonaEnvio(z.id)}>
                    {z.label}
                    <div style={{ fontSize: "11px", fontWeight: "400", marginTop: "2px", color: zonaEnvio === z.id ? "#e8b84b" : "#666" }}>
                      ${z.precio.toLocaleString("es-AR")}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dirección + Mapa */}
          {tipo === "delivery" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={S.label}>Dirección de entrega</label>
              <input
                style={S.input}
                placeholder="Ej: Av. Corrientes 1234, Córdoba"
                value={direccion}
                onChange={e => setDireccion(e.target.value)}
              />
              {geoStatus === "buscando" && (
                <div style={{ ...S.alert, ...S.alertWarn }}>🔍 Buscando dirección...</div>
              )}
              {geoStatus === "ok" && (
                <div style={{ ...S.alert, ...S.alertOk }}>✅ Dirección dentro de nuestra zona de delivery</div>
              )}
              {geoStatus === "fuera" && (
                <div style={{ ...S.alert, ...S.alertErr }}>❌ Lo sentimos, tu dirección está fuera de nuestra zona de delivery</div>
              )}
              {geoStatus === "err" && (
                <div style={{ ...S.alert, ...S.alertErr }}>⚠️ No pudimos encontrar esa dirección. Intentá ser más específico.</div>
              )}
              {(geoCoords || zona.length > 2) && (
                <MapaDelivery coords={geoCoords} zona={zona} />
              )}
            </div>
          )}

          {/* Pago */}
          <label style={{ ...S.label, marginTop: "4px" }}>Método de pago</label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {pagoOpciones.map(op => (
              <button
                key={op}
                style={{ ...S.payBtn, ...(pago === op ? S.payBtnActive : {}) }}
                onClick={() => setPago(op)}
              >{op}</button>
            ))}
          </div>

          {/* Notas */}
          <label style={S.label}>Notas o aclaraciones (opcional)</label>
          <textarea
            style={S.notas}
            placeholder="Ej: sin cebolla, con extra picante..."
            value={notas}
            onChange={e => setNotas(e.target.value)}
          />
        </div>
      )}

      {/* ── Botón WhatsApp ── */}
      <button
        style={{ ...S.waBtn, ...((!pedidoValido || enviando) ? S.waBtnDisabled : {}) }}
        onClick={confirmarPedido}
        disabled={!pedidoValido || enviando}
      >
        {totalItems === 0
          ? "Seleccioná al menos un producto"
          : !pedidoValido
          ? "Completá todos los datos"
          : enviando
          ? "Abriendo WhatsApp..."
          : `📲 Confirmar pedido por WhatsApp${totalPrecio > 0 ? ` · $${totalPrecio.toLocaleString("es-AR")}` : ""}`}
      </button>
    </div>
  );
}

// ─── ItemCard ─────────────────────────────────────────────────────
function ItemCard({ item, qty, onChange }) {
  const imgSrc = BURGER_IMAGES[item.nombre];
  return (
    <div style={{ ...S.card, ...(qty > 0 ? S.cardSelected : {}), alignItems: "center" }}>
      {imgSrc && (
        <img
          src={imgSrc}
          alt={item.nombre}
          style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={S.itemName}>{item.nombre}</div>
        {item.descripcion && <div style={S.itemDesc}>{item.descripcion}</div>}
        {item.precio > 0 && (
          <div style={{ ...S.itemPrice, marginLeft: 0, marginTop: "4px" }}>${item.precio.toLocaleString("es-AR")}</div>
        )}
      </div>
      <div style={S.counter}>
        {qty > 0 ? (
          <>
            <button style={S.btn} onClick={() => onChange(-1)}>−</button>
            <span style={S.qty}>{qty}</span>
            <button style={S.btn} onClick={() => onChange(1)}>+</button>
          </>
        ) : (
          <button style={{ ...S.btn, width: "60px", borderRadius: "20px", fontSize: "13px" }} onClick={() => onChange(1)}>
            Agregar
          </button>
        )}
      </div>
    </div>
  );
}
