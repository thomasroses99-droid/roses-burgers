import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import PaginaPedido from './PaginaPedido.jsx'
import PaginaAdminPedidos from './PaginaAdminPedidos.jsx'
import PaginaEmpleado from './PaginaEmpleado.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/pedido" element={<PaginaPedido />} />
        <Route path="/admin-pedidos" element={<PaginaAdminPedidos />} />
        <Route path="/admin" element={<PaginaAdminPedidos />} />
        <Route path="/empleado" element={<PaginaEmpleado />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
