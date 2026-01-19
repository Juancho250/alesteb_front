import { NavLink } from "react-router-dom";
import {
  Home,
  Package,
  ShoppingBag,
  Settings,
  Users // Importamos el icono para Clientes
} from "lucide-react";

export default function BottomNav() {
  const base =
    "flex-1 py-2 flex flex-col items-center text-gray-500 text-xs transition";
  const active = "text-blue-600 font-semibold";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex z-50">
      
      <NavLink
        to="/"
        className={({ isActive }) => `${base} ${isActive ? active : ""}`}
      >
        <Home size={20} />
        Inicio
      </NavLink>

      <NavLink
        to="/products"
        className={({ isActive }) => `${base} ${isActive ? active : ""}`}
      >
        <Package size={20} />
        Productos
      </NavLink>

      {/* NUEVA OPCIÓN: CLIENTES */}
      <NavLink
        to="/users"
        className={({ isActive }) => `${base} ${isActive ? active : ""}`}
      >
        <Users size={20} />
        Clientes
      </NavLink>

      <NavLink
        to="/sales"
        className={({ isActive }) => `${base} ${isActive ? active : ""}`}
      >
        <ShoppingBag size={20} />
        Ventas
      </NavLink>

      <NavLink
        to="/tools"
        className={({ isActive }) => `${base} ${isActive ? active : ""}`}
      >
        <Settings size={20} />
        Herramientas
      </NavLink>

    </nav>
  );
}