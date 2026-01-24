import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado de UI
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false); // Estado para el letrero
  const [userName, setUserName] = useState(""); // Para mostrar el nombre en el letrero

  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // 1. Intentar el login
      const userData = await login(email, password);
      
      // 2. Si es exitoso, guardamos el nombre y activamos la animación
      setUserName(userData?.name || "Administrador");
      setShowWelcome(true);

      // 3. Esperamos 2.5 segundos para que luzca la animación y luego navegamos
      setTimeout(() => {
        navigate("/");
      }, 2500);

    } catch (err) {
      console.error("Login error:", err);
      setIsSubmitting(false);
      if (err.response) {
        setError(err.response.data?.message || "Error en el servidor");
      } else if (err.request) {
        setError("No se pudo conectar con el servidor. Revisa tu internet.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
    }
  };

if (showWelcome) {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* 1. Fondo de Luces Suaves (Light Mode Apple) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[100px] animate-bounce duration-[15s]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">
        
        {/* 2. Logo Minimalista */}
        <div className="mb-10 relative group">
          <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
          <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white border border-slate-100 rounded-3xl flex items-center justify-center shadow-sm animate-in zoom-in duration-700">
            <span className="text-slate-900 font-black text-2xl md:text-3xl tracking-tighter italic">A</span>
          </div>
        </div>

        {/* 3. Título Principal */}
        <div className="space-y-6 text-center">
          <h1 className="flex flex-col items-center">
            <span className="text-slate-400 text-lg md:text-2xl font-medium tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
              Bienvenido a
            </span>
            <span className="mt-2 text-5xl md:text-8xl font-black tracking-tighter text-slate-900 animate-in fade-in zoom-in-95 duration-1000 delay-200">
              alesteb<span className="text-blue-600">admin</span>
            </span>
          </h1>

          {/* 4. Subtítulo con efecto Máquina de Escribir (Garantizando espacio) */}
          <div className="flex justify-center min-h-[40px]"> 
            <p className="text-slate-500 text-xl md:text-3xl font-light tracking-tight overflow-hidden whitespace-nowrap border-r-2 border-blue-500 animate-typewriter pr-2">
              Hola, <span className="text-slate-900 font-semibold">{userName}</span>
            </p>
          </div>
        </div>

        {/* 5. Cargador estilo "Láser" */}
        <div className="mt-20 w-48 md:w-64">
           <div className="h-[2px] w-full bg-slate-100 relative overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer" />
           </div>
           <p className="text-[10px] text-center mt-4 text-slate-400 uppercase tracking-[0.4em] font-black animate-pulse">
             Cargando Panel
           </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; max-width: max-content; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-typewriter {
          animation: typewriter 1.2s steps(40) 1s forwards;
          width: 0;
        }
        .animate-shimmer {
          animation: shimmer 1.8s infinite linear;
        }
      `}} />
    </div>
  );
}

  // --- VISTA NORMAL DE LOGIN ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-900/20">
            <Lock className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Alesteb<span className="text-[#0071e3]">Admin</span>
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Ingresa tus credenciales de acceso
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={submit}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white"
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-start gap-3 animate-in slide-in-from-top-2">
              <div className="mt-1 w-2 h-2 bg-red-600 rounded-full flex-shrink-0 animate-pulse" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            
            {/* Input Email */}
            <div className="space-y-2 group">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-3 group-focus-within:text-[#0071e3] transition-colors">
                Email Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0071e3] transition-colors" size={20} />
                <input
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                  placeholder="usuario@empresa.com"
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2 group">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-3 group-focus-within:text-[#0071e3] transition-colors">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0071e3] transition-colors" size={20} />
                <input
                  className="w-full pl-14 pr-14 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  Entrar al Panel <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-slate-400 text-xs font-semibold">
          ¿Olvidaste tu contraseña? <br />
          <span className="text-slate-900 cursor-pointer hover:underline">Solicitar restablecimiento</span>
        </p>
      </div>
    </div>
  );
}