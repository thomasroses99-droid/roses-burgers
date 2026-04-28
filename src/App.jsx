import { useState, useEffect, useCallback } from "react";

// ===================== STORAGE =====================
const stateRegistry = new Map(); // key → setValue
let firestore = null;
let syncTimer = null;

// Callbacks para notificar estado de conexión a la UI
let onFbConnected = null;

// Auth simple
const SESSION_KEY = "rb-session";
const USUARIOS_FIJOS = [
  { email: "thomasroses99@gmail.com",    password: "Marcelo52",     isAdmin: true  },
  { email: "nicolasroses199412@gmail.com", password: "Corrientes1967", isAdmin: false },
  { email: "matiroses00@gmail.com",      password: "Evaperon8124",  isAdmin: false },
];
const ADMIN_EMAIL = USUARIOS_FIJOS[0].email;
const ADMIN_PASS  = USUARIOS_FIJOS[0].password;

// Firebase carga en background para no bloquear la página
import("./firebase.js").then(fb => {
  firestore = fb;
  fb.onSnapshot(fb.doc(fb.db, "rb", "main3"), (snap) => {
    if (onFbConnected) onFbConnected(true);
    const data = snap.exists() ? snap.data() : {};
    for (const [k, setter] of stateRegistry) {
      if (data[k] !== undefined) {
        try {
          const parsed = JSON.parse(data[k]);
          localStorage.setItem(k, data[k]);
          setter(parsed);
        } catch {}
      }
    }
  }, () => { if (onFbConnected) onFbConnected(false); });
}).catch(() => { if (onFbConnected) onFbConnected(false); });

function scheduleSync() {
  if (!firestore) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    if (!firestore) return;
    const data = {};
    for (const key of stateRegistry.keys()) {
      const v = localStorage.getItem(key);
      if (v !== null) data[key] = v;
    }
    firestore.setDoc(firestore.doc(firestore.db, "rb", "main3"), data).catch(() => {});
  }, 800);
}

function lsLoad(key, fallback) {
  try {
    const r = localStorage.getItem(key);
    return r !== null ? JSON.parse(r) : fallback;
  } catch { return fallback; }
}
function lsSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    scheduleSync();
  } catch {}
}
function usePersisted(key, initial) {
  const [value, setValue] = useState(() => lsLoad(key, initial));
  const set = useCallback((v) => {
    setValue(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      lsSave(key, next);
      return next;
    });
  }, [key]);
  useEffect(() => {
    stateRegistry.set(key, setValue);
    return () => stateRegistry.delete(key);
  }, [key]);
  return [value, set, true];
}

// ===================== INITIAL DATA =====================
const initialInsumos = [
  // Carnes
  { id: 1,  nombre: "Carne",                  unidad: "kg",     precio_unidad: 15100,     categoria: "Carnes" },
  { id: 2,  nombre: "Panceta",                 unidad: "kg",     precio_unidad: 19154.29,  categoria: "Carnes" },
  { id: 3,  nombre: "Veggies",                 unidad: "kg",     precio_unidad: 1169.55,   categoria: "Carnes" },
  { id: 4,  nombre: "Medallon pollo",          unidad: "kg",     precio_unidad: 7000,      categoria: "Carnes" },
  // Lacteos
  { id: 5,  nombre: "Cheddar",                 unidad: "kg",     precio_unidad: 26137.60,  categoria: "Lacteos" },
  { id: 6,  nombre: "Cheddar Liquido",         unidad: "kg",     precio_unidad: 31553,     categoria: "Lacteos" },
  { id: 7,  nombre: "Crema de leche",          unidad: "kg",     precio_unidad: 2859.23,   categoria: "Lacteos" },
  { id: 8,  nombre: "Leche",                   unidad: "kg",     precio_unidad: 1809.51,   categoria: "Lacteos" },
  { id: 9,  nombre: "Roquefort",               unidad: "kg",     precio_unidad: 12992.67,  categoria: "Lacteos" },
  { id: 10, nombre: "Casancrem",               unidad: "kg",     precio_unidad: 4751.67,   categoria: "Lacteos" },
  { id: 11, nombre: "Manteca",                 unidad: "kg",     precio_unidad: 12416.54,  categoria: "Lacteos" },
  // Panificados
  { id: 33, nombre: "Pan",                     unidad: "unidad", precio_unidad: 475,       categoria: "Panificados" },
  { id: 22, nombre: "Harina 0000",             unidad: "kg",     precio_unidad: 1105.64,   categoria: "Panificados" },
  // Verduras
  { id: 34, nombre: "Lechuga",                 unidad: "kg",     precio_unidad: 3000,      categoria: "Verduras" },
  { id: 35, nombre: "Tomate",                  unidad: "kg",     precio_unidad: 3000,      categoria: "Verduras" },
  { id: 36, nombre: "Repollo",                 unidad: "kg",     precio_unidad: 8000,      categoria: "Verduras" },
  { id: 37, nombre: "Cebolla",                 unidad: "kg",     precio_unidad: 18000,     categoria: "Verduras" },
  { id: 38, nombre: "Cebolla Morada",          unidad: "kg",     precio_unidad: 2000,      categoria: "Verduras" },
  { id: 39, nombre: "Perejil",                 unidad: "kg",     precio_unidad: 0,         categoria: "Verduras" },
  { id: 40, nombre: "Ciboulette",              unidad: "kg",     precio_unidad: 0,         categoria: "Verduras" },
  { id: 41, nombre: "Ajo picado",              unidad: "kg",     precio_unidad: 0,         categoria: "Verduras" },
  { id: 42, nombre: "Aji Molido",              unidad: "kg",     precio_unidad: 0,         categoria: "Verduras" },
  { id: 43, nombre: "Jugo de limon",           unidad: "kg",     precio_unidad: 0,         categoria: "Verduras" },
  { id: 44, nombre: "Cebolla picada",          unidad: "kg",     precio_unidad: 18000,     categoria: "Verduras" },
  { id: 65, nombre: "Rucula",                  unidad: "kg",     precio_unidad: 0,         categoria: "Verduras" },
  { id: 66, nombre: "Cebolla caramelizada",    unidad: "kg",     precio_unidad: 0,         categoria: "Verduras" },
  // Salsas base
  { id: 25, nombre: "Mayonesa",                unidad: "kg",     precio_unidad: 11522.13,  categoria: "Salsas base" },
  { id: 26, nombre: "Ketchup",                 unidad: "kg",     precio_unidad: 11761.05,  categoria: "Salsas base" },
  { id: 27, nombre: "Barbacoa",                unidad: "kg",     precio_unidad: 12504.54,  categoria: "Salsas base" },
  { id: 28, nombre: "Savora",                  unidad: "kg",     precio_unidad: 8528.06,   categoria: "Salsas base" },
  { id: 29, nombre: "Relish",                  unidad: "kg",     precio_unidad: 0,         categoria: "Salsas base" },
  { id: 30, nombre: "Mostaza de Dijon",        unidad: "kg",     precio_unidad: 0,         categoria: "Salsas base" },
  { id: 31, nombre: "Mostaza",                 unidad: "kg",     precio_unidad: 0,         categoria: "Salsas base" },
  { id: 32, nombre: "Salsa Inglesa",           unidad: "kg",     precio_unidad: 0,         categoria: "Salsas base" },
  // Aceites
  { id: 23, nombre: "Aceite de Girasol",       unidad: "litro",  precio_unidad: 3051.62,   categoria: "Aceites" },
  { id: 24, nombre: "Aceite de Oliva",         unidad: "litro",  precio_unidad: 4600,      categoria: "Aceites" },
  // Especias
  { id: 12, nombre: "Ajo en Polvo",            unidad: "kg",     precio_unidad: 16437.68,  categoria: "Especias" },
  { id: 13, nombre: "Pimenton",                unidad: "kg",     precio_unidad: 16325,     categoria: "Especias" },
  { id: 14, nombre: "Sal",                     unidad: "kg",     precio_unidad: 1796,      categoria: "Especias" },
  { id: 15, nombre: "Azucar",                  unidad: "kg",     precio_unidad: 1384,      categoria: "Especias" },
  { id: 16, nombre: "Humo Liquido",            unidad: "litro",  precio_unidad: 21172,     categoria: "Especias" },
  { id: 17, nombre: "Alicante sabor carne",    unidad: "kg",     precio_unidad: 3107.28,   categoria: "Especias" },
  { id: 18, nombre: "Miel",                    unidad: "kg",     precio_unidad: 6424.54,   categoria: "Especias" },
  { id: 19, nombre: "Vinagre",                 unidad: "litro",  precio_unidad: 1007.93,   categoria: "Especias" },
  { id: 20, nombre: "Pepinos",                 unidad: "kg",     precio_unidad: 19405,     categoria: "Especias" },
  { id: 21, nombre: "Minerva",                 unidad: "litro",  precio_unidad: 2551.32,   categoria: "Especias" },
  { id: 45, nombre: "Pimienta",                unidad: "kg",     precio_unidad: 0,         categoria: "Especias" },
  // Guarniciones
  { id: 46, nombre: "Papas Fritas",            unidad: "kg",     precio_unidad: 68558.05,  categoria: "Guarniciones" },
  { id: 47, nombre: "Aros de Cebolla",         unidad: "kg",     precio_unidad: 10653.81,  categoria: "Guarniciones" },
  { id: 48, nombre: "Nuggets",                 unidad: "kg",     precio_unidad: 65358,     categoria: "Guarniciones" },
  // Descartables
  { id: 49, nombre: "FVG",                     unidad: "unidad", precio_unidad: 4000,      categoria: "Descartables" },
  { id: 50, nombre: "Gomitas (1 Kilo)",        unidad: "kg",     precio_unidad: 9000,      categoria: "Descartables" },
  { id: 51, nombre: "Papel Madera",            unidad: "unidad", precio_unidad: 10000,     categoria: "Descartables" },
  { id: 52, nombre: "Film (38x600)",           unidad: "unidad", precio_unidad: 18000,     categoria: "Descartables" },
  { id: 53, nombre: "Aluminio",                unidad: "unidad", precio_unidad: 7500,      categoria: "Descartables" },
  { id: 54, nombre: "Bandejas Papas (x100)",   unidad: "unidad", precio_unidad: 3960,      categoria: "Descartables" },
  { id: 55, nombre: "Papel de Cocina",         unidad: "unidad", precio_unidad: 7700,      categoria: "Descartables" },
  // Packaging
  { id: 56, nombre: "Cajas Dely",              unidad: "unidad", precio_unidad: 508.68,    categoria: "Packaging" },
  { id: 57, nombre: "Bolas Dely",              unidad: "unidad", precio_unidad: 374.37,    categoria: "Packaging" },
  // Comandera
  { id: 58, nombre: "Rollos Comandera",        unidad: "unidad", precio_unidad: 1100,      categoria: "Comandera" },
  { id: 59, nombre: "Rollos Pedidos Ya",       unidad: "unidad", precio_unidad: 560,       categoria: "Comandera" },
  // Limpieza
  { id: 60, nombre: "Detergente",              unidad: "unidad", precio_unidad: 13408.71,  categoria: "Limpieza" },
  { id: 61, nombre: "Antigrasa (4 Litros)",    unidad: "unidad", precio_unidad: 15003.88,  categoria: "Limpieza" },
  { id: 62, nombre: "Alcohol (5 Litros)",      unidad: "unidad", precio_unidad: 16791,     categoria: "Limpieza" },
  { id: 63, nombre: "Lavandina (4 Litros)",    unidad: "unidad", precio_unidad: 4193.86,   categoria: "Limpieza" },
  { id: 64, nombre: "Bolsas Residuos",         unidad: "unidad", precio_unidad: 14694,     categoria: "Limpieza" },
];

const initialSalsas = [
  { id:1,  nombre:"Salsa Stacker",          rendimiento_porciones:20, ingredientes:[{insumo_id:25,cantidad:0.300},{insumo_id:26,cantidad:0.030},{insumo_id:29,cantidad:0.040},{insumo_id:19,cantidad:0.040},{insumo_id:15,cantidad:0.005},{insumo_id:13,cantidad:0.005},{insumo_id:45,cantidad:0.0005},{insumo_id:17,cantidad:0.003},{insumo_id:16,cantidad:0.005}] },
  { id:2,  nombre:"Salsa Cheese",           rendimiento_porciones:15, ingredientes:[{insumo_id:8,cantidad:0.100},{insumo_id:30,cantidad:0.010},{insumo_id:26,cantidad:0.010},{insumo_id:11,cantidad:0.100},{insumo_id:23,cantidad:0.100},{insumo_id:14,cantidad:0.001},{insumo_id:12,cantidad:0.001},{insumo_id:45,cantidad:0.0005},{insumo_id:17,cantidad:0.003},{insumo_id:19,cantidad:0.015}] },
  { id:3,  nombre:"Salsa Classic",          rendimiento_porciones:15, ingredientes:[{insumo_id:7,cantidad:0.100},{insumo_id:25,cantidad:0.200},{insumo_id:19,cantidad:0.020},{insumo_id:30,cantidad:0.005},{insumo_id:18,cantidad:0.015},{insumo_id:45,cantidad:0.0005},{insumo_id:14,cantidad:0.001},{insumo_id:13,cantidad:0.001},{insumo_id:17,cantidad:0.003}] },
  { id:4,  nombre:"Salsa Cowboy",           rendimiento_porciones:25, ingredientes:[{insumo_id:11,cantidad:0.240},{insumo_id:39,cantidad:0.010},{insumo_id:40,cantidad:0.010},{insumo_id:41,cantidad:0.006},{insumo_id:19,cantidad:0.030},{insumo_id:13,cantidad:0.005},{insumo_id:45,cantidad:0.001},{insumo_id:42,cantidad:0.005},{insumo_id:32,cantidad:0.015},{insumo_id:30,cantidad:0.010},{insumo_id:10,cantidad:0.200},{insumo_id:18,cantidad:0.010},{insumo_id:23,cantidad:0.100},{insumo_id:8,cantidad:0.050}] },
  { id:5,  nombre:"Salsa Smokey",           rendimiento_porciones:15, ingredientes:[{insumo_id:27,cantidad:0.240},{insumo_id:18,cantidad:0.080},{insumo_id:12,cantidad:0.005},{insumo_id:16,cantidad:0.005},{insumo_id:45,cantidad:0.005},{insumo_id:13,cantidad:0.005}] },
  { id:6,  nombre:"Salsa 1967",             rendimiento_porciones:25, ingredientes:[{insumo_id:25,cantidad:0.480},{insumo_id:31,cantidad:0.030},{insumo_id:26,cantidad:0.120},{insumo_id:15,cantidad:0.030},{insumo_id:19,cantidad:0.030},{insumo_id:29,cantidad:0.045}] },
  { id:7,  nombre:"Salsa Cheesebacon",      rendimiento_porciones:25, ingredientes:[{insumo_id:10,cantidad:0.300},{insumo_id:2,cantidad:0.200},{insumo_id:8,cantidad:0.150},{insumo_id:30,cantidad:0.015},{insumo_id:19,cantidad:0.015},{insumo_id:45,cantidad:0.0005},{insumo_id:17,cantidad:0.003},{insumo_id:18,cantidad:0.010},{insumo_id:16,cantidad:0.002},{insumo_id:40,cantidad:0.015}] },
  { id:8,  nombre:"Salsa Ruby y Crispy Garlic", rendimiento_porciones:20, ingredientes:[{insumo_id:10,cantidad:0.200},{insumo_id:8,cantidad:0.199},{insumo_id:19,cantidad:0.015},{insumo_id:30,cantidad:0.015},{insumo_id:14,cantidad:0.001},{insumo_id:45,cantidad:0.0005},{insumo_id:41,cantidad:0.005},{insumo_id:17,cantidad:0.003}] },
  { id:9,  nombre:"Salsa Blue",             rendimiento_porciones:20, ingredientes:[{insumo_id:25,cantidad:0.240},{insumo_id:30,cantidad:0.060},{insumo_id:31,cantidad:0.060},{insumo_id:18,cantidad:0.120},{insumo_id:45,cantidad:0.0005},{insumo_id:42,cantidad:0.003},{insumo_id:12,cantidad:0.001},{insumo_id:17,cantidad:0.003}] },
  { id:10, nombre:"Salsa Biggie",           rendimiento_porciones:20, ingredientes:[{insumo_id:25,cantidad:0.520},{insumo_id:30,cantidad:0.045},{insumo_id:12,cantidad:0.001},{insumo_id:44,cantidad:0.015},{insumo_id:45,cantidad:0.0005},{insumo_id:13,cantidad:0.001},{insumo_id:17,cantidad:0.003},{insumo_id:43,cantidad:0.015}] },
  // Placeholder — needed by some burgers as a "salsa" reference
  { id:11, nombre:"Cebolla crispy",         rendimiento_porciones:10, ingredientes:[{insumo_id:37,cantidad:0.5},{insumo_id:23,cantidad:0.5},{insumo_id:14,cantidad:0.005},{insumo_id:45,cantidad:0.002}] },
  { id:12, nombre:"Cebolla caramelizada",   rendimiento_porciones:10, ingredientes:[{insumo_id:37,cantidad:0.5},{insumo_id:11,cantidad:0.05},{insumo_id:15,cantidad:0.03},{insumo_id:14,cantidad:0.003}] },
];

