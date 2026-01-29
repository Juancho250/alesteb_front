import { LogOut, User, Bell, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buen día");
    else if (hour < 18) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      ref={ref}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out px-4 md:px-8 
        ${isScrolled ? "py-3" : "py-6"}`}
    >
      <div className={`mx-auto max-w-7xl flex items-center justify-between transition-all duration-500 px-6 
        ${isScrolled 
          ? "h-16 bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/40 rounded-[2rem]" 
          : "h-20 bg-transparent border-transparent"
        }`}
      >
        {/* LADO IZQUIERDO: Branding */}
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/")}>
          <div className={`relative flex items-center justify-center rounded-2xl transition-all duration-500 overflow-hidden
            ${isScrolled ? "w-10 h-10 bg-slate-900" : "w-12 h-12 bg-slate-900 shadow-2xl shadow-slate-900/20"}
          `}>
            <span className="text-white font-black text-xl italic tracking-tighter">A</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="flex flex-col">
            <h1 className={`font-black tracking-tight text-slate-900 leading-none transition-all duration-500
              ${isScrolled ? "text-lg" : "text-2xl"}`}>
              ALESTEB<span className="text-blue-600">.</span>
            </h1>
            <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] transition-all duration-500
              ${isScrolled ? "opacity-0 h-0" : "opacity-100 mt-1"}`}>
              {greeting}
            </p>
          </div>
        </div>

        {/* LADO DERECHO: Usuario & Acciones */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Notificaciones (Opcional, pero da look profesional) */}
          <button className="hidden sm:flex p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <Bell size={20} strokeWidth={2} />
          </button>

          {/* Perfil del Usuario */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200/60">
             <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-xs font-black text-slate-900 leading-none">
                  {user?.name || "Invitado"}
                </span>
                <span className="text-[9px] font-bold text-blue-600/70 uppercase tracking-tighter mt-1">
                  {user?.roles?.[0] || "Miembro Gold"}
                </span>
             </div>

             <div className="relative group p-0.5 rounded-full border-2 border-transparent hover:border-blue-500/20 transition-all duration-300">
               <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden shadow-inner border border-white">
                 {user?.avatar ? (
                   <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                 ) : (
                   <User size={20} />
                 )}
               </div>
               <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
             </div>
          </div>

          {/* Botón Salir Estilizado */}
          <button
            onClick={logout}
            className={`group flex items-center justify-center gap-2 font-bold transition-all duration-300 active:scale-95
              ${isScrolled 
                ? "w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white" 
                : "px-5 py-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10"
              }`}
          >
            <span className={`text-xs transition-all ${isScrolled ? "hidden" : "block"}`}>Cerrar Sesión</span>
            <LogOut size={18} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
}