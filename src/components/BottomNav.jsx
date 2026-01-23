import { NavLink } from "react-router-dom";
import { Home, Package, ShoppingBag, Settings, Users } from "lucide-react";

export default function BottomNav() {
  const navItems = [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/products", icon: Package, label: "Productos" },
    { to: "/users", icon: Users, label: "Usuarios" },
    { to: "/sales", icon: ShoppingBag, label: "Ventas" },
    { to: "/tools", icon: Settings, label: "Más" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center z-50 h-16 px-2 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-500"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Fondo resaltado cuando está activo */}
              <div className={`
                p-1.5 rounded-2xl transition-all duration-300 
                ${isActive ? "bg-blue-50 scale-110" : "bg-transparent"}
              `}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              {/* Texto debajo del icono */}
              <span className={`
                text-[10px] mt-1 font-bold tracking-tight transition-opacity duration-300
                ${isActive ? "opacity-100" : "opacity-60"}
              `}>
                {label}
              </span>

              {/* Pequeño punto indicador opcional */}
              {isActive && (
                <div className="absolute top-1 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}