const _ing  = (ref_id, nombre, cantidad, merma_pct=0) => ({ tipo:"insumo", ref_id, nombre, cantidad, unidad:"kg",     merma_pct });
const _ingU = (ref_id, nombre, cantidad)               => ({ tipo:"insumo", ref_id, nombre, cantidad, unidad:"unidad", merma_pct:0 });
const _sal  = (ref_id, nombre, cantidad=0.03)          => ({ tipo:"salsa",  ref_id, nombre, cantidad, unidad:"kg",     merma_pct:0 });

const mkBurger = (id, nombre, extras, useRoquefort=false) => {
  const queso = useRoquefort ? 9 : 5;
  const qNom  = useRoquefort ? "Roquefort" : "Cheddar";
  const pan   = _ingU(33, "Pan", 1);
  const papas = _ing(46, "Papas Fritas", 0.15);
  const base  = (carneKg, quesoKg) => [pan, _ing(1,"Carne",carneKg,15), _ing(queso,qNom,quesoKg,5), ...extras];
  return [
    { id:id*10+1, nombre:`${nombre} - Simple`,           precio_venta:11000, ingredientes:base(0.1,0.04) },
    { id:id*10+2, nombre:`${nombre} - Doble`,            precio_venta:13000, ingredientes:base(0.2,0.08) },
    { id:id*10+3, nombre:`${nombre} - Triple`,           precio_venta:15000, ingredientes:base(0.3,0.12) },
    { id:id*10+4, nombre:`${nombre} - Simple con papas`, precio_venta:13500, ingredientes:[...base(0.1,0.04), papas] },
    { id:id*10+5, nombre:`${nombre} - Doble con papas`,  precio_venta:15500, ingredientes:[...base(0.2,0.08), papas] },
    { id:id*10+6, nombre:`${nombre} - Triple con papas`, precio_venta:17500, ingredientes:[...base(0.3,0.12), papas] },
  ];
};

const initialBurgers = [
  ...mkBurger(1,  "Cheeseburger",  [_ing(25,"Mayonesa",0.03)]),
  ...mkBurger(2,  "Roses",         [_ing(26,"Ketchup",0.02), _ing(25,"Mayonesa",0.02), _ing(37,"Cebolla",0.02)]),
  ...mkBurger(3,  "1967",          [_ing(34,"Lechuga",0.03), _ing(37,"Cebolla",0.02), _ing(20,"Pepinos",0.02), _sal(6,"Salsa 1967")]),
  ...mkBurger(4,  "Classic",       [_ing(34,"Lechuga",0.03), _ing(35,"Tomate",0.03), _ing(37,"Cebolla",0.02), _ing(20,"Pepinos",0.02), _sal(3,"Salsa Classic")]),
  ...mkBurger(5,  "Cheese Onion",  [_ing(37,"Cebolla",0.05), _ing(25,"Mayonesa",0.03)]),
  ...mkBurger(6,  "Cowboy",        [_sal(4,"Salsa Cowboy",0.04)]),
  ...mkBurger(7,  "Smokey Bacon",  [_ing(2,"Panceta",0.05,10), _ing(47,"Aros de Cebolla",0.03), _sal(5,"Salsa Smokey")]),
  ...mkBurger(8,  "Blue Cheese",   [_ing(65,"Rucula",0.02), _ing(2,"Panceta",0.05,10), _ing(66,"Cebolla caramelizada",0.03), _sal(9,"Salsa Blue",0.04)], true),
  ...mkBurger(9,  "Stacked Onion", [_ing(2,"Panceta",0.05,10), _ing(47,"Aros de Cebolla",0.03), _sal(1,"Salsa Stacker")]),
  ...mkBurger(10, "Cheese Bacon",  [_ing(2,"Panceta",0.05,10), _sal(7,"Salsa Cheesebacon",0.04)]),
  ...mkBurger(11, "Biggie Burger", [_ing(2,"Panceta",0.05,10), _ing(34,"Lechuga",0.03), _ing(38,"Cebolla Morada",0.02), _ing(20,"Pepinos",0.02), _sal(10,"Salsa Biggie",0.04)]),
  ...mkBurger(12, "Crispy Garlic", [_ing(2,"Panceta",0.05,10), _ing(47,"Aros de Cebolla",0.03), _sal(8,"Salsa Ruby y Crispy Garlic",0.04)]),
  ...mkBurger(13, "Ruby Clove",    [_ing(38,"Cebolla Morada",0.03), _sal(8,"Salsa Ruby y Crispy Garlic",0.04)]),
];

const initialCostosFijos = [
  { id: 1,  nombre: "SUSS",               monto: 1039248.89, categoria: "Impuestos" },
  { id: 2,  nombre: "IVA",                monto: 1534252.09, categoria: "Impuestos" },
  { id: 3,  nombre: "Drei",               monto: 223435.05,  categoria: "Impuestos" },
  { id: 4,  nombre: "Contador",           monto: 180000,     categoria: "Personal" },
  { id: 5,  nombre: "CM",                 monto: 665000,     categoria: "Impuestos" },
  { id: 6,  nombre: "Aguas Alberdi",      monto: 30838.25,   categoria: "Servicios" },
  { id: 7,  nombre: "Gas Alberdi",        monto: 82306.12,   categoria: "Servicios" },
  { id: 8,  nombre: "EPE Fisherton",      monto: 327854.06,  categoria: "Servicios" },
  { id: 9,  nombre: "EPE Alberdi",        monto: 125714.68,  categoria: "Servicios" },
  { id: 10, nombre: "Maxirest",           monto: 116500,     categoria: "Servicios" },
  { id: 11, nombre: "Internet Fisherton", monto: 30000,      categoria: "Servicios" },
  { id: 12, nombre: "Sindicato",          monto: 108598.46,  categoria: "Personal" },
  { id: 13, nombre: "Alquiler Alberdi",   monto: 480102,     categoria: "Inmueble" },
  { id: 14, nombre: "Alquiler Fisherton", monto: 1081000,    categoria: "Inmueble" },
  { id: 15, nombre: "Cuota Alejo",        monto: 286000,     categoria: "Personal" },
  { id: 16, nombre: "Sistema urgencias",  monto: 83000,      categoria: "Servicios" },
  { id: 17, nombre: "Plan de Pago IVA",   monto: 0,          categoria: "Impuestos" },
  { id: 18, nombre: "Seguro Incendio",    monto: 51399,      categoria: "Seguros" },
  { id: 19, nombre: "Autonomos",          monto: 104044.08,  categoria: "Impuestos" },
  { id: 20, nombre: "Alarmas",            monto: 81225,      categoria: "Servicios" },
  { id: 21, nombre: "Fumigador",          monto: 62000,      categoria: "Servicios" },
  { id: 22, nombre: "Gas Fisherton",      monto: 204036.45,  categoria: "Servicios" },
  { id: 23, nombre: "DDJJ",               monto: 0,          categoria: "Impuestos" },
  { id: 24, nombre: "Plan de pago Aut",   monto: 0,          categoria: "Impuestos" },
  { id: 25, nombre: "Cuota tarjeta",      monto: 1300000,    categoria: "Financiero" },
  { id: 26, nombre: "TGI Fisherton",      monto: 106911,     categoria: "Impuestos" },
  { id: 27, nombre: "API Fisherton",      monto: 249000,     categoria: "Impuestos" },
  { id: 28, nombre: "Agua Fisherton",     monto: 0,          categoria: "Servicios" },
  { id: 29, nombre: "Plan de Pago TGI",   monto: 213946.74,  categoria: "Impuestos" },
  { id: 30, nombre: "Plan de Pago API",   monto: 0,          categoria: "Impuestos" },
];

const initialProveedores = [];

// ===================== HELPERS =====================
const diasDelMes = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
const hoy = new Date().getDate();
const mesActual = new Date().toLocaleString("es-AR", { month: "long", year: "numeric" });
const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n ?? 0);
const fmt2 = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n ?? 0);
const pct = (n) => `${Math.round(n ?? 0)}%`;

function calcPesoTotalSalsa(salsa) {
  if (!salsa) return 0;
  return salsa.ingredientes.reduce((s, ing) => s + ing.cantidad, 0); // total en kg
}

function calcCostoSalsa(salsa, insumos) {
  if (!salsa || !insumos) return 0;
  const costoTotal = salsa.ingredientes.reduce((s, ing) => {
    const ins = insumos.find(i => i.id === ing.insumo_id);
    return s + (ins ? ins.precio_unidad * ing.cantidad : 0);
  }, 0);
  // costo por KG de salsa terminada
  const pesoKg = calcPesoTotalSalsa(salsa);
  return pesoKg > 0 ? costoTotal / pesoKg : 0;
}

// Calcula costo de una cantidad (en kg) de salsa
function calcCostoSalsaKg(salsa, insumos, cantidadKg) {
  return calcCostoSalsa(salsa, insumos) * cantidadKg;
}

function calcCostoIngBurger(ing, insumos, salsas) {
  let costoBase = 0;
  if (ing.tipo === "insumo") {
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

function calcConsumoVenta(burger, cantidadVendida, salsas) {
  const consumo = {};
  for (const ing of burger.ingredientes) {
    const cantEfectiva = ing.cantidad * (1 + (ing.merma_pct || 0) / 100) * cantidadVendida;
    if (ing.tipo === "insumo") {
      consumo[ing.ref_id] = (consumo[ing.ref_id] || 0) + cantEfectiva;
    } else if (ing.tipo === "salsa") {
      const salsa = salsas.find(s => s.id === ing.ref_id);
      if (salsa) {
        const pesoTotal = calcPesoTotalSalsa(salsa);
        for (const sIng of salsa.ingredientes) {
          const cant = pesoTotal > 0 ? (sIng.cantidad / pesoTotal) * cantEfectiva : 0;
          consumo[sIng.insumo_id] = (consumo[sIng.insumo_id] || 0) + cant;
        }
      }
    }
  }
  return consumo;
}

const CATS_INSUMO = ["Carnes", "Panificados", "Lacteos", "Verduras", "Salsas base", "Aceites", "Especias", "Guarniciones", "Descartables", "Packaging", "Comandera", "Limpieza"];
const CATS_CF = ["Inmueble", "Servicios", "Personal", "Seguros", "Impuestos", "Financiero", "Otro"];
const CATS_PROV = ["Proveedor", "Plan de pago", "Otro"];
const UNIDADES = ["kg", "gr", "unidad", "litro", "ml", "porcion"];

// ===================== UI =====================
function TabBtn({ active, onClick, children, icon }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#2e7d32" : "transparent", color: active ? "#ffffff" : "#4a7a4a",
      border: active ? "none" : "none", padding: "8px 13px", borderRadius: "7px",
      fontFamily: "'DM Mono', monospace", fontWeight: active ? "700" : "400",
      fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase",
      cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
      transition: "all 0.12s", whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: "13px" }}>{icon}</span>{children}
    </button>
  );
}

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#ffffff", border: "1px solid #d4e8d0", borderRadius: "11px", padding: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", ...style }}>{children}</div>
);

