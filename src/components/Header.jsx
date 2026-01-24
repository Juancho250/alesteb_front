// src/components/Header.jsx
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // 1. Importamos el hook

export default function Header() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // 2. Extraemos el usuario y la función logout
  const [isScrolled, setIsScrolled] = useState(false);
  const [greeting, setGreeting] = useState("");

  useLayoutEffect(() => {
    if (ref.current) {
      document.documentElement.style.setProperty(
        "--header-height",
        `${ref.current.offsetHeight}px`
      );
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("¡Buen día!");
    else if (hour < 18) setGreeting("¡Buenas tardes!");
    else setGreeting("¡Buenas noches!");

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Usamos la función logout del contexto para que limpie todo correctamente
  const handleLogout = () => {
    logout(); 
  };

  return (
    <header
      ref={ref}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 transition-all duration-300 ${
        isScrolled 
          ? "h-14 bg-white/90 backdrop-blur-lg shadow-sm" 
          : "h-20 bg-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center rounded-xl transition-all duration-300 ${
          isScrolled ? "w-8 h-8 bg-blue-600 shadow-none" : "w-10 h-10 bg-slate-900 shadow-xl shadow-blue-500/20"
        }`}>
          <span className="text-white font-black text-sm">A</span>
        </div>
        <div className="flex flex-col">
          <h1 className={`font-black tracking-tighter text-slate-900 transition-all ${
            isScrolled ? "text-lg" : "text-xl"
          }`}>
            ALESTEB
          </h1>
          {!isScrolled && (
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
              {greeting}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* 4. SECCIÓN DINÁMICA: Muestra el nombre del usuario */}
        <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-200">
           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden border border-slate-200">
             {user?.avatar ? (
               <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
             ) : (
               <User size={16} />
             )}
           </div>
           <div className="flex flex-col items-start leading-none">
             {/* Cambia 'user.name' por la propiedad exacta que devuelva tu API (ej: user.username o user.first_name) */}
             <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">
               {user?.name || "Sin nombre"}
             </span>
             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
               {user?.roles?.[0] || "Miembro"}
             </span>
           </div>
        </div>

        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 px-4 py-2 rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          <span className="text-xs font-bold">Salir</span>
          <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </header>
  );
}