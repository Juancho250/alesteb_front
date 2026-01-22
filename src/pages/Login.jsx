import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Limpieza preventiva absoluta
      localStorage.clear(); 

      const res = await api.post("/auth/login", { email, password });

      // 2. Definir tiempos de expiración
      // 3600000 ms = 1 hora. Ajusta este valor según la duración de tu token de backend
      const expiresIn = 3600 * 1000; 
      const expirationTime = new Date().getTime() + expiresIn;

      // 3. Guardar sesión con marcas de tiempo
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("expirationTime", expirationTime.toString());
      localStorage.setItem("loginTimestamp", new Date().getTime().toString());

      // 4. Redirección
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Revisa tus credenciales e intenta de nuevo"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Bienvenido a AlestebAdmin
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Ingresa tus credenciales de acceso
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none font-medium"
                  placeholder="nombre@ejemplo.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none font-medium"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Entrar al Panel <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-slate-400 text-sm font-medium">
          ¿Problemas con tu acceso? <br />
          <span className="text-slate-900 cursor-pointer hover:underline">Contacta al administrador</span>
        </p>
      </div>
    </div>
  );
}