function StatBox({ label, value, sub, accent, warn }) {
  const c = accent ? "#1a7a3a" : warn ? "#c0392b" : "#1a2e1a";
  const bg = accent ? "#e8f5e9" : warn ? "#fdecea" : "#f4faf4";
  const border = accent ? "#a5d6a7" : warn ? "#f5c6c2" : "#c8e6c9";
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: "9px", padding: "13px 16px" }}>
      <div style={{ color: "#5a7a5a", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>{label}</div>
      <div style={{ color: c, fontSize: "19px", fontWeight: "700", fontFamily: "'DM Mono', monospace" }}>{value}</div>
      {sub && <div style={{ color: "#7a9a7a", fontSize: "10px", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

const IS = { background: "#f4faf4", border: "1px solid #c8e6c9", borderRadius: "6px", color: "#1a2e1a", padding: "7px 9px", fontFamily: "'DM Mono', monospace", fontSize: "12px", outline: "none", boxSizing: "border-box" };
const Btn = ({ onClick, children, style = {}, variant = "primary" }) => (
  <button onClick={onClick} style={{ background: variant === "primary" ? "#2e7d32" : "#e8f5e9", color: variant === "primary" ? "#ffffff" : "#2e7d32", border: variant === "primary" ? "none" : "1px solid #a5d6a7", borderRadius: "6px", padding: "7px 13px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: "700", ...style }}>{children}</button>
);
const X = ({ onClick }) => <button onClick={onClick} style={{ background: "none", border: "none", color: "#c8a0a0", cursor: "pointer", fontSize: "15px", padding: "2px 5px", lineHeight: 1 }}>✕</button>;
const H = ({ title, children }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "13px" }}>
    <span style={{ color: "#1a3a1a", fontSize: "13px", fontWeight: "700", fontFamily: "'DM Mono', monospace" }}>{title}</span>
    <div style={{ display: "flex", gap: "7px" }}>{children}</div>
  </div>
);

// ===================== INSUMOS =====================
function InsumosTab({ insumos, setInsumos }) {
  const [form, setForm] = useState({ nombre: "", unidad: "kg", precio_unidad: "", categoria: "Carnes" });
  const bycat = CATS_INSUMO.map(cat => ({ cat, items: insumos.filter(i => i.categoria === cat) })).filter(g => g.items.length > 0);
  const add = () => { if (!form.nombre || !form.precio_unidad) return; setInsumos([...insumos, { id: Date.now(), ...form, precio_unidad: Number(form.precio_unidad) }]); setForm({ ...form, nombre: "", precio_unidad: "" }); };
  const upd = (id, f, v) => setInsumos(insumos.map(i => i.id !== id ? i : { ...i, [f]: f === "precio_unidad" ? Number(v) : v }));
  const del = (id) => setInsumos(insumos.filter(i => i.id !== id));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Card>
        <H title="Agregar insumo" />
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
          <input placeholder="Nombre del insumo" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} style={{ ...IS, flex: "1 1 150px" }} />
          <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} style={{ ...IS }}>{CATS_INSUMO.map(c => <option key={c}>{c}</option>)}</select>
          <select value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} style={{ ...IS, width: "85px" }}>{UNIDADES.map(u => <option key={u}>{u}</option>)}</select>
          <input type="number" placeholder="Precio / unidad $" value={form.precio_unidad} onChange={e => setForm({ ...form, precio_unidad: e.target.value })} style={{ ...IS, width: "150px" }} />
          <Btn onClick={add}>+ Agregar</Btn>
        </div>
      </Card>
      {bycat.map(({ cat, items }) => (
        <Card key={cat}>
          <div style={{ marginBottom: "10px", color: "#2a6a3a", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>{cat}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 85px 1fr auto", gap: "7px", padding: "3px 0 8px", borderBottom: "1px solid #d4edd9" }}>
            {["Insumo", "Unidad", "Precio por unidad", ""].map((h, i) => <div key={i} style={{ color: "#1a5c2a", fontSize: "10px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{h}</div>)}
          </div>
          {items.map(ins => (
            <div key={ins.id} style={{ display: "grid", gridTemplateColumns: "1fr 85px 1fr auto", gap: "7px", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #e0f0e6" }}>
              <input value={ins.nombre} onChange={e => upd(ins.id, "nombre", e.target.value)} style={{ ...IS, fontSize: "12px" }} />
              <select value={ins.unidad} onChange={e => upd(ins.id, "unidad", e.target.value)} style={{ ...IS, fontSize: "11px" }}>{UNIDADES.map(u => <option key={u}>{u}</option>)}</select>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ color: "#222", fontSize: "12px" }}>$</span>
                <input type="number" value={ins.precio_unidad} onChange={e => upd(ins.id, "precio_unidad", e.target.value)} style={{ ...IS, flex: 1, color: "#1a7a3a", fontWeight: "700", fontSize: "13px" }} />
                <span style={{ color: "#222", fontSize: "10px" }}>/ {ins.unidad}</span>
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
  const [nf, setNf] = useState({ nombre: "" });
  const [ni, setNi] = useState({ insumo_id: insumos[0]?.id || "", cantidad: "" });

  const salsa = salsas[sel];
  const costoReceta = salsa ? salsa.ingredientes.reduce((s, ing) => { const ins = insumos.find(i => i.id === ing.insumo_id); return s + (ins ? ins.precio_unidad * ing.cantidad : 0); }, 0) : 0;
  const pesoTotalKg = salsa ? calcPesoTotalSalsa(salsa) : 0;
  const pesoTotalGr = pesoTotalKg * 1000;
  const costoPorKg = salsa ? calcCostoSalsa(salsa, insumos) : 0;
  const costoPorGr = costoPorKg / 1000;

  const addS = () => { if (!nf.nombre) return; setSalsas([...salsas, { id: Date.now(), nombre: nf.nombre, ingredientes: [] }]); setSel(salsas.length); setShowNew(false); setNf({ nombre: "" }); };
  const delS = (i) => { if (salsas.length <= 1) return; setSalsas(salsas.filter((_, ii) => ii !== i)); setSel(Math.max(0, i - 1)); };
  const updS = (f, v) => setSalsas(salsas.map((s, i) => i !== sel ? s : { ...s, [f]: v }));
  const addI = () => { if (!ni.insumo_id || !ni.cantidad) return; setSalsas(salsas.map((s, i) => i !== sel ? s : { ...s, ingredientes: [...s.ingredientes, { insumo_id: Number(ni.insumo_id), cantidad: Number(ni.cantidad) }] })); setNi({ insumo_id: insumos[0]?.id || "", cantidad: "" }); };
  const delI = (idx) => setSalsas(salsas.map((s, i) => i !== sel ? s : { ...s, ingredientes: s.ingredientes.filter((_, ii) => ii !== idx) }));
  const updI = (idx, f, v) => setSalsas(salsas.map((s, i) => i !== sel ? s : { ...s, ingredientes: s.ingredientes.map((ing, ii) => ii !== idx ? ing : { ...ing, [f]: Number(v) }) }));

  return (
    <div style={{ display: "flex", gap: "14px" }}>
      <div style={{ width: "190px", flexShrink: 0 }}>
        <div style={{ color: "#222", fontSize: "10px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", marginBottom: "7px", letterSpacing: "0.1em" }}>Salsas</div>
        {salsas.map((s, i) => (
          <div key={s.id} style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
            <button onClick={() => setSel(i)} style={{ flex: 1, background: sel === i ? "#1a7a3a" : "#d4edd9", color: sel === i ? "#d4edd9" : "#aaa", border: `1px solid ${sel === i ? "#1a7a3a" : "#222"}`, borderRadius: "7px", padding: "8px 11px", textAlign: "left", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: sel === i ? "700" : "400" }}>🧪 {s.nombre}</button>
            {salsas.length > 1 && <X onClick={() => delS(i)} />}
          </div>
        ))}
        {showNew ? (
          <Card style={{ padding: "11px", marginTop: "5px" }}>
            <input placeholder="Nombre" value={nf.nombre} onChange={e => setNf({ ...nf, nombre: e.target.value })} style={{ ...IS, width: "100%", marginBottom: "5px" }} />

            <div style={{ display: "flex", gap: "5px" }}><Btn onClick={addS} style={{ flex: 1 }}>Crear</Btn><Btn onClick={() => setShowNew(false)} variant="ghost" style={{ flex: 1 }}>✕</Btn></div>
          </Card>
        ) : (
          <button onClick={() => setShowNew(true)} style={{ width: "100%", background: "transparent", color: "#222", border: "1px dashed #a0c0a0", borderRadius: "7px", padding: "8px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "10px", marginTop: "4px" }}>+ Nueva salsa</button>
        )}
      </div>

      {salsa && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "11px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "9px" }}>
            <StatBox label="Costo total receta" value={fmt(costoReceta)} />
            <StatBox label="Peso total" value={`${Math.round(pesoTotalGr)} gr`} />
            <StatBox label="Costo por kg" value={fmt(costoPorKg)} />
            <StatBox label="Costo por gr" value={`$${costoPorGr.toFixed(2)}`} accent />
          </div>
          <Card>
            <div style={{ display: "flex", gap: "11px" }}>
              <div style={{ flex: 1 }}><div style={{ color: "#5a8a6e", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>NOMBRE</div><input value={salsa.nombre} onChange={e => updS("nombre", e.target.value)} style={{ ...IS, width: "100%" }} /></div>
              <div style={{ width: "200px" }}><div style={{ color: "#5a8a6e", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>PESO TOTAL: {Math.round(pesoTotalGr)}gr — ${costoPorGr.toFixed(2)}/gr</div><div style={{ ...IS, width: "100%", color: "#1a7a3a", fontWeight: "700", padding: "7px 9px" }}>{fmt(costoPorKg)} por kg</div></div>
            </div>
          </Card>
          <Card>
            <H title="Ingredientes de la salsa" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 80px 80px auto", gap: "7px", padding: "3px 0 7px", borderBottom: "1px solid #d4edd9" }}>
              {["Insumo", "Unidad", "Cantidad", "Costo", ""].map((h, i) => <div key={i} style={{ color: "#1a5c2a", fontSize: "10px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{h}</div>)}
            </div>
            {salsa.ingredientes.map((ing, idx) => {
              const ins = insumos.find(i => i.id === ing.insumo_id);
              return (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 70px 80px 80px auto", gap: "7px", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #e0f0e6" }}>
                  <select value={ing.insumo_id} onChange={e => updI(idx, "insumo_id", e.target.value)} style={{ ...IS, fontSize: "11px" }}>{insumos.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}</select>
                  <span style={{ color: "#222", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{ins?.unidad || "-"}</span>
                  <input type="number" step="0.001" value={ing.cantidad} onChange={e => updI(idx, "cantidad", e.target.value)} style={{ ...IS, fontSize: "12px" }} />
                  <span style={{ color: "#1a7a3a", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>{fmt2(ins ? ins.precio_unidad * ing.cantidad : 0)}</span>
                  <X onClick={() => delI(idx)} />
                </div>
              );
            })}
            <div style={{ display: "flex", gap: "7px", marginTop: "9px", padding: "9px", background: "#f0faf4", borderRadius: "7px" }}>
              <select value={ni.insumo_id} onChange={e => setNi({ ...ni, insumo_id: e.target.value })} style={{ ...IS, flex: 1 }}>{insumos.map(i => <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>)}</select>
              <input type="number" step="0.001" placeholder="Cantidad" value={ni.cantidad} onChange={e => setNi({ ...ni, cantidad: e.target.value })} style={{ ...IS, width: "95px" }} />
              <Btn onClick={addI}>+ Agregar</Btn>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0 0", marginTop: "5px", borderTop: "2px solid #b8dfc4" }}>
              <span style={{ color: "#222", fontFamily: "'DM Mono', monospace", fontSize: "11px" }}>TOTAL RECETA</span>
              <span style={{ color: "#cc4400", fontFamily: "'DM Mono', monospace", fontSize: "14px", fontWeight: "700" }}>{fmt(costoReceta)}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ===================== HAMBURGUESAS =====================
function BurgersTab({ burgers, setBurgers, insumos, salsas }) {
  const [sel, setSel] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const [nf, setNf] = useState({ nombre: "", precio_venta: "" });
  const [ni, setNi] = useState({ tipo: "insumo", ref_id: insumos[0]?.id || "", cantidad: "", merma_pct: 0 });

  const burger = burgers[sel];
  const costoTotal = burger ? calcCostoBurger(burger, insumos, salsas) : 0;
  const margen = burger ? burger.precio_venta - costoTotal : 0;
  const pctM = burger && burger.precio_venta > 0 ? (margen / burger.precio_venta) * 100 : 0;
  const pctC = burger && burger.precio_venta > 0 ? (costoTotal / burger.precio_venta) * 100 : 0;

  const addB = () => { if (!nf.nombre) return; setBurgers([...burgers, { id: Date.now(), nombre: nf.nombre, precio_venta: Number(nf.precio_venta) || 0, ingredientes: [] }]); setSel(burgers.length); setShowNew(false); setNf({ nombre: "", precio_venta: "" }); };
  const delB = (i) => { if (burgers.length <= 1) return; setBurgers(burgers.filter((_, ii) => ii !== i)); setSel(Math.max(0, i - 1)); };
  const updB = (f, v) => setBurgers(burgers.map((b, i) => i !== sel ? b : { ...b, [f]: f === "precio_venta" ? Number(v) : v }));
  const refs = () => ni.tipo === "insumo" ? insumos : salsas;
  const refNombre = (tipo, id) => (tipo === "insumo" ? insumos : salsas).find(x => x.id === Number(id))?.nombre || "?";
  const refUnidad = (tipo, id) => tipo === "insumo" ? (insumos.find(x => x.id === Number(id))?.unidad || "") : "porcion";
  const addI = () => {
    if (!ni.ref_id || !ni.cantidad) return;
    const rid = Number(ni.ref_id);
    setBurgers(burgers.map((b, i) => i !== sel ? b : { ...b, ingredientes: [...b.ingredientes, { tipo: ni.tipo, ref_id: rid, nombre: refNombre(ni.tipo, rid), cantidad: Number(ni.cantidad), unidad: refUnidad(ni.tipo, rid), merma_pct: Number(ni.merma_pct) || 0 }] }));
    setNi({ tipo: "insumo", ref_id: insumos[0]?.id || "", cantidad: "", merma_pct: 0 });
  };
  const delI = (idx) => setBurgers(burgers.map((b, i) => i !== sel ? b : { ...b, ingredientes: b.ingredientes.filter((_, ii) => ii !== idx) }));
  const updI = (idx, f, v) => setBurgers(burgers.map((b, i) => i !== sel ? b : { ...b, ingredientes: b.ingredientes.map((ing, ii) => ii !== idx ? ing : { ...ing, [f]: ["cantidad", "merma_pct"].includes(f) ? Number(v) : v }) }));

  return (
    <div style={{ display: "flex", gap: "14px" }}>
      <div style={{ width: "190px", flexShrink: 0 }}>
        <div style={{ color: "#222", fontSize: "10px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", marginBottom: "7px", letterSpacing: "0.1em" }}>Hamburguesas</div>
        {burgers.map((b, i) => (
          <div key={b.id} style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
            <button onClick={() => setSel(i)} style={{ flex: 1, background: sel === i ? "#1a7a3a" : "#d4edd9", color: sel === i ? "#d4edd9" : "#aaa", border: `1px solid ${sel === i ? "#1a7a3a" : "#222"}`, borderRadius: "7px", padding: "8px 11px", textAlign: "left", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: sel === i ? "700" : "400" }}>🍔 {b.nombre}</button>
            {burgers.length > 1 && <X onClick={() => delB(i)} />}
          </div>
        ))}
        {showNew ? (
          <Card style={{ padding: "11px", marginTop: "5px" }}>
            <input placeholder="Nombre" value={nf.nombre} onChange={e => setNf({ ...nf, nombre: e.target.value })} style={{ ...IS, width: "100%", marginBottom: "5px" }} />
            <input type="number" placeholder="Precio de venta $" value={nf.precio_venta} onChange={e => setNf({ ...nf, precio_venta: e.target.value })} style={{ ...IS, width: "100%", marginBottom: "7px" }} />
            <div style={{ display: "flex", gap: "5px" }}><Btn onClick={addB} style={{ flex: 1 }}>Crear</Btn><Btn onClick={() => setShowNew(false)} variant="ghost" style={{ flex: 1 }}>✕</Btn></div>
          </Card>
        ) : (
          <button onClick={() => setShowNew(true)} style={{ width: "100%", background: "transparent", color: "#222", border: "1px dashed #a0c0a0", borderRadius: "7px", padding: "8px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "10px", marginTop: "4px" }}>+ Nueva hamburguesa</button>
        )}
      </div>

      {burger && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "11px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "9px" }}>
            <StatBox label="Costo total" value={fmt(costoTotal)} />
            <StatBox label="Precio de venta" value={fmt(burger.precio_venta)} />
            <StatBox label="Margen bruto" value={fmt(margen)} accent={margen > 0} warn={margen <= 0} />
            <StatBox label="% Margen" value={pct(pctM)} sub={`${pct(pctC)} es costo`} accent={pctM > 40} warn={pctM < 20} />
          </div>
          <Card style={{ padding: "12px 16px" }}>
            <div style={{ height: "16px", background: "#f0faf4", borderRadius: "5px", overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${Math.min(100, pctC)}%`, background: pctC > 60 ? "#FF6B35" : "#E8873C", transition: "width 0.3s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {pctC > 15 && <span style={{ fontSize: "9px", color: "#1a3a25", fontFamily: "'DM Mono', monospace" }}>{pct(pctC)} costo</span>}
              </div>
              <div style={{ flex: 1, background: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {pctM > 10 && <span style={{ fontSize: "9px", color: "#1a3a25", fontFamily: "'DM Mono', monospace" }}>{pct(pctM)} margen</span>}
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ display: "flex", gap: "11px" }}>
              <div style={{ flex: 1 }}><div style={{ color: "#222", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>NOMBRE</div><input value={burger.nombre} onChange={e => updB("nombre", e.target.value)} style={{ ...IS, width: "100%" }} /></div>
              <div style={{ width: "155px" }}><div style={{ color: "#222", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>PRECIO DE VENTA $</div><input type="number" value={burger.precio_venta} onChange={e => updB("precio_venta", e.target.value)} style={{ ...IS, width: "100%", color: "#1a7a3a", fontWeight: "700" }} /></div>
            </div>
          </Card>
          <Card>
            <H title="Receta con cantidades y merma" />
            <div style={{ display: "grid", gridTemplateColumns: "20px 1fr 60px 60px 75px 90px 85px auto", gap: "6px", padding: "3px 0 7px", borderBottom: "1px solid #d4edd9" }}>
              {["", "Ingrediente", "Tipo", "Unidad", "Cantidad", "% Merma", "Costo final", ""].map((h, i) => <div key={i} style={{ color: "#1a5c2a", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{h}</div>)}
            </div>
            {burger.ingredientes.map((ing, idx) => {
              const costoBase = ing.tipo === "insumo"
                ? (insumos.find(i => i.id === ing.ref_id)?.precio_unidad || 0) * ing.cantidad
                : calcCostoSalsaKg(salsas.find(s => s.id === ing.ref_id), insumos, ing.cantidad);
              const costoMerma = costoBase * ((ing.merma_pct || 0) / 100);
              const costoFinal = costoBase + costoMerma;
              return (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "20px 1fr 60px 60px 75px 90px 85px auto", gap: "6px", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #e0f0e6" }}>
                  <span style={{ fontSize: "13px" }}>{ing.tipo === "salsa" ? "🧪" : "🥩"}</span>
                  <select value={ing.ref_id} onChange={e => { const id = Number(e.target.value); const ref = (ing.tipo === "insumo" ? insumos : salsas).find(x => x.id === id); updI(idx, "ref_id", id); updI(idx, "nombre", ref?.nombre || ""); updI(idx, "unidad", ing.tipo === "insumo" ? ref?.unidad : "porcion"); }} style={{ ...IS, fontSize: "11px" }}>
                    {(ing.tipo === "insumo" ? insumos : salsas).map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                  </select>
                  <span style={{ color: ing.tipo === "salsa" ? "#9B59B6" : "#3498DB", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{ing.tipo}</span>
                  <span style={{ color: "#222", fontSize: "10px", fontFamily: "'DM Mono', monospace" }}>{ing.unidad}</span>
                  <input type="number" step="0.001" value={ing.cantidad} onChange={e => updI(idx, "cantidad", e.target.value)} style={{ ...IS, fontSize: "11px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <input type="number" min="0" max="100" value={ing.merma_pct || 0} onChange={e => updI(idx, "merma_pct", e.target.value)} style={{ ...IS, fontSize: "11px", width: "44px" }} />
                    <span style={{ color: "#222", fontSize: "10px" }}>%</span>
                  </div>
                  <div>
                    <div style={{ color: "#1a7a3a", fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: "700" }}>{fmt2(costoFinal)}</div>
                    {(ing.merma_pct || 0) > 0 && <div style={{ color: "#222", fontSize: "9px" }}>+{fmt2(costoMerma)} merma</div>}
                  </div>
                  <X onClick={() => delI(idx)} />
                </div>
              );
            })}
            {/* Agregar */}
            <div style={{ marginTop: "9px", padding: "10px", background: "#f0faf4", borderRadius: "7px" }}>
              <div style={{ color: "#1a5c2a", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "7px" }}>AGREGAR INGREDIENTE</div>
              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", alignItems: "center" }}>
                <select value={ni.tipo} onChange={e => setNi({ ...ni, tipo: e.target.value, ref_id: e.target.value === "insumo" ? (insumos[0]?.id || "") : (salsas[0]?.id || "") })} style={{ ...IS, width: "90px" }}>
                  <option value="insumo">Insumo</option>
                  <option value="salsa">Salsa</option>
                </select>
                <select value={ni.ref_id} onChange={e => setNi({ ...ni, ref_id: e.target.value })} style={{ ...IS, flex: "1 1 130px" }}>{refs().map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>
                <input type="number" step="0.001" placeholder="Cantidad" value={ni.cantidad} onChange={e => setNi({ ...ni, cantidad: e.target.value })} style={{ ...IS, width: "85px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <input type="number" min="0" max="100" placeholder="0" value={ni.merma_pct} onChange={e => setNi({ ...ni, merma_pct: e.target.value })} style={{ ...IS, width: "50px" }} />
                  <span style={{ color: "#222", fontSize: "10px" }}>% merma</span>
                </div>
                <Btn onClick={addI}>+ Agregar</Btn>
              </div>
            </div>
            {/* Totales */}
            <div style={{ marginTop: "9px", padding: "10px 0 0", borderTop: "2px solid #b8dfc4" }}>
              {(() => {
                const sinMerma = burger.ingredientes.reduce((s, ing) => {
                  const b = ing.tipo === "insumo" ? (insumos.find(i => i.id === ing.ref_id)?.precio_unidad || 0) * ing.cantidad : calcCostoSalsaKg(salsas.find(s => s.id === ing.ref_id), insumos, ing.cantidad);
                  return s + b;
                }, 0);
                const mermaTotal = costoTotal - sinMerma;
                return (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div style={{ color: "#222", fontSize: "10px", fontFamily: "'DM Mono', monospace", lineHeight: "1.8" }}>
                      <div>Sin merma: {fmt(sinMerma)}</div>
                      <div>Merma total: <span style={{ color: "#cc4400" }}>+{fmt(mermaTotal)}</span></div>
                    </div>
                    <span style={{ color: "#cc4400", fontFamily: "'DM Mono', monospace", fontSize: "17px", fontWeight: "700" }}>= {fmt(costoTotal)}</span>
                  </div>
                );
              })()}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ===================== PUNTO DE EQUILIBRIO =====================
function PuntoEquilibrioTab({ burgers, costosFijos, insumos, salsas, ventas }) {
  const [mix, setMix] = useState(() => burgers.map(b => ({ id: b.id, pct: Math.round(100 / burgers.length) })));
  useEffect(() => { setMix(burgers.map(b => ({ id: b.id, pct: Math.round(100 / burgers.length) }))); }, [burgers.length]);
  const [autoMix, setAutoMix] = useState(true);

  // Calcular mix automático desde ventas reales
  const ventasPorBurger = (ventas || []).reduce((acc, v) => {
    acc[v.burger_id] = (acc[v.burger_id] || 0) + v.cantidad;
    return acc;
  }, {});
  const totalVendido = Object.values(ventasPorBurger).reduce((a, b) => a + b, 0);
  const mixAutoRaw = burgers.map(b => ({
    id: b.id,
    pct: totalVendido > 0 ? Math.round((ventasPorBurger[b.id] || 0) / totalVendido * 100) : Math.round(100 / burgers.length),
    unidades: ventasPorBurger[b.id] || 0,
  }));
  const mixAuto = [...mixAutoRaw].sort((a, b) => b.unidades - a.unidades);

  const activeMix = autoMix ? mixAuto : mix;

  const totalFijos = costosFijos.reduce((s, c) => s + c.monto, 0);
  const margenPond = burgers.reduce((s, b) => { const m = activeMix.find(v => v.id === b.id); return s + (b.precio_venta - calcCostoBurger(b, insumos, salsas)) * (m ? m.pct / 100 : 0); }, 0);
  const unidadesPE = margenPond > 0 ? Math.ceil(totalFijos / margenPond) : 0;
  const ventasPE = burgers.reduce((s, b) => { const m = activeMix.find(v => v.id === b.id); return s + b.precio_venta * (m ? m.pct / 100 : 0) * unidadesPE; }, 0);

  const burgersSorted = autoMix
    ? [...burgers].sort((a, b) => (ventasPorBurger[b.id] || 0) - (ventasPorBurger[a.id] || 0))
    : burgers;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "9px" }}>
        <StatBox label="Costos fijos" value={fmt(totalFijos)} />
        <StatBox label="Margen ponderado" value={fmt(margenPond)} />
        <StatBox label="Hamburguesas necesarias" value={unidadesPE} accent />
        <StatBox label="Ventas necesarias" value={fmt(ventasPE)} />
      </div>
      <StatBox label={`Hamburguesas por día (26 días laborables) para cubrir costos fijos`} value={`${Math.ceil(unidadesPE / 26)} hamburgesas/día`} sub="Por debajo de este número estás perdiendo plata" warn />
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <H title="Mix de ventas" />
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => setAutoMix(true)} style={{ padding: "4px 10px", borderRadius: "6px", border: `1px solid ${autoMix ? "#1a7a3a" : "#ccc"}`, background: autoMix ? "#1a7a3a" : "#fff", color: autoMix ? "#fff" : "#666", fontSize: "10px", fontFamily: "'DM Mono', monospace", fontWeight: "700", cursor: "pointer" }}>
              📊 Ventas reales
            </button>
            <button onClick={() => setAutoMix(false)} style={{ padding: "4px 10px", borderRadius: "6px", border: `1px solid ${!autoMix ? "#1a7a3a" : "#ccc"}`, background: !autoMix ? "#1a7a3a" : "#fff", color: !autoMix ? "#fff" : "#666", fontSize: "10px", fontFamily: "'DM Mono', monospace", fontWeight: "700", cursor: "pointer" }}>
              ✏️ Manual
            </button>
          </div>
        </div>
        {autoMix && totalVendido === 0 && (
          <div style={{ color: "#888", fontSize: "11px", fontFamily: "'DM Mono', monospace", padding: "8px 0", marginBottom: "6px" }}>
            Sin ventas registradas — cargá ventas en la pestaña Ventas para ver el mix automático.
          </div>
        )}
        {burgersSorted.map((b, idx) => {
          const m = activeMix.find(v => v.id === b.id) || { pct: 0, unidades: 0 };
          const costo = calcCostoBurger(b, insumos, salsas);
          const unidades = ventasPorBurger[b.id] || 0;
          return (
            <div key={b.id} style={{ padding: "9px 0", borderTop: "1px solid #d4edd9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {autoMix && <span style={{ color: "#1a7a3a", fontFamily: "'DM Mono', monospace", fontSize: "10px", fontWeight: "700", minWidth: "18px" }}>#{idx + 1}</span>}
                  <span style={{ color: "#1a5c2a", fontSize: "12px" }}>🍔 {b.nombre}</span>
                </div>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <span style={{ color: "#2a6a3a", fontSize: "10px", fontFamily: "'DM Mono', monospace" }}>Costo: {fmt(costo)} | Margen: {fmt(b.precio_venta - costo)}</span>
                  {autoMix && <span style={{ color: "#5a8a6e", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>{unidades} uds</span>}
                  <span style={{ color: "#1a7a3a", fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: "700", width: "32px", textAlign: "right" }}>{m.pct}%</span>
                </div>
              </div>
              {autoMix ? (
                <div style={{ height: "7px", background: "#e8f5ec", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${m.pct}%`, height: "100%", background: idx === 0 ? "#1a7a3a" : idx < 3 ? "#4CAF50" : "#8bc49a", borderRadius: "4px", transition: "width 0.3s" }} />
                </div>
              ) : (
                <input type="range" min="0" max="100" value={m.pct} onChange={e => setMix(mix.map(v => v.id === b.id ? { ...v, pct: Number(e.target.value) } : v))} style={{ width: "100%", accentColor: "#1a7a3a" }} />
              )}
            </div>
          );
        })}
      </Card>
      <Card>
        <H title="Análisis por hamburguesa" />
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: "7px", padding: "3px 0 7px", borderBottom: "1px solid #d4edd9" }}>
          {["Hamburguesa", "Costo", "Precio", "Margen", "% Margen", ""].map((h, i) => <div key={i} style={{ color: "#1a5c2a", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>{h}</div>)}
        </div>
        {burgers.map(b => {
          const costo = calcCostoBurger(b, insumos, salsas);
          const margen = b.precio_venta - costo;
          const pm = b.precio_venta > 0 ? (margen / b.precio_venta) * 100 : 0;
          return (
            <div key={b.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: "7px", padding: "8px 0", borderBottom: "1px solid #e0f0e6", alignItems: "center" }}>
              <span style={{ color: "#1a5c2a", fontSize: "12px" }}>🍔 {b.nombre}</span>
              <span style={{ color: "#cc4400", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>{fmt(costo)}</span>
              <span style={{ color: "#1a5c2a", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>{fmt(b.precio_venta)}</span>
              <span style={{ color: margen > 0 ? "#4CAF50" : "#FF6B6B", fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: "700" }}>{fmt(margen)}</span>
              <span style={{ color: pm > 40 ? "#4CAF50" : pm > 20 ? "#1a7a3a" : "#FF6B35", fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: "700" }}>{pct(pm)}</span>
              <div style={{ height: "7px", background: "#f0faf4", borderRadius: "3px" }}><div style={{ width: `${Math.max(0, pm)}%`, height: "100%", background: pm > 40 ? "#4CAF50" : pm > 20 ? "#1a7a3a" : "#FF6B35", borderRadius: "3px", transition: "width 0.3s" }} /></div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ===================== COSTOS FIJOS =====================
function CostosFijosTab({ costosFijos, setCostosFijos, pagos, setPagos, mesKey }) {
  const [nf, setNf] = useState({ nombre: "", monto: "", categoria: "Servicios" });
  const total = costosFijos.reduce((s, c) => s + c.monto, 0);
  const pagado = costosFijos.filter(c => pagos[`${mesKey}-${c.id}`]).reduce((s, c) => s + c.monto, 0);
  const bycat = CATS_CF.map(cat => ({ cat, items: costosFijos.filter(c => c.categoria === cat) })).filter(g => g.items.length > 0);
  const add = () => { if (!nf.nombre || !nf.monto) return; setCostosFijos([...costosFijos, { id: Date.now(), ...nf, monto: Number(nf.monto) }]); setNf({ ...nf, nombre: "", monto: "" }); };
  const del = (id) => setCostosFijos(costosFijos.filter(c => c.id !== id));
  const tog = (id) => { const k = `${mesKey}-${id}`; setPagos({ ...pagos, [k]: !pagos[k] }); };
  const upd = (id, f, v) => setCostosFijos(costosFijos.map(c => c.id !== id ? c : { ...c, [f]: f === "monto" ? Number(v) : v }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "9px" }}>
        <StatBox label="Total costos fijos" value={fmt(total)} />
        <StatBox label="Ya pagado" value={fmt(pagado)} accent />
        <StatBox label="Pendiente" value={fmt(total - pagado)} warn={total - pagado > 0} />
      </div>
      <Card style={{ padding: "13px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ color: "#222", fontSize: "10px", fontFamily: "'DM Mono', monospace" }}>Pagos {mesActual}</span>
          <span style={{ color: "#1a7a3a", fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: "700" }}>{total > 0 ? pct((pagado / total) * 100) : "0%"}</span>
        </div>
        <div style={{ height: "8px", background: "#f0faf4", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ width: `${total > 0 ? (pagado / total) * 100 : 0}%`, height: "100%", background: "linear-gradient(90deg, #4CAF50, #1a7a3a)", transition: "width 0.3s", borderRadius: "4px" }} />
        </div>
      </Card>
      {bycat.map(({ cat, items }) => (
        <Card key={cat}>
          <div style={{ marginBottom: "9px", color: "#1a5c2a", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>{cat}</div>
          {items.map(c => {
            const p = pagos[`${mesKey}-${c.id}`];
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "7px 0", borderTop: "1px solid #f0f7f3" }}>
                <button onClick={() => tog(c.id)} style={{ width: "24px", height: "24px", borderRadius: "50%", background: p ? "#4CAF50" : "#111", border: `2px solid ${p ? "#4CAF50" : "#222"}`, color: p ? "#fff" : "#333", cursor: "pointer", fontSize: "11px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{p ? "✓" : "○"}</button>
                <input value={c.nombre} onChange={e => upd(c.id, "nombre", e.target.value)} style={{ ...IS, flex: 1, color: p ? "#888" : "#1a2e1a", textDecoration: p ? "line-through" : "none" }} />
                <input type="number" value={c.monto} onChange={e => upd(c.id, "monto", e.target.value)} style={{ ...IS, width: "115px", color: p ? "#333" : "#1a7a3a", fontWeight: "700" }} />
                <X onClick={() => del(c.id)} />
              </div>
            );
          })}
        </Card>
      ))}
      <Card>
        <H title="Agregar costo fijo" />
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
          <input placeholder="Nombre" value={nf.nombre} onChange={e => setNf({ ...nf, nombre: e.target.value })} style={{ ...IS, flex: "1 1 140px" }} />
          <select value={nf.categoria} onChange={e => setNf({ ...nf, categoria: e.target.value })} style={{ ...IS }}>{CATS_CF.map(c => <option key={c}>{c}</option>)}</select>
          <input type="number" placeholder="Monto $" value={nf.monto} onChange={e => setNf({ ...nf, monto: e.target.value })} style={{ ...IS, width: "115px" }} />
          <Btn onClick={add}>+ Agregar</Btn>
        </div>
      </Card>
    </div>
  );
}

// ===================== PROVEEDORES =====================
function ProveedoresTab({ proveedores, setProveedores, pagosP, setPagosP, mesKey }) {
  const [nf, setNf] = useState({ nombre: "", deuda: "", categoria: "Proveedor" });
  const totalDeuda = proveedores.reduce((s, p) => s + p.deuda, 0);
  const totalPagado = proveedores.filter(p => pagosP[`${mesKey}-p-${p.id}`]).reduce((s, p) => s + p.deuda, 0);
  const totalPendiente = totalDeuda - totalPagado;
  const bycat = CATS_PROV.map(cat => ({ cat, items: proveedores.filter(p => p.categoria === cat) })).filter(g => g.items.length > 0);

  const add = () => {
    if (!nf.nombre || !nf.deuda) return;
    setProveedores([...proveedores, { id: Date.now(), nombre: nf.nombre, deuda: Number(nf.deuda), categoria: nf.categoria }]);
    setNf({ ...nf, nombre: "", deuda: "" });
  };
  const del = (id) => setProveedores(proveedores.filter(p => p.id !== id));
  const tog = (id) => { const k = `${mesKey}-p-${id}`; setPagosP({ ...pagosP, [k]: !pagosP[k] }); };
  const upd = (id, f, v) => setProveedores(proveedores.map(p => p.id !== id ? p : { ...p, [f]: f === "deuda" ? Number(v) : v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "9px" }}>
        <StatBox label="Total adeudado proveedores" value={fmt(totalDeuda)} warn={totalDeuda > 0} />
        <StatBox label="Ya pagado" value={fmt(totalPagado)} accent />
        <StatBox label="Pendiente de pago" value={fmt(totalPendiente)} warn={totalPendiente > 0} />
      </div>

      {totalDeuda > 0 && (
        <Card style={{ padding: "13px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ color: "#5a8a6e", fontSize: "10px", fontFamily: "'DM Mono', monospace" }}>Progreso de pagos — {mesActual}</span>
            <span style={{ color: "#1a7a3a", fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: "700" }}>{totalDeuda > 0 ? pct((totalPagado / totalDeuda) * 100) : "0%"}</span>
          </div>
          <div style={{ height: "8px", background: "#e8f5ec", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${totalDeuda > 0 ? (totalPagado / totalDeuda) * 100 : 0}%`, height: "100%", background: "linear-gradient(90deg, #1a7a3a, #4CAF50)", transition: "width 0.3s", borderRadius: "4px" }} />
          </div>
        </Card>
      )}

      {bycat.map(({ cat, items }) => (
        <Card key={cat}>
          <div style={{ marginBottom: "9px", color: "#7aaa8e", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>{cat}</div>
          {items.map(p => {
            const pagado = pagosP[`${mesKey}-p-${p.id}`];
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "8px 0", borderTop: "1px solid #ddeee3" }}>
                <button onClick={() => tog(p.id)} style={{ width: "24px", height: "24px", borderRadius: "50%", background: pagado ? "#1a7a3a" : "#eaf4ed", border: `2px solid ${pagado ? "#1a7a3a" : "#c8e6d0"}`, color: pagado ? "#fff" : "#6a9a7e", cursor: "pointer", fontSize: "11px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{pagado ? "✓" : "○"}</button>
                <input value={p.nombre} onChange={e => upd(p.id, "nombre", e.target.value)} style={{ ...IS, flex: 1, color: pagado ? "#6a9a7e" : "#1a3a25", textDecoration: pagado ? "line-through" : "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: "#7aaa8e", fontSize: "11px" }}>$</span>
                  <input type="number" value={p.deuda} onChange={e => upd(p.id, "deuda", e.target.value)} style={{ ...IS, width: "130px", color: pagado ? "#6a9a7e" : "#cc4400", fontWeight: "700" }} />
                </div>
                <X onClick={() => del(p.id)} />
              </div>
            );
          })}
        </Card>
      ))}

      {proveedores.length === 0 && (
        <Card>
          <div style={{ textAlign: "center", padding: "20px", color: "#7aaa8e", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>No hay proveedores cargados todavía</div>
        </Card>
      )}

      <Card>
        <H title="Agregar proveedor" />
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
          <input placeholder="Nombre del proveedor" value={nf.nombre} onChange={e => setNf({ ...nf, nombre: e.target.value })} style={{ ...IS, flex: "1 1 150px" }} />
          <select value={nf.categoria} onChange={e => setNf({ ...nf, categoria: e.target.value })} style={{ ...IS }}>{CATS_PROV.map(c => <option key={c}>{c}</option>)}</select>
          <input type="number" placeholder="Deuda actual $" value={nf.deuda} onChange={e => setNf({ ...nf, deuda: e.target.value })} style={{ ...IS, width: "140px" }} />
          <Btn onClick={add}>+ Agregar</Btn>
        </div>
      </Card>
    </div>
  );
}
// ===================== VENTAS =====================
function VentasTab({ ventas, setVentas, burgers, insumos, salsas }) {
  const todayISO = new Date().toISOString().split("T")[0];
  const [fecha, setFecha] = useState(todayISO);
  const [burgerId, setBurgerId] = useState("");
  const [cantidad, setCantidad] = useState("1");

  const fmtFecha = (iso) => { try { const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; } catch { return iso; } };

  const selected = burgers.find(b => b.id === Number(burgerId));

  const add = () => {
    if (!burgerId || !cantidad || Number(cantidad) <= 0) return;
    setVentas([...ventas, {
      id: Date.now(),
      fecha: fmtFecha(fecha),
      burger_id: Number(burgerId),
      burger_nombre: selected?.nombre || "",
      cantidad: Number(cantidad),
      precio_unit: selected?.precio_venta || 0,
    }]);
    setCantidad("1");
  };

  const totalVentas = ventas.reduce((s, v) => s + v.precio_unit * v.cantidad, 0);
  const totalUnidades = ventas.reduce((s, v) => s + v.cantidad, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "9px" }}>
        <StatBox label="Total ventas" value={fmt(totalVentas)} accent />
        <StatBox label="Unidades vendidas" value={totalUnidades} accent={totalUnidades > 0} />
        <StatBox label="Registros" value={ventas.length} />
      </div>

      <Card>
        <H title="Registrar venta" />
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 80px auto", gap: "8px", alignItems: "end" }}>
          <div>
            <div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>FECHA</div>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ ...IS, width: "100%" }} />
          </div>
          <div>
            <div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>HAMBURGUESA</div>
            <select value={burgerId} onChange={e => setBurgerId(e.target.value)} style={{ ...IS, width: "100%" }}>
              <option value="">Seleccionar...</option>
              {burgers.map(b => <option key={b.id} value={b.id}>{b.nombre} — {fmt(b.precio_venta)}</option>)}
            </select>
          </div>
          <div>
            <div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>CANTIDAD</div>
            <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} style={{ ...IS, width: "100%" }} />
          </div>
          <Btn onClick={add}>+ Agregar</Btn>
        </div>
        {selected && (
          <div style={{ marginTop: "10px", padding: "8px 12px", background: "#f0f9f2", borderRadius: "6px", display: "flex", justifyContent: "space-between", fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#5a8a6e" }}>
            <span>Subtotal: <strong style={{ color: "#1a7a3a" }}>{fmt(selected.precio_venta * Number(cantidad || 0))}</strong></span>
            <span>Precio unit: <strong style={{ color: "#1a7a3a" }}>{fmt(selected.precio_venta)}</strong></span>
          </div>
        )}
      </Card>

      <Card>
        <H title="Ventas registradas">
          {ventas.length > 0 && <Btn variant="secondary" onClick={() => { if (window.confirm("¿Borrar todas las ventas?")) setVentas([]); }}>Limpiar</Btn>}
        </H>
        {ventas.length > 0 ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #c8e6d0" }}>
                    {["Fecha","Hamburguesa","Cant","Precio unit","Subtotal",""].map(h => (
                      <th key={h} style={{ padding: "8px 10px", color: "#5a8a6e", fontSize: "9px", letterSpacing: "0.1em", textAlign: h === "Fecha" || h === "Hamburguesa" || h === "" ? "left" : "right", textTransform: "uppercase", fontWeight: "700" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v, i) => (
                    <tr key={v.id} style={{ borderBottom: "1px solid #e8f5ec", background: i % 2 === 0 ? "#fafffe" : "#ffffff" }}>
                      <td style={{ padding: "9px 10px", color: "#5a8a6e", fontSize: "10px", whiteSpace: "nowrap" }}>{v.fecha}</td>
                      <td style={{ padding: "9px 10px", color: "#1a3a25" }}>{v.burger_nombre}</td>
                      <td style={{ padding: "9px 10px", textAlign: "right", color: "#1a3a25", fontWeight: "700" }}>{v.cantidad}</td>
                      <td style={{ padding: "9px 10px", textAlign: "right", color: "#5a8a6e" }}>{fmt(v.precio_unit)}</td>
                      <td style={{ padding: "9px 10px", textAlign: "right", color: "#1a7a3a", fontWeight: "700" }}>{fmt(v.precio_unit * v.cantidad)}</td>
                      <td style={{ padding: "9px 4px" }}><X onClick={() => setVentas(ventas.filter(x => x.id !== v.id))} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #c8e6d0" }}>
                    <td colSpan={2} style={{ padding: "10px", color: "#5a8a6e", fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: "700" }}>TOTAL</td>
                    <td style={{ padding: "10px", textAlign: "right", fontWeight: "700", fontFamily: "'DM Mono', monospace" }}>{totalUnidades}</td>
                    <td />
                    <td style={{ padding: "10px", textAlign: "right", color: "#1a7a3a", fontWeight: "700", fontSize: "14px", fontFamily: "'DM Mono', monospace" }}>{fmt(totalVentas)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "32px", color: "#8aba9e", fontFamily: "'DM Mono', monospace", fontSize: "11px" }}>No hay ventas registradas.</div>
        )}
      </Card>
    </div>
  );
}

// ===================== STOCK =====================
function StockTab({ insumos, ventas, burgers, salsas, stockInicial, setStockInicial, ingresosStock, setIngresosStock }) {
  const today = new Date().toISOString().split("T")[0];
  const [showForm, setShowForm] = useState(false);
  const [fechaIngreso, setFechaIngreso] = useState(today);
  const [notaIngreso, setNotaIngreso] = useState("");
  const [cantIngresos, setCantIngresos] = useState({});
  const [histExpanded, setHistExpanded] = useState(false);
  const fmtFechaIng = (iso) => { try { const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; } catch { return iso; } };

  // Consumo total desde ventas
  const consumoTotal = {};
  for (const v of ventas) {
    const burger = burgers.find(b => b.id === v.burger_id);
    if (!burger) continue;
    const consumo = calcConsumoVenta(burger, v.cantidad, salsas);
    for (const [insumoId, cant] of Object.entries(consumo)) {
      consumoTotal[insumoId] = (consumoTotal[insumoId] || 0) + cant;
    }
  }

  // Ingresos acumulados por insumo
  const ingresosExtras = {};
  for (const ing of ingresosStock) {
    for (const item of ing.items) {
      ingresosExtras[item.insumoId] = (ingresosExtras[item.insumoId] || 0) + item.cantidad;
    }
  }

  const setStock = (id, val) => setStockInicial(prev => ({ ...prev, [id]: Number(val) || 0 }));

  const fmtCant = (n) => {
    if (n === undefined || n === null) return "—";
    return Number(n).toFixed(3).replace(/\.?0+$/, "") || "0";
  };

  const bycat = CATS_INSUMO.map(cat => ({
    cat,
    items: insumos.filter(i => i.categoria === cat)
  })).filter(g => g.items.length > 0);

  const totalInsumos = insumos.length;
  const sinStock = insumos.filter(i => !stockInicial[i.id] && !ingresosExtras[i.id]).length;
  const enRojo = insumos.filter(i => {
    const ini = (stockInicial[i.id] || 0) + (ingresosExtras[i.id] || 0);
    const con = consumoTotal[i.id] || 0;
    return ini > 0 && (ini - con) / ini < 0.1;
  }).length;

  function registrarIngreso() {
    const items = Object.entries(cantIngresos)
      .filter(([, v]) => Number(v) > 0)
      .map(([id, cant]) => ({ insumoId: id, cantidad: Number(cant) }));
    if (items.length === 0) return;
    setIngresosStock(prev => [{ id: Date.now(), fecha: fechaIngreso, nota: notaIngreso.trim(), items }, ...(prev || [])]);
    setCantIngresos({});
    setNotaIngreso("");
    setFechaIngreso(today);
    setShowForm(false);
  }

  function eliminarIngreso(id) {
    if (!confirm("¿Eliminar este ingreso?")) return;
    setIngresosStock(prev => (prev || []).filter(i => i.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "9px" }}>
        <StatBox label="Total insumos" value={totalInsumos} />
        <StatBox label="Sin stock cargado" value={sinStock} warn={sinStock > 0} />
        <StatBox label="Stock crítico (<10%)" value={enRojo} warn={enRojo > 0} />
      </div>

      {/* ── Ingreso de mercadería ── */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showForm ? "14px" : "0" }}>
          <H title="📦 Ingreso de mercadería" />
          <button onClick={() => setShowForm(v => !v)} style={{ border: "none", borderRadius: "6px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontWeight: "700", background: showForm ? "#e8f5ec" : "#1a3a25", color: showForm ? "#1a3a25" : "#fff", fontSize: "12px", padding: "6px 14px" }}>
            {showForm ? "Cancelar" : "+ Registrar ingreso"}
          </button>
        </div>
        {showForm && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ fontSize: "10px", color: "#5a8a6e", fontWeight: "700", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>FECHA</label>
                <input type="date" value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} style={{ ...IS, width: "100%" }} />
              </div>
              <div style={{ flex: 2, minWidth: 200 }}>
                <label style={{ fontSize: "10px", color: "#5a8a6e", fontWeight: "700", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>PROVEEDOR / NOTA (opcional)</label>
                <input value={notaIngreso} onChange={e => setNotaIngreso(e.target.value)} placeholder="Ej: Pedido Proveedor X" style={{ ...IS, width: "100%" }} />
              </div>
            </div>
            {bycat.map(({ cat, items }) => (
              <div key={cat}>
                <div style={{ fontSize: "10px", color: "#5a8a6e", fontWeight: "700", letterSpacing: "0.08em", marginBottom: "8px", textTransform: "uppercase" }}>{cat}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "6px" }}>
                  {items.map(ins => (
                    <div key={ins.id} style={{ display: "flex", alignItems: "center", gap: "8px", background: cantIngresos[ins.id] > 0 ? "#e8f5ec" : "#f9f9f9", borderRadius: "8px", padding: "7px 10px", border: `1px solid ${cantIngresos[ins.id] > 0 ? "#c8e6d0" : "#eee"}` }}>
                      <span style={{ flex: 1, fontSize: "12px", color: "#1a3a25", fontWeight: cantIngresos[ins.id] > 0 ? "700" : "400" }}>{ins.nombre}</span>
                      <span style={{ fontSize: "10px", color: "#aaa", minWidth: 28 }}>{ins.unidad}</span>
                      <input
                        type="number" min="0" step="0.001" placeholder="0"
                        value={cantIngresos[ins.id] || ""}
                        onChange={e => setCantIngresos(p => ({ ...p, [ins.id]: e.target.value }))}
                        style={{ ...IS, width: "70px", textAlign: "right", padding: "4px 6px", fontSize: "12px" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "4px" }}>
              <button onClick={registrarIngreso}
                disabled={!Object.values(cantIngresos).some(v => Number(v) > 0)}
                style={{ border: "none", borderRadius: "6px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontWeight: "700", padding: "8px 18px", background: "#1a7a3a", color: "#fff", opacity: Object.values(cantIngresos).some(v => Number(v) > 0) ? 1 : 0.4 }}>
                ✅ Guardar ingreso
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Historial de ingresos ── */}
      {(ingresosStock || []).length > 0 && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setHistExpanded(v => !v)}>
            <H title={`📋 Historial de ingresos (${ingresosStock.length})`} />
            <span style={{ fontSize: "12px", color: "#5a8a6e" }}>{histExpanded ? "▲ Ocultar" : "▼ Ver"}</span>
          </div>
          {histExpanded && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
              {(ingresosStock || []).slice(0, 30).map(ing => (
                <div key={ing.id} style={{ background: "#f9fdf9", border: "1px solid #e0f0e8", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div>
                      <span style={{ fontWeight: "700", fontSize: "12px", color: "#1a3a25", fontFamily: "'DM Mono', monospace" }}>{fmtFechaIng(ing.fecha)}</span>
                      {ing.nota && <span style={{ marginLeft: "8px", fontSize: "11px", color: "#5a8a6e" }}>{ing.nota}</span>}
                    </div>
                    <button onClick={() => eliminarIngreso(ing.id)} style={{ background: "transparent", border: "none", color: "#ccc", cursor: "pointer", fontSize: "14px", padding: "0 4px" }}>✕</button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {ing.items.map(item => {
                      const ins = insumos.find(i => i.id === item.insumoId);
                      return (
                        <span key={item.insumoId} style={{ background: "#e8f5ec", color: "#1a3a25", fontSize: "11px", padding: "2px 8px", borderRadius: "4px", fontFamily: "'DM Mono', monospace" }}>
                          {ins?.nombre || item.insumoId}: +{fmtCant(item.cantidad)} {ins?.unidad || ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {bycat.map(({ cat, items }) => (
        <Card key={cat}>
          <H title={cat} />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #c8e6d0" }}>
                  {["Insumo","Unidad","Stock base","Ingresos","Consumido","Stock actual","Estado"].map(h => (
                    <th key={h} style={{ padding: "7px 10px", color: "#5a8a6e", fontSize: "9px", letterSpacing: "0.1em", textAlign: h === "Insumo" ? "left" : "right", textTransform: "uppercase", fontWeight: "700" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((ins, i) => {
                  const ini = stockInicial[ins.id] || 0;
                  const ingresos = ingresosExtras[ins.id] || 0;
                  const con = consumoTotal[ins.id] || 0;
                  const actual = ini + ingresos - con;
                  const base = ini + ingresos;
                  const pctLeft = base > 0 ? actual / base : null;
                  const estado = pctLeft === null ? { label: "Sin datos", color: "#aaa", bg: "#f5f5f5" }
                    : pctLeft < 0 ? { label: "Negativo", color: "#cc0000", bg: "#fff0f0" }
                    : pctLeft < 0.1 ? { label: "Crítico", color: "#cc4400", bg: "#fff3ee" }
                    : pctLeft < 0.25 ? { label: "Bajo", color: "#e67e00", bg: "#fffbee" }
                    : { label: "OK", color: "#1a7a3a", bg: "#f0faf4" };
                  return (
                    <tr key={ins.id} style={{ borderBottom: "1px solid #e8f5ec", background: i % 2 === 0 ? "#fafffe" : "#ffffff" }}>
                      <td style={{ padding: "8px 10px", color: "#1a3a25" }}>{ins.nombre}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: "#5a8a6e" }}>{ins.unidad}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right" }}>
                        <input
                          type="number" min="0" step="0.001"
                          value={stockInicial[ins.id] ?? ""}
                          onChange={e => setStock(ins.id, e.target.value)}
                          placeholder="0"
                          style={{ ...IS, width: "90px", textAlign: "right", padding: "4px 7px", fontSize: "11px" }}
                        />
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: ingresos > 0 ? "#1a7a3a" : "#bbb", fontWeight: ingresos > 0 ? "700" : "400" }}>{ingresos > 0 ? `+${fmtCant(ingresos)}` : "—"}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: con > 0 ? "#cc4400" : "#bbb" }}>{fmtCant(con)}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: actual < 0 ? "#cc0000" : actual === 0 && base === 0 ? "#aaa" : "#1a3a25", fontWeight: "700" }}>{base === 0 && con === 0 ? "—" : fmtCant(actual)}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right" }}>
                        <span style={{ background: estado.bg, color: estado.color, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>{estado.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ===================== CAJA DIARIA =====================
function CajaDiariaTab({ cajaDiaria, setCajaDiaria, presets, setPresets }) {
  const todayISO = new Date().toISOString().split("T")[0];
  const [fecha, setFecha] = useState(todayISO);
  const [concepto, setConcepto] = useState("");
  const [ingreso, setIngreso] = useState("");
  const [egreso, setEgreso] = useState("");
  const [nuevoPreset, setNuevoPreset] = useState("");
  const [rDesde, setRDesde] = useState("");
  const [rHasta, setRHasta] = useState("");
  const [rConcepto, setRConcepto] = useState("");

  const movs = cajaDiaria || [];
  const prs = presets || [];

  let acum = 0;
  const rows = movs.map(mov => {
    acum += (Number(mov.ingreso) || 0) - (Number(mov.egreso) || 0);
    return { ...mov, saldo: acum };
  });
  const saldoFinal = rows.length > 0 ? rows[rows.length - 1].saldo : 0;
  const totalIngresos = movs.reduce((s, m) => s + (Number(m.ingreso) || 0), 0);
  const totalEgresos = movs.reduce((s, m) => s + (Number(m.egreso) || 0), 0);

  const fmtFecha = (iso) => { const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; };
  const parseDate = (str) => { try { const [d,m,y] = str.split("/"); return new Date(y, m-1, d); } catch { return null; } };

  const add = () => {
    if (!concepto.trim() || (!ingreso && !egreso)) return;
    setCajaDiaria([...movs, { id: Date.now(), fecha: fmtFecha(fecha), concepto: concepto.trim(), ingreso: Number(ingreso) || 0, egreso: Number(egreso) || 0 }]);
    setConcepto(""); setIngreso(""); setEgreso("");
  };

  const addPreset = () => {
    if (!nuevoPreset.trim()) return;
    setPresets([...prs, { id: Date.now(), nombre: nuevoPreset.trim() }]);
    setNuevoPreset("");
  };

  // Filtro para reporte
  const desdeDate = rDesde ? new Date(rDesde) : null;
  const hastaDate = rHasta ? new Date(new Date(rHasta).setHours(23,59,59)) : null;
  const movsFiltrados = movs.filter(m => {
    const d = parseDate(m.fecha);
    if (!d) return false;
    if (desdeDate && d < desdeDate) return false;
    if (hastaDate && d > hastaDate) return false;
    if (rConcepto && m.concepto !== rConcepto) return false;
    return true;
  });

  // Agrupar por concepto para el reporte
  const porConcepto = {};
  for (const m of movsFiltrados) {
    if (!porConcepto[m.concepto]) porConcepto[m.concepto] = { ingreso: 0, egreso: 0 };
    porConcepto[m.concepto].ingreso += Number(m.ingreso) || 0;
    porConcepto[m.concepto].egreso += Number(m.egreso) || 0;
  }
  const reporteFilas = Object.entries(porConcepto).map(([c, v]) => ({ concepto: c, ...v, saldo: v.ingreso - v.egreso }));
  const reporteTotalIng = reporteFilas.reduce((s, r) => s + r.ingreso, 0);
  const reporteTotalEgr = reporteFilas.reduce((s, r) => s + r.egreso, 0);

  // Todos los conceptos usados (para el filtro)
  const conceptosUsados = [...new Set(movs.map(m => m.concepto))].sort();

  const mono = "'DM Mono', monospace";
  const chipStyle = (active) => ({ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontFamily: mono, cursor: "pointer", border: `1px solid ${active ? "#1a7a3a" : "#c8e6c9"}`, background: active ? "#1a7a3a" : "#f0faf4", color: active ? "#fff" : "#2a5a3a", transition: "all 0.1s" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* ── Resumen ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "9px" }}>
        <StatBox label="Efectivo disponible" value={fmt(saldoFinal)} accent={saldoFinal >= 0} warn={saldoFinal < 0} sub="Alimenta solapa Caja" />
        <StatBox label="Total ingresos" value={fmt(totalIngresos)} accent />
        <StatBox label="Total egresos" value={fmt(totalEgresos)} warn={totalEgresos > 0} />
      </div>

      {/* ── Conceptos predefinidos ── */}
      <Card>
        <H title="Conceptos habituales">
          <div style={{ display: "flex", gap: "6px" }}>
            <input placeholder="Nuevo concepto..." value={nuevoPreset} onChange={e => setNuevoPreset(e.target.value)} onKeyDown={e => e.key === "Enter" && addPreset()} style={{ ...IS, fontSize: "11px", padding: "5px 9px" }} />
            <Btn onClick={addPreset}>+ Guardar</Btn>
          </div>
        </H>
        {prs.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {prs.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <span onClick={() => setConcepto(p.nombre)} style={chipStyle(concepto === p.nombre)}>{p.nombre}</span>
                <button onClick={() => setPresets(prs.filter(x => x.id !== p.id))} style={{ background: "none", border: "none", color: "#c8a0a0", cursor: "pointer", fontSize: "12px", padding: "0 2px", lineHeight: 1 }}>✕</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#8aba9e", fontSize: "11px", fontFamily: mono }}>Guardá conceptos frecuentes para seleccionarlos rápido (ej: "Venta efectivo", "Pago proveedor")</div>
        )}
      </Card>

      {/* ── Nuevo movimiento ── */}
      <Card>
        <H title="Nuevo movimiento" />
        <div style={{ display: "grid", gridTemplateColumns: "140px 2fr 1fr 1fr auto", gap: "8px", alignItems: "end" }}>
          <div>
            <div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: mono, marginBottom: "4px" }}>FECHA</div>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ ...IS, width: "100%" }} />
          </div>
          <div>
            <div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: mono, marginBottom: "4px" }}>CONCEPTO</div>
            <input placeholder="Descripción o seleccioná arriba..." value={concepto} onChange={e => setConcepto(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} style={{ ...IS, width: "100%" }} />
          </div>
          <div>
            <div style={{ color: "#1a7a3a", fontSize: "9px", fontFamily: mono, marginBottom: "4px" }}>↑ INGRESO $</div>
            <input type="number" placeholder="0" value={ingreso} onChange={e => setIngreso(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} style={{ ...IS, width: "100%" }} />
          </div>
          <div>
            <div style={{ color: "#cc4400", fontSize: "9px", fontFamily: mono, marginBottom: "4px" }}>↓ EGRESO $</div>
            <input type="number" placeholder="0" value={egreso} onChange={e => setEgreso(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} style={{ ...IS, width: "100%" }} />
          </div>
          <Btn onClick={add}>+ Agregar</Btn>
        </div>
      </Card>

      {/* ── Tabla de movimientos ── */}
      <Card>
        <H title="Movimientos registrados">
          {movs.length > 0 && <Btn variant="secondary" onClick={() => { if (window.confirm("¿Borrar todos los movimientos?")) setCajaDiaria([]); }}>Limpiar todo</Btn>}
        </H>
        {rows.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: "12px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #c8e6d0" }}>
                  {[{l:"Fecha",a:"left"},{l:"Concepto",a:"left"},{l:"Ingreso",a:"right"},{l:"Egreso",a:"right"},{l:"Saldo",a:"right"},{l:"",a:"center"}].map(c => (
                    <th key={c.l} style={{ padding: "8px 10px", color: "#5a8a6e", fontWeight: "700", fontSize: "9px", letterSpacing: "0.1em", textAlign: c.a, textTransform: "uppercase" }}>{c.l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #e8f5ec", background: i % 2 === 0 ? "#fafffe" : "#fff" }}>
                    <td style={{ padding: "9px 10px", color: "#5a8a6e", fontSize: "10px", whiteSpace: "nowrap" }}>{r.fecha}</td>
                    <td style={{ padding: "9px 10px", color: "#1a3a25" }}>{r.concepto}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", color: r.ingreso > 0 ? "#1a7a3a" : "#bbb", fontWeight: r.ingreso > 0 ? "700" : "400" }}>{r.ingreso > 0 ? fmt(r.ingreso) : "—"}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", color: r.egreso > 0 ? "#cc4400" : "#bbb", fontWeight: r.egreso > 0 ? "700" : "400" }}>{r.egreso > 0 ? fmt(r.egreso) : "—"}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", color: r.saldo >= 0 ? "#1a5c2a" : "#cc4400", fontWeight: "700" }}>{fmt(r.saldo)}</td>
                    <td style={{ padding: "9px 4px", textAlign: "center" }}><X onClick={() => setCajaDiaria(movs.filter(m => m.id !== r.id))} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid #c8e6d0" }}>
                  <td colSpan={2} style={{ padding: "10px", color: "#5a8a6e", fontFamily: mono, fontSize: "11px", fontWeight: "700" }}>SALDO FINAL</td>
                  <td style={{ padding: "10px", textAlign: "right", color: "#1a7a3a", fontWeight: "700", fontSize: "13px" }}>{fmt(totalIngresos)}</td>
                  <td style={{ padding: "10px", textAlign: "right", color: "#cc4400", fontWeight: "700", fontSize: "13px" }}>{fmt(totalEgresos)}</td>
                  <td style={{ padding: "10px", textAlign: "right", color: saldoFinal >= 0 ? "#1a7a3a" : "#cc4400", fontWeight: "700", fontSize: "15px" }}>{fmt(saldoFinal)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "32px", color: "#8aba9e", fontFamily: mono, fontSize: "11px" }}>
            No hay movimientos registrados.<br />Agregá un ingreso o egreso para comenzar.
          </div>
        )}
      </Card>

      {/* ── Reporte por período ── */}
      <Card style={{ border: "1px solid #b8d8c8" }}>
        <H title="Reporte por período" />

        {/* Filtros */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          <div>
            <div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: mono, marginBottom: "4px" }}>DESDE</div>
            <input type="date" value={rDesde} onChange={e => setRDesde(e.target.value)} style={{ ...IS, width: "100%" }} />
          </div>
          <div>
            <div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: mono, marginBottom: "4px" }}>HASTA</div>
            <input type="date" value={rHasta} onChange={e => setRHasta(e.target.value)} style={{ ...IS, width: "100%" }} />
          </div>
          <div>
            <div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: mono, marginBottom: "4px" }}>CONCEPTO (opcional)</div>
            <select value={rConcepto} onChange={e => setRConcepto(e.target.value)} style={{ ...IS, width: "100%" }}>
              <option value="">Todos los conceptos</option>
              {conceptosUsados.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <Btn variant="secondary" style={{ fontSize: "10px" }} onClick={() => { const h = new Date(); const d = new Date(); d.setDate(1); setRDesde(d.toISOString().split("T")[0]); setRHasta(h.toISOString().split("T")[0]); }}>Este mes</Btn>
          <Btn variant="secondary" style={{ fontSize: "10px" }} onClick={() => { const h = new Date(); const d = new Date(); d.setDate(h.getDate() - 6); setRDesde(d.toISOString().split("T")[0]); setRHasta(h.toISOString().split("T")[0]); }}>Últimos 7 días</Btn>
          <Btn variant="secondary" style={{ fontSize: "10px" }} onClick={() => { setRDesde(""); setRHasta(""); setRConcepto(""); }}>Limpiar filtro</Btn>
        </div>

        {movsFiltrados.length > 0 ? (
          <>
            {/* Resumen del período */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "9px", marginBottom: "14px" }}>
              <StatBox label="Ingresos período" value={fmt(reporteTotalIng)} accent />
              <StatBox label="Egresos período" value={fmt(reporteTotalEgr)} warn={reporteTotalEgr > 0} />
              <StatBox label="Saldo período" value={fmt(reporteTotalIng - reporteTotalEgr)} accent={reporteTotalIng >= reporteTotalEgr} warn={reporteTotalIng < reporteTotalEgr} />
            </div>

            {/* Tabla por concepto */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: "12px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #c8e6d0" }}>
                  {[{l:"Concepto",a:"left"},{l:"Ingresos",a:"right"},{l:"Egresos",a:"right"},{l:"Saldo",a:"right"}].map(c => (
                    <th key={c.l} style={{ padding: "8px 10px", color: "#5a8a6e", fontSize: "9px", letterSpacing: "0.1em", textAlign: c.a, textTransform: "uppercase", fontWeight: "700" }}>{c.l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reporteFilas.sort((a,b) => b.saldo - a.saldo).map((r, i) => (
                  <tr key={r.concepto} style={{ borderBottom: "1px solid #e8f5ec", background: i % 2 === 0 ? "#fafffe" : "#fff" }}>
                    <td style={{ padding: "9px 10px", color: "#1a3a25", fontWeight: "600" }}>{r.concepto}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", color: r.ingreso > 0 ? "#1a7a3a" : "#bbb", fontWeight: r.ingreso > 0 ? "700" : "400" }}>{r.ingreso > 0 ? fmt(r.ingreso) : "—"}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", color: r.egreso > 0 ? "#cc4400" : "#bbb", fontWeight: r.egreso > 0 ? "700" : "400" }}>{r.egreso > 0 ? fmt(r.egreso) : "—"}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", color: r.saldo >= 0 ? "#1a5c2a" : "#cc4400", fontWeight: "700" }}>{fmt(r.saldo)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid #c8e6d0" }}>
                  <td style={{ padding: "10px", color: "#5a8a6e", fontFamily: mono, fontSize: "11px", fontWeight: "700" }}>TOTAL PERÍODO ({movsFiltrados.length} movimientos)</td>
                  <td style={{ padding: "10px", textAlign: "right", color: "#1a7a3a", fontWeight: "700", fontSize: "13px" }}>{fmt(reporteTotalIng)}</td>
                  <td style={{ padding: "10px", textAlign: "right", color: "#cc4400", fontWeight: "700", fontSize: "13px" }}>{fmt(reporteTotalEgr)}</td>
                  <td style={{ padding: "10px", textAlign: "right", color: reporteTotalIng >= reporteTotalEgr ? "#1a7a3a" : "#cc4400", fontWeight: "700", fontSize: "15px" }}>{fmt(reporteTotalIng - reporteTotalEgr)}</td>
                </tr>
              </tfoot>
            </table>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "28px", color: "#8aba9e", fontFamily: mono, fontSize: "11px" }}>
            {movs.length === 0 ? "No hay movimientos cargados aún." : "No hay movimientos en el período seleccionado."}
          </div>
        )}
      </Card>

    </div>
  );
}

function CajaBancoTab({ costosFijos, pagos, proveedores, pagosP, mesKey, cajaDiaria, setCajaDiaria, banco, setBanco, pedidosPendientes, setPedidosPendientes, ventasDiarias, setVentasDiarias, registros, setRegistros }) {
  const [ventasHoy, setVentasHoy] = useState("");
  const [concepto, setConcepto] = useState("");
  const [ingreso, setIngreso] = useState("");
  const [egreso, setEgreso] = useState("");
  const todayISO = new Date().toISOString().split("T")[0];
  const [fechaMov, setFechaMov] = useState(todayISO);

  const movs = cajaDiaria || [];
  let acum = 0;
  const movRows = movs.map(m => { acum += (Number(m.ingreso) || 0) - (Number(m.egreso) || 0); return { ...m, saldo: acum }; });
  const saldoCajaDiaria = movRows.length > 0 ? movRows[movRows.length - 1].saldo : 0;
  const fmtFechaMov = (iso) => { const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; };

  const addMov = () => {
    if (!concepto.trim() || (!ingreso && !egreso)) return;
    setCajaDiaria([...movs, { id: Date.now(), fecha: fmtFechaMov(fechaMov), concepto: concepto.trim(), ingreso: Number(ingreso) || 0, egreso: Number(egreso) || 0 }]);
    setConcepto(""); setIngreso(""); setEgreso("");
  };

  const totalFijos = costosFijos.reduce((s, c) => s + c.monto, 0);
  const totalFijosPagado = costosFijos.filter(c => pagos[`${mesKey}-${c.id}`]).reduce((s, c) => s + c.monto, 0);
  const fijosPendientes = totalFijos - totalFijosPagado;

  const totalProveedores = (proveedores || []).reduce((s, p) => s + p.deuda, 0);
  const totalProvPagado = (proveedores || []).filter(p => pagosP[`${mesKey}-p-${p.id}`]).reduce((s, p) => s + p.deuda, 0);
  const provPendientes = totalProveedores - totalProvPagado;

  const disponible = saldoCajaDiaria + (Number(banco) || 0) + (Number(pedidosPendientes) || 0);
  const totalObligaciones = fijosPendientes + provPendientes;
  const posNeta = disponible - totalObligaciones;
  const despuesProveedores = disponible - provPendientes;
  const paraFijos = despuesProveedores - fijosPendientes;

  const diasRest = diasDelMes() - hoy;
  const regList = registros || [];
  const promDiario = regList.length > 0 ? regList.reduce((s, r) => s + r.ventas, 0) / regList.length : Number(ventasDiarias) || 0;
  const proyVentas = promDiario * diasRest;
  const proyFinal = disponible + proyVentas - totalObligaciones;
  const sc = proyFinal >= 0 ? "#1a7a3a" : "#cc4400";

  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>

      {/* ── COLUMNA IZQUIERDA: resumen financiero ── */}
      <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 }}>
        <Card>
          <H title={`Estado actual — Día ${hoy} / ${diasDelMes()}`} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "11px" }}>
            <div>
              <div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>💵 Caja efectivo</div>
              <div style={{ ...IS, width: "100%", background: "#e8f5e9", color: "#1a7a3a", fontWeight: "700", display: "flex", alignItems: "center" }}>{fmt(saldoCajaDiaria)}</div>
            </div>
            {[["🏦 Banco", banco, setBanco], ["📦 Pedidos pendientes", pedidosPendientes, setPedidosPendientes]].map(([lbl, v, sv]) => (
              <div key={lbl}><div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>{lbl}</div><input type="number" placeholder="$" value={v} onChange={e => sv(e.target.value)} style={{ ...IS, width: "100%" }} /></div>
            ))}
          </div>
        </Card>

        <Card style={{ border: "1px solid #c8e6d0" }}>
          <H title="Resumen financiero del mes" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
            {[
              { label: "Total disponible (caja + banco + cobros)", value: disponible, color: "#1a7a3a", bold: true },
              { label: "— Proveedores pendientes de pago", value: -provPendientes, color: "#cc4400" },
              { label: "= Disponible después de proveedores", value: despuesProveedores, color: despuesProveedores >= 0 ? "#1a5c2a" : "#cc4400", bold: true, sep: true },
              { label: "— Costos fijos pendientes", value: -fijosPendientes, color: "#cc4400" },
              { label: "= Saldo neto después de todo", value: paraFijos, color: paraFijos >= 0 ? "#1a7a3a" : "#cc4400", bold: true, sep: true },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${row.sep ? "10px 0 6px" : "6px 0"}`, borderTop: row.sep ? "2px solid #c8e6d0" : "1px solid #e8f5ec", marginTop: row.sep ? "4px" : "0" }}>
                <span style={{ color: "#5a8a6e", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>{row.label}</span>
                <span style={{ color: row.color, fontFamily: "'DM Mono', monospace", fontSize: row.bold ? "15px" : "13px", fontWeight: row.bold ? "700" : "400" }}>{fmt(Math.abs(row.value))}</span>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "9px" }}>
          <StatBox label="Proveedores pendientes" value={fmt(provPendientes)} warn={provPendientes > 0} />
          <StatBox label="Costos fijos pendientes" value={fmt(fijosPendientes)} warn={fijosPendientes > 0} />
          <StatBox label="Posición neta hoy" value={fmt(posNeta)} accent={posNeta >= 0} warn={posNeta < 0} sub={posNeta >= 0 ? "✓ Superávit" : "⚠ Déficit"} />
        </div>

        <Card style={{ border: `1px solid ${sc}30`, background: `${sc}05` }}>
          <div style={{ color: sc, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: "5px" }}>Proyección fin de mes</div>
          <div style={{ color: sc, fontSize: "28px", fontWeight: "700", fontFamily: "'DM Mono', monospace", marginBottom: "9px" }}>{fmt(proyFinal)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", color: "#5a8a6e", fontSize: "11px", lineHeight: "1.9", fontFamily: "'DM Mono', monospace" }}>
            <div>Días restantes: <span style={{ color: "#1a3a25", fontWeight:"700" }}>{diasRest}</span></div>
            <div>Prom venta/día: <span style={{ color: "#1a3a25", fontWeight:"700" }}>{fmt(promDiario)}</span></div>
            <div>Ventas proyectadas: <span style={{ color: "#1a3a25", fontWeight:"700" }}>{fmt(proyVentas)}</span></div>
            <div>Total obligaciones: <span style={{ color: "#cc4400", fontWeight:"700" }}>{fmt(totalObligaciones)}</span></div>
          </div>
          <div style={{ marginTop: "10px" }}>
            <div style={{ color: "#6a9a7e", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>VENTA DIARIA MANUAL (si no hay registros)</div>
            <input type="number" placeholder="$" value={ventasDiarias} onChange={e => setVentasDiarias(e.target.value)} style={{ ...IS, width: "100%" }} />
          </div>
        </Card>

        <Card>
          <H title="Registro diario de ventas" />
          <div style={{ display: "flex", gap: "7px", marginBottom: "13px" }}>
            <input type="number" placeholder={`Ventas del día ${hoy} $`} value={ventasHoy} onChange={e => setVentasHoy(e.target.value)} style={{ ...IS, flex: 1 }} />
            <Btn onClick={() => { if (!ventasHoy) return; setRegistros([...regList, { dia: hoy, ventas: Number(ventasHoy) }]); setVentasHoy(""); }}>Registrar día {hoy}</Btn>
          </div>
          {regList.length > 0 ? (
            <>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "50px", marginBottom: "11px" }}>
                {regList.map((r, i) => { const mx = Math.max(...regList.map(x => x.ventas)); const h = mx > 0 ? (r.ventas / mx) * 100 : 0; return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1px" }}><div style={{ width: "100%", height: `${h}%`, background: "#1a7a3a", borderRadius: "2px 2px 0 0", minHeight: "3px" }} title={`Día ${r.dia}: ${fmt(r.ventas)}`} /><span style={{ color: "#5a8a6e", fontSize: "8px" }}>{r.dia}</span></div>; })}
              </div>
              {regList.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "6px 0", borderBottom: "1px solid #ddeee3" }}>
                  <span style={{ color: "#5a8a6e", fontFamily: "'DM Mono', monospace", fontSize: "10px", width: "45px" }}>Día {r.dia}</span>
                  <span style={{ color: "#1a7a3a", fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: "700", flex: 1 }}>{fmt(r.ventas)}</span>
                  <X onClick={() => setRegistros(regList.filter((_, ii) => ii !== i))} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0 0", borderTop: "2px solid #c8e6d0" }}>
                <span style={{ color: "#5a8a6e", fontFamily: "'DM Mono', monospace", fontSize: "11px" }}>Total acumulado</span>
                <span style={{ color: "#1a7a3a", fontFamily: "'DM Mono', monospace", fontSize: "13px", fontWeight: "700" }}>{fmt(regList.reduce((s, r) => s + r.ventas, 0))}</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "18px", color: "#8aba9e", fontFamily: "'DM Mono', monospace", fontSize: "11px" }}>No hay ventas registradas este mes</div>
          )}
        </Card>
      </div>

      {/* ── COLUMNA DERECHA: caja diaria ── */}
      <div style={{ width: "340px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px" }}>

        {/* Saldo actual grande */}
        <div style={{ background: saldoCajaDiaria >= 0 ? "#1a7a3a" : "#cc4400", borderRadius: "11px", padding: "20px 18px", textAlign: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "9px", letterSpacing: "0.15em", fontFamily: "'DM Mono', monospace", marginBottom: "6px", textTransform: "uppercase" }}>💵 Efectivo en caja</div>
          <div style={{ color: "#ffffff", fontSize: "36px", fontWeight: "700", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{fmt(saldoCajaDiaria)}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginTop: "6px" }}>{movs.length} movimiento{movs.length !== 1 ? "s" : ""}</div>
        </div>

        {/* Formulario agregar movimiento */}
        <Card>
          <H title="Nuevo movimiento" />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>
              <div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "3px" }}>FECHA</div>
              <input type="date" value={fechaMov} onChange={e => setFechaMov(e.target.value)} style={{ ...IS, width: "100%" }} />
            </div>
            <div>
              <div style={{ color: "#5a8a6e", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "3px" }}>CONCEPTO</div>
              <input placeholder="Descripción..." value={concepto} onChange={e => setConcepto(e.target.value)} onKeyDown={e => e.key === "Enter" && addMov()} style={{ ...IS, width: "100%" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <div style={{ color: "#1a7a3a", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "3px" }}>↑ INGRESO $</div>
                <input type="number" placeholder="0" value={ingreso} onChange={e => setIngreso(e.target.value)} onKeyDown={e => e.key === "Enter" && addMov()} style={{ ...IS, width: "100%" }} />
              </div>
              <div>
                <div style={{ color: "#cc4400", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginBottom: "3px" }}>↓ EGRESO $</div>
                <input type="number" placeholder="0" value={egreso} onChange={e => setEgreso(e.target.value)} onKeyDown={e => e.key === "Enter" && addMov()} style={{ ...IS, width: "100%" }} />
              </div>
            </div>
            <Btn onClick={addMov} style={{ width: "100%" }}>+ Agregar movimiento</Btn>
          </div>
        </Card>

        {/* Lista de movimientos */}
        <Card>
          <H title="Movimientos del día">
            {movs.length > 0 && <Btn variant="secondary" style={{ fontSize: "10px", padding: "4px 8px" }} onClick={() => { if (window.confirm("¿Borrar todos los movimientos?")) setCajaDiaria([]); }}>Limpiar</Btn>}
          </H>
          {movRows.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
              {movRows.map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 0", borderBottom: "1px solid #e8f5ec" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#1a3a25", fontSize: "11px", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.concepto}</div>
                    <div style={{ color: "#8aba9e", fontSize: "9px", fontFamily: "'DM Mono', monospace" }}>{r.fecha}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {r.ingreso > 0 && <div style={{ color: "#1a7a3a", fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: "700" }}>+{fmt(r.ingreso)}</div>}
                    {r.egreso > 0 && <div style={{ color: "#cc4400", fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: "700" }}>-{fmt(r.egreso)}</div>}
                    <div style={{ color: r.saldo >= 0 ? "#1a5c2a" : "#cc4400", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>{fmt(r.saldo)}</div>
                  </div>
                  <X onClick={() => setCajaDiaria(movs.filter(m => m.id !== r.id))} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: "2px" }}>
                <span style={{ color: "#5a8a6e", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>Saldo final</span>
                <span style={{ color: saldoCajaDiaria >= 0 ? "#1a7a3a" : "#cc4400", fontFamily: "'DM Mono', monospace", fontSize: "14px", fontWeight: "700" }}>{fmt(saldoCajaDiaria)}</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#8aba9e", fontFamily: "'DM Mono', monospace", fontSize: "11px" }}>
              Sin movimientos.<br />Agregá un ingreso o egreso.
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}

// ===================== LOGIN =====================
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const mono = "'DM Mono', monospace";

  const login = () => {
    const em = email.trim().toLowerCase();
    const pw = pass.trim();
    if (!em || !pw) { setError("Completá todos los campos."); return; }
    const found = USUARIOS_FIJOS.find(u => u.email === em && u.password === pw);
    if (found) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: em, isAdmin: found.isAdmin }));
      onLogin({ email: em, isAdmin: found.isAdmin });
    } else {
      setError("Email o contraseña incorrectos.");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0d1f14", display:"flex", alignItems:"center", justifyContent:"center", fontFamily: mono }}>
      <div style={{ background:"#fff", borderRadius:"14px", padding:"40px 36px", width:"100%", maxWidth:"360px", boxShadow:"0 8px 40px #00000040" }}>
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ fontSize:"40px", marginBottom:"10px" }}>🍔</div>
          <div style={{ fontWeight:"700", fontSize:"18px", color:"#1a3a25" }}>Roses Burgers</div>
          <div style={{ fontSize:"11px", color:"#5a8a6e", marginTop:"4px" }}>Sistema de costos y gestión</div>
        </div>
        <div style={{ marginBottom:"12px" }}>
          <div style={{ fontSize:"10px", color:"#5a8a6e", marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Email</div>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="tu@email.com"
            style={{ width:"100%", padding:"10px 12px", border:"1px solid #c8e6c9", borderRadius:"7px", fontSize:"13px", outline:"none", background:"#fafff9", fontFamily:mono }} />
        </div>
        <div style={{ marginBottom:"20px" }}>
          <div style={{ fontSize:"10px", color:"#5a8a6e", marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Contraseña</div>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••••••"
            style={{ width:"100%", padding:"10px 12px", border:"1px solid #c8e6c9", borderRadius:"7px", fontSize:"13px", outline:"none", background:"#fafff9", fontFamily:mono }} />
        </div>
        {error && <div style={{ background:"#fdecea", color:"#c0392b", borderRadius:"7px", padding:"8px 12px", fontSize:"11px", marginBottom:"14px", textAlign:"center" }}>{error}</div>}
        <button onClick={login} style={{ width:"100%", background:"#1a7a3a", color:"#fff", border:"none", borderRadius:"7px", padding:"11px", fontSize:"13px", fontWeight:"700", cursor:"pointer", fontFamily:mono }}>
          Ingresar
        </button>
      </div>
    </div>
  );
}

// ===================== USUARIOS =====================
function UsuariosTab({ usuarios, setUsuarios }) {
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const mono = "'DM Mono', monospace";

  const add = () => {
    if (!form.nombre || !form.email || !form.password) { setError("Completá todos los campos."); return; }
    if (usuarios.find(u => u.email === form.email)) { setError("Ese email ya existe."); return; }
    setUsuarios([...usuarios, { id: Date.now(), ...form }]);
    setForm({ nombre: "", email: "", password: "" }); setError("");
  };
  const del = id => { if (window.confirm("¿Eliminar este usuario?")) setUsuarios(usuarios.filter(u => u.id !== id)); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
      <Card>
        <H title="Agregar usuario" />
        <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
          <input placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} style={{...IS, flex:"1 1 130px"}} />
          <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{...IS, flex:"1 1 180px"}} />
          <input type="password" placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{...IS, flex:"1 1 130px"}} />
          <Btn onClick={add}>+ Agregar</Btn>
        </div>
        {error && <div style={{color:"#c0392b",fontSize:"11px",marginTop:"8px",fontFamily:mono}}>{error}</div>}
      </Card>
      <Card>
        <H title="Usuarios con acceso" />
        <div style={{padding:"7px 0 10px",borderBottom:"1px solid #d4edd9",display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:"7px"}}>
          {["Nombre","Email",""].map(h=><div key={h} style={{color:"#1a5c2a",fontSize:"10px",fontFamily:mono,textTransform:"uppercase"}}>{h}</div>)}
        </div>
        <div style={{padding:"9px 0",borderBottom:"1px solid #e0f0e6",display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:"7px",alignItems:"center"}}>
          <span style={{fontSize:"12px",color:"#1a3a25",fontFamily:mono}}>Thomas (admin)</span>
          <span style={{fontSize:"11px",color:"#5a8a6e",fontFamily:mono}}>{ADMIN_EMAIL}</span>
          <span style={{fontSize:"10px",background:"#e8f5e9",color:"#1a7a3a",padding:"2px 8px",borderRadius:"4px",fontWeight:"700"}}>Admin</span>
        </div>
        {USUARIOS_FIJOS.slice(1).map(u => (
          <div key={u.email} style={{padding:"9px 0",borderBottom:"1px solid #e0f0e6",display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:"7px",alignItems:"center"}}>
            <span style={{fontSize:"12px",color:"#1a3a25",fontFamily:mono}}>{u.email}</span>
            <span style={{fontSize:"11px",color:"#5a8a6e",fontFamily:mono}}>Usuario fijo</span>
            <span style={{fontSize:"10px",background:"#e8f0fe",color:"#2471a3",padding:"2px 8px",borderRadius:"4px",fontWeight:"700"}}>Fijo</span>
          </div>
        ))}
        {usuarios.map(u => (
          <div key={u.id} style={{padding:"9px 0",borderBottom:"1px solid #e0f0e6",display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:"7px",alignItems:"center"}}>
            <span style={{fontSize:"12px",color:"#1a3a25",fontFamily:mono}}>{u.nombre}</span>
            <span style={{fontSize:"11px",color:"#5a8a6e",fontFamily:mono}}>{u.email}</span>
            <X onClick={()=>del(u.id)} />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ===================== APP =====================
const KEYS = {
  insumos: "hb-insumos-v2", salsas: "hb-salsas-v2", burgers: "hb-burgers-v2",
  costosFijos: "hb-costos-fijos-v2", pagos: "hb-pagos",
  proveedores: "hb-proveedores", pagosP: "hb-pagos-p",
  caja: "hb-caja", banco: "hb-banco", pedidos: "hb-pedidos",
  ventasDiarias: "hb-ventas-diarias", registros: "hb-registros",
  cajaDiaria: "hb-caja-diaria",
  cajaPresets: "hb-caja-presets",
  stockInicial: "hb-stock-inicial",
  ingresosStock: "hb-ingresos-stock",
  ventasReg: "hb-ventas-reg",
  usuarios: "hb-users",
};

function exportarDatos() {
  const datos = {};
  Object.values(KEYS).forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) datos[k] = v;
  });
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `roses-burgers-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importarDatos(archivo, onDone) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const datos = JSON.parse(e.target.result);
      Object.entries(datos).forEach(([k, v]) => localStorage.setItem(k, v));
      // Escribir directo en Firebase antes de recargar, para que no pise los datos importados
      if (firestore) {
        const data = {};
        Object.entries(datos).forEach(([k, v]) => { data[k] = v; });
        firestore.setDoc(firestore.doc(firestore.db, "rb", "main3"), data, { merge: false })
          .then(() => onDone())
          .catch(() => onDone());
      } else {
        onDone();
      }
    } catch { alert("Archivo inválido."); }
  };
  reader.readAsText(archivo);
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [fbOk, setFbOk] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } });
  useEffect(() => { onFbConnected = setFbOk; }, []);

  const [insumos, setInsumos, r0] = usePersisted(KEYS.insumos, initialInsumos);
  const [salsas, setSalsas, r1] = usePersisted(KEYS.salsas, initialSalsas);
  const [burgers, setBurgers, r2] = usePersisted(KEYS.burgers, initialBurgers);
  const [costosFijos, setCostosFijos, r3] = usePersisted(KEYS.costosFijos, initialCostosFijos);
  const [pagos, setPagos, r4] = usePersisted(KEYS.pagos, {});
  const [proveedores, setProveedores, rp0] = usePersisted(KEYS.proveedores, []);
  const [pagosP, setPagosP, rp1] = usePersisted(KEYS.pagosP, {});
  const [caja, setCaja, r5] = usePersisted(KEYS.caja, "");
  const [banco, setBanco, r6] = usePersisted(KEYS.banco, "");
  const [pedidos, setPedidos, r7] = usePersisted(KEYS.pedidos, "");
  const [ventasDiarias, setVentasDiarias, r8] = usePersisted(KEYS.ventasDiarias, "");
  const [registros, setRegistros, r9] = usePersisted(KEYS.registros, []);
  const [cajaDiaria, setCajaDiaria, r10] = usePersisted(KEYS.cajaDiaria, []);
  const [cajaPresets, setCajaPresets, r13] = usePersisted(KEYS.cajaPresets, []);
  const [stockInicial, setStockInicial, r11] = usePersisted(KEYS.stockInicial, {});
  const [ventasReg, setVentasReg, r12] = usePersisted(KEYS.ventasReg, []);
  const [usuarios, setUsuarios, r14] = usePersisted(KEYS.usuarios, []);
  const [ingresosStock, setIngresosStock, r15] = usePersisted(KEYS.ingresosStock, []);

  const logout = () => { localStorage.removeItem(SESSION_KEY); setCurrentUser(null); };
  if (!currentUser) return <LoginScreen onLogin={u => setCurrentUser(u)} />;
  const mesKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;

  if (![r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,rp0,rp1].every(Boolean)) return (
    <div style={{ minHeight: "100vh", background: "#f0f7f2", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;700&display=swap');`}</style>
      <div style={{ fontSize: "28px" }}>🍔</div>
      <div style={{ color: "#1a7a3a", fontFamily: "'DM Mono', monospace", fontSize: "12px", letterSpacing: "0.1em" }}>Cargando...</div>
    </div>
  );

  const tabs = [
    { label: "Insumos", icon: "🛒" },
    { label: "Salsas", icon: "🧪" },
    { label: "Hamburguesas", icon: "🍔" },
    { label: "Equilibrio", icon: "⚖️" },
    { label: "Costos fijos", icon: "📋" },
    { label: "Proveedores", icon: "🏭" },
    { label: "Ventas", icon: "🧾" },
    { label: "Stock", icon: "📦" },
    { label: "Caja Diaria", icon: "💵" },
    { label: "Caja", icon: "📊" },
    ...(currentUser?.isAdmin ? [{ label: "Usuarios", icon: "👥" }] : []),
  ];

  const SB_BG   = "#0d1f14";
  const SB_ACT  = "#1a7a3a";
  const sideBtn = (active) => ({
    display: "flex", alignItems: "center", gap: "9px", padding: "10px 18px",
    cursor: "pointer", background: active ? "#1a7a3a22" : "transparent",
    borderLeft: `3px solid ${active ? SB_ACT : "transparent"}`,
    color: active ? "#ffffff" : "#6a9a7e", fontSize: "12px",
    fontWeight: active ? "700" : "400", border: "none", width: "100%",
    textAlign: "left", fontFamily: "'DM Mono', monospace",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        input[type=range] { accent-color: #1a7a3a; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #e8f5ec; } ::-webkit-scrollbar-thumb { background: #4CAF50; border-radius: 2px; }
        select option { background: #f0faf3; }
        input:focus, select:focus { border-color: #1a7a3a60 !important; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: "220px", minWidth: "220px", background: SB_BG, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #ffffff10" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div style={{ background: "#1a7a3a", borderRadius: "8px", padding: "5px 9px", fontSize: "16px" }}>🍔</div>
            <div>
              <div style={{ color: "#fff", fontWeight: "700", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>Roses Burgers</div>
              <div style={{ fontSize: "9px", marginTop: "2px", color: fbOk === true ? "#6ee49a" : fbOk === false ? "#f1948a" : "#556" }}>
                {fbOk === true ? "☁️ sincronizado" : fbOk === false ? "⚠️ sin conexión" : "⏳ conectando..."}
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ padding: "10px 0 4px", fontSize: "9px", color: "#3a6a4a", fontWeight: "700", letterSpacing: "1px", paddingLeft: "18px" }}>GESTIÓN</div>
        {tabs.map((t, i) => (
          <button key={i} style={sideBtn(tab === i)} onClick={() => setTab(i)}>
            <span style={{ fontSize: "14px" }}>{t.icon}</span>
            {t.label}
          </button>
        ))}

        {/* Export/Import al fondo */}
        <div style={{ marginTop: "auto", borderTop: "1px solid #ffffff10", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "9px", color: "#3a6a4a", fontWeight: "700", letterSpacing: "1px", marginBottom: "2px" }}>DATOS</div>
          <button onClick={exportarDatos} style={{ background: "#1a7a3a22", border: "1px solid #1a7a3a44", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#6ee49a", fontWeight: "700", textAlign: "left" }}>⬇ Exportar</button>
          <label style={{ background: "#1a7a3a22", border: "1px solid #1a7a3a44", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#6ee49a", fontWeight: "700" }}>
            ⬆ Importar
            <input type="file" accept=".json" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) importarDatos(e.target.files[0], () => window.location.reload()); }} />
          </label>
          {currentUser?.isAdmin && (
            <button onClick={() => {
              if (!window.confirm("¿Restaurar insumos, salsas, hamburguesas y costos fijos a los valores por defecto? Se perderán los cambios actuales.")) return;
              setInsumos(initialInsumos);
              setSalsas(initialSalsas);
              setBurgers(initialBurgers);
              setCostosFijos(initialCostosFijos);
            }} style={{ background: "#7a1a1a22", border: "1px solid #7a1a1a44", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#f1948a", fontWeight: "700", textAlign: "left" }}>
              ↺ Restaurar defaults
            </button>
          )}
          <div style={{ color: "#3a6a4a", fontFamily: "'DM Mono', monospace", fontSize: "9px", marginTop: "4px" }}>
            {mesActual.toUpperCase()}<br />Día {hoy} de {diasDelMes()}
          </div>
          <div style={{color:"#3a6a4a",fontFamily:"'DM Mono',monospace",fontSize:"9px",marginBottom:"4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser?.email}</div>
          <button onClick={logout}
            style={{ background:"transparent", border:"1px solid #3a6a4a", borderRadius:"6px", padding:"5px 10px", cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:"10px", color:"#6a9a7e", textAlign:"left", width:"100%" }}>
            ↩ Cerrar sesión
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, background: "#f0f7f2", minHeight: "100vh", overflowY: "auto" }}>
        <div style={{ background: "#ffffff", borderBottom: "1px solid #d4edd9", padding: "13px 24px", display: "flex", alignItems: "center", minHeight: "52px" }}>
          <span style={{ fontWeight: "700", fontSize: "15px", color: "#1a3a25", fontFamily: "'DM Mono', monospace" }}>
            {tabs[tab].icon} {tabs[tab].label}
          </span>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {tab === 0 && <InsumosTab insumos={insumos} setInsumos={setInsumos} />}
          {tab === 1 && <SalsasTab salsas={salsas} setSalsas={setSalsas} insumos={insumos} />}
          {tab === 2 && <BurgersTab burgers={burgers} setBurgers={setBurgers} insumos={insumos} salsas={salsas} />}
          {tab === 3 && <PuntoEquilibrioTab burgers={burgers} costosFijos={costosFijos} insumos={insumos} salsas={salsas} ventas={ventasReg} />}
          {tab === 4 && <CostosFijosTab costosFijos={costosFijos} setCostosFijos={setCostosFijos} pagos={pagos} setPagos={setPagos} mesKey={mesKey} />}
          {tab === 5 && <ProveedoresTab proveedores={proveedores || []} setProveedores={setProveedores} pagosP={pagosP} setPagosP={setPagosP} mesKey={mesKey} />}
          {tab === 6 && <VentasTab ventas={ventasReg} setVentas={setVentasReg} burgers={burgers} insumos={insumos} salsas={salsas} />}
          {tab === 7 && <StockTab insumos={insumos} ventas={ventasReg} burgers={burgers} salsas={salsas} stockInicial={stockInicial} setStockInicial={setStockInicial} ingresosStock={ingresosStock || []} setIngresosStock={setIngresosStock} />}
          {tab === 8 && <CajaDiariaTab cajaDiaria={cajaDiaria || []} setCajaDiaria={setCajaDiaria} presets={cajaPresets || []} setPresets={setCajaPresets} />}
          {tab === 9 && <CajaBancoTab costosFijos={costosFijos} pagos={pagos} proveedores={proveedores || []} pagosP={pagosP} mesKey={mesKey} cajaDiaria={cajaDiaria || []} setCajaDiaria={setCajaDiaria} banco={banco} setBanco={setBanco} pedidosPendientes={pedidos} setPedidosPendientes={setPedidos} ventasDiarias={ventasDiarias} setVentasDiarias={setVentasDiarias} registros={registros || []} setRegistros={setRegistros} />}
          {tab === 10 && currentUser?.isAdmin && <UsuariosTab usuarios={usuarios} setUsuarios={setUsuarios} />}
        </div>
      </div>
    </div>
  );
}
