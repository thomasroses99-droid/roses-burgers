import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwStyxPtR2aqUf1Fg91za4X3iRdjeMGAk",
  authDomain: "roses-burgers.firebaseapp.com",
  projectId: "roses-burgers",
  storageBucket: "roses-burgers.firebasestorage.app",
  messagingSenderId: "254575444987",
  appId: "1:254575444987:web:4e7a88da62977583ab815e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Categorías que usa el app: "Carnes","Panificados","Lacteos","Verduras","Salsas base","Aceites","Especias","Guarniciones","Descartables","Packaging","Comandera","Limpieza"

const insumos = [
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
  // Salsas base (aderezos)
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
  // Especias (condimentos)
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

const salsas = [
  { id:1, nombre:"Salsa Stacker",          rendimiento_porciones:20, ingredientes:[{insumo_id:25,cantidad:0.300},{insumo_id:26,cantidad:0.030},{insumo_id:29,cantidad:0.040},{insumo_id:19,cantidad:0.040},{insumo_id:15,cantidad:0.005},{insumo_id:13,cantidad:0.005},{insumo_id:45,cantidad:0.0005},{insumo_id:17,cantidad:0.003},{insumo_id:16,cantidad:0.005}] },
  { id:2, nombre:"Salsa Cheese",           rendimiento_porciones:15, ingredientes:[{insumo_id:8,cantidad:0.100},{insumo_id:30,cantidad:0.010},{insumo_id:26,cantidad:0.010},{insumo_id:11,cantidad:0.100},{insumo_id:23,cantidad:0.100},{insumo_id:14,cantidad:0.001},{insumo_id:12,cantidad:0.001},{insumo_id:45,cantidad:0.0005},{insumo_id:17,cantidad:0.003},{insumo_id:19,cantidad:0.015}] },
  { id:3, nombre:"Salsa Classic",          rendimiento_porciones:15, ingredientes:[{insumo_id:7,cantidad:0.100},{insumo_id:25,cantidad:0.200},{insumo_id:19,cantidad:0.020},{insumo_id:30,cantidad:0.005},{insumo_id:18,cantidad:0.015},{insumo_id:45,cantidad:0.0005},{insumo_id:14,cantidad:0.001},{insumo_id:13,cantidad:0.001},{insumo_id:17,cantidad:0.003}] },
  { id:4, nombre:"Salsa Cowboy",           rendimiento_porciones:25, ingredientes:[{insumo_id:11,cantidad:0.240},{insumo_id:39,cantidad:0.010},{insumo_id:40,cantidad:0.010},{insumo_id:41,cantidad:0.006},{insumo_id:19,cantidad:0.030},{insumo_id:13,cantidad:0.005},{insumo_id:45,cantidad:0.001},{insumo_id:42,cantidad:0.005},{insumo_id:32,cantidad:0.015},{insumo_id:30,cantidad:0.010},{insumo_id:10,cantidad:0.200},{insumo_id:18,cantidad:0.010},{insumo_id:23,cantidad:0.100},{insumo_id:8,cantidad:0.050}] },
  { id:5, nombre:"Salsa Smokey",           rendimiento_porciones:15, ingredientes:[{insumo_id:27,cantidad:0.240},{insumo_id:18,cantidad:0.080},{insumo_id:12,cantidad:0.005},{insumo_id:16,cantidad:0.005},{insumo_id:45,cantidad:0.005},{insumo_id:13,cantidad:0.005}] },
  { id:6, nombre:"Salsa 1967",             rendimiento_porciones:25, ingredientes:[{insumo_id:25,cantidad:0.480},{insumo_id:31,cantidad:0.030},{insumo_id:26,cantidad:0.120},{insumo_id:15,cantidad:0.030},{insumo_id:19,cantidad:0.030},{insumo_id:29,cantidad:0.045}] },
  { id:7, nombre:"Salsa Cheesebacon",      rendimiento_porciones:25, ingredientes:[{insumo_id:23,cantidad:0.300},{insumo_id:2,cantidad:0.200},{insumo_id:8,cantidad:0.150},{insumo_id:30,cantidad:0.015},{insumo_id:19,cantidad:0.015},{insumo_id:45,cantidad:0.0005},{insumo_id:17,cantidad:0.003},{insumo_id:18,cantidad:0.010},{insumo_id:16,cantidad:0.002},{insumo_id:40,cantidad:0.015}] },
  { id:8, nombre:"Salsa Ruby y Crispy Garlic", rendimiento_porciones:20, ingredientes:[{insumo_id:23,cantidad:0.200},{insumo_id:8,cantidad:0.199},{insumo_id:19,cantidad:0.015},{insumo_id:30,cantidad:0.015},{insumo_id:14,cantidad:0.001},{insumo_id:45,cantidad:0.0005},{insumo_id:41,cantidad:0.005},{insumo_id:17,cantidad:0.003}] },
  { id:9, nombre:"Salsa Blue",             rendimiento_porciones:20, ingredientes:[{insumo_id:25,cantidad:0.240},{insumo_id:30,cantidad:0.060},{insumo_id:31,cantidad:0.060},{insumo_id:18,cantidad:0.120},{insumo_id:45,cantidad:0.0005},{insumo_id:42,cantidad:0.003},{insumo_id:12,cantidad:0.001},{insumo_id:17,cantidad:0.003}] },
  { id:10,nombre:"Salsa Biggie",           rendimiento_porciones:20, ingredientes:[{insumo_id:25,cantidad:0.520},{insumo_id:30,cantidad:0.045},{insumo_id:12,cantidad:0.001},{insumo_id:44,cantidad:0.015},{insumo_id:45,cantidad:0.0005},{insumo_id:13,cantidad:0.001},{insumo_id:17,cantidad:0.003},{insumo_id:43,cantidad:0.015}] },
];

const costosFijos = [
  { id:1,  nombre:"SUSS",               monto:1039248.89, categoria:"Impuestos" },
  { id:2,  nombre:"IVA",                monto:1534252.09, categoria:"Impuestos" },
  { id:3,  nombre:"Drei",               monto:223435.05,  categoria:"Impuestos" },
  { id:4,  nombre:"Contador",           monto:180000,     categoria:"Personal" },
  { id:5,  nombre:"CM",                 monto:665000,     categoria:"Impuestos" },
  { id:6,  nombre:"Aguas Alberdi",      monto:30838.25,   categoria:"Servicios" },
  { id:7,  nombre:"Gas Alberdi",        monto:82306.12,   categoria:"Servicios" },
  { id:8,  nombre:"EPE Fisherton",      monto:327854.06,  categoria:"Servicios" },
  { id:9,  nombre:"EPE Alberdi",        monto:125714.68,  categoria:"Servicios" },
  { id:10, nombre:"Maxirest",           monto:116500,     categoria:"Servicios" },
  { id:11, nombre:"Internet Fisherton", monto:30000,      categoria:"Servicios" },
  { id:12, nombre:"Sindicato",          monto:108598.46,  categoria:"Personal" },
  { id:13, nombre:"Alquiler Alberdi",   monto:480102,     categoria:"Inmueble" },
  { id:14, nombre:"Alquiler Fisherton", monto:1081000,    categoria:"Inmueble" },
  { id:15, nombre:"Cuota Alejo",        monto:286000,     categoria:"Personal" },
  { id:16, nombre:"Sistema urgencias",  monto:83000,      categoria:"Servicios" },
  { id:17, nombre:"Plan de Pago IVA",   monto:0,          categoria:"Impuestos" },
  { id:18, nombre:"Seguro Incendio",    monto:51399,      categoria:"Seguros" },
  { id:19, nombre:"Autonomos",          monto:104044.08,  categoria:"Impuestos" },
  { id:20, nombre:"Alarmas",            monto:81225,      categoria:"Servicios" },
  { id:21, nombre:"Fumigador",          monto:62000,      categoria:"Servicios" },
  { id:22, nombre:"Gas Fisherton",      monto:204036.45,  categoria:"Servicios" },
  { id:23, nombre:"DDJJ",               monto:0,          categoria:"Impuestos" },
  { id:24, nombre:"Plan de pago Aut",   monto:0,          categoria:"Impuestos" },
  { id:25, nombre:"Cuota tarjeta",      monto:1300000,    categoria:"Financiero" },
  { id:26, nombre:"TGI Fisherton",      monto:106911,     categoria:"Impuestos" },
  { id:27, nombre:"API Fisherton",      monto:249000,     categoria:"Impuestos" },
  { id:28, nombre:"Agua Fisherton",     monto:0,          categoria:"Servicios" },
  { id:29, nombre:"Plan de Pago TGI",   monto:213946.74,  categoria:"Impuestos" },
  { id:30, nombre:"Plan de Pago API",   monto:0,          categoria:"Impuestos" },
];

const ing  = (ref_id, nombre, cantidad, merma_pct=0) => ({ tipo:"insumo", ref_id, nombre, cantidad, unidad:"kg",     merma_pct });
const ingU = (ref_id, nombre, cantidad)               => ({ tipo:"insumo", ref_id, nombre, cantidad, unidad:"unidad", merma_pct:0 });
const sal  = (ref_id, nombre, cantidad=0.03)          => ({ tipo:"salsa",  ref_id, nombre, cantidad, unidad:"kg",     merma_pct:0 });

function mkBurger(id, nombre, extras, useRoquefort=false) {
  const queso = useRoquefort ? 9 : 5;
  const qNom  = useRoquefort ? "Roquefort" : "Cheddar";
  const pan   = ingU(33, "Pan", 1);
  const papas = ing(46, "Papas Fritas", 0.15);
  const base  = (carneKg, quesoKg) => [pan, ing(1,"Carne",carneKg,15), ing(queso,qNom,quesoKg,5), ...extras];
  return [
    { id:id*10+1, nombre:`${nombre} - Simple`,           precio_venta:11000, ingredientes:base(0.1,0.04) },
    { id:id*10+2, nombre:`${nombre} - Doble`,            precio_venta:13000, ingredientes:base(0.2,0.08) },
    { id:id*10+3, nombre:`${nombre} - Triple`,           precio_venta:15000, ingredientes:base(0.3,0.12) },
    { id:id*10+4, nombre:`${nombre} - Simple con papas`, precio_venta:13500, ingredientes:[...base(0.1,0.04), papas] },
    { id:id*10+5, nombre:`${nombre} - Doble con papas`,  precio_venta:15500, ingredientes:[...base(0.2,0.08), papas] },
    { id:id*10+6, nombre:`${nombre} - Triple con papas`, precio_venta:17500, ingredientes:[...base(0.3,0.12), papas] },
  ];
}

const burgers = [
  ...mkBurger(1,  "Cheeseburger",  [ing(25,"Mayonesa",0.03)]),
  ...mkBurger(2,  "Roses",         [ing(26,"Ketchup",0.02), ing(25,"Mayonesa",0.02), ing(37,"Cebolla",0.02)]),
  ...mkBurger(3,  "1967",          [ing(34,"Lechuga",0.03), ing(37,"Cebolla",0.02), ing(20,"Pepinos",0.02), sal(6,"Salsa 1967")]),
  ...mkBurger(4,  "Classic",       [ing(34,"Lechuga",0.03), ing(35,"Tomate",0.03), ing(37,"Cebolla",0.02), ing(20,"Pepinos",0.02), sal(3,"Salsa Classic")]),
  ...mkBurger(5,  "Cheese Onion",  [ing(37,"Cebolla",0.05), ing(25,"Mayonesa",0.03)]),
  ...mkBurger(6,  "Cowboy",        [sal(4,"Salsa Cowboy",0.04)]),
  ...mkBurger(7,  "Smokey Bacon",  [ing(2,"Panceta",0.05,10), ing(47,"Aros de Cebolla",0.03), sal(5,"Salsa Smokey")]),
  ...mkBurger(8,  "Blue Cheese",   [ing(65,"Rucula",0.02), ing(2,"Panceta",0.05,10), ing(66,"Cebolla caramelizada",0.03), sal(9,"Salsa Blue",0.04)], true),
  ...mkBurger(9,  "Stacked Onion", [ing(2,"Panceta",0.05,10), ing(47,"Aros de Cebolla",0.03), sal(1,"Salsa Stacker")]),
  ...mkBurger(10, "Cheese Bacon",  [ing(2,"Panceta",0.05,10), sal(7,"Salsa Cheesebacon",0.04)]),
  ...mkBurger(11, "Biggie Burger", [ing(2,"Panceta",0.05,10), ing(34,"Lechuga",0.03), ing(38,"Cebolla Morada",0.02), ing(20,"Pepinos",0.02), sal(10,"Salsa Biggie",0.04)]),
  ...mkBurger(12, "Crispy Garlic", [ing(2,"Panceta",0.05,10), ing(47,"Aros de Cebolla",0.03), sal(8,"Salsa Ruby y Crispy Garlic",0.04)]),
  ...mkBurger(13, "Ruby Clove",    [ing(38,"Cebolla Morada",0.03), sal(8,"Salsa Ruby y Crispy Garlic",0.04)]),
];

const datos = {
  "hb-insumos-v2":      JSON.stringify(insumos),
  "hb-salsas-v2":       JSON.stringify(salsas),
  "hb-costos-fijos-v2": JSON.stringify(costosFijos),
  "hb-burgers-v2":      JSON.stringify(burgers),
};

console.log(`Cargando en Firebase...`);
console.log(`  Insumos: ${insumos.length}`);
console.log(`  Salsas: ${salsas.length}`);
console.log(`  Costos fijos: ${costosFijos.length}`);
console.log(`  Hamburguesas: ${burgers.length} (${burgers.length/6} × 6 opciones)`);

await setDoc(doc(db, "rb", "main3"), datos, { merge: true });
console.log("✅ Todo cargado correctamente!");
process.exit(0);
