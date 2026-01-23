import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // Importamos el hook

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado de UI
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth(); // Usamos la función del contexto

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // La lógica pesada ahora está en AuthContext
      await login(email, password);
      
      // Si no falla, redireccionamos
      navigate("/");
      
    } catch (err) {
      console.error("Login error:", err);
      // Manejo de errores más robusto
      if (err.response) {
        // Errores que vienen del Backend (401, 403, 500)
        setError(err.response.data?.message || "Error en el servidor");
      } else if (err.request) {
        // El servidor no responde
        setError("No se pudo conectar con el servidor. Revisa tu internet.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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