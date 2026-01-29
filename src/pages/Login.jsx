import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, Phone, ArrowRight, Loader2, ShieldCheck, CheckCircle2, UserCheck } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState("auth");
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isWelcome, setIsWelcome] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", code: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (step === "auth") {
        if (isLogin) {
          // ✅ Usar la función login del AuthContext
          const user = await login(formData.email, formData.password);
          
          // Validación de rol
          const isAdmin = user.role === 'admin' || user.role_id === 1;

          if (!isAdmin) {
            throw new Error("Acceso denegado: Esta área es exclusiva para administradores.");
          }

          setUserData(user); 
          setIsWelcome(true);

          setTimeout(() => {
            navigate("/");
          }, 2500);

        } else {
          // Registro
          await api.post("/auth/register", {
            name: formData.name, 
            email: formData.email,
            password: formData.password, 
            phone: formData.phone
          });
          setSentSuccess(true);
          setTimeout(() => {
            setStep("verify");
            setSentSuccess(false);
          }, 2500);
        }
      } else {
        // Verificación
        await api.post("/auth/verify", { 
          email: formData.email, 
          code: formData.code 
        });
        setStep("auth");
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || error.response?.data?.message || "Error de acceso");
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de Bienvenida
  if (isWelcome) {
    const isAdmin = userData?.role === 'admin' || userData?.role_id === 1;
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white animate-in fade-in duration-1000">
        <div className="relative mb-8">
          <div className={`absolute -inset-6 ${isAdmin ? 'bg-emerald-500/20' : 'bg-blue-500/20'} blur-2xl rounded-full animate-pulse`}></div>
          {isAdmin ? (
            <ShieldCheck className="relative text-emerald-400" size={80} strokeWidth={1} />
          ) : (
            <UserCheck className="relative text-blue-400" size={80} strokeWidth={1} />
          )}
        </div>
        
        <h2 className="text-xs font-black tracking-[0.4em] uppercase text-slate-500 mb-2">Acceso Autorizado</h2>
        <h1 className="text-4xl font-light tracking-tight mb-1">
          Hola, <span className="font-semibold">{userData?.name?.split(' ')[0] || 'Usuario'}</span>
        </h1>
        <p className="text-slate-400 font-medium tracking-widest uppercase text-[10px] bg-slate-800/50 px-4 py-1 rounded-full border border-slate-700">
          {isAdmin ? "Privilegios de Administrador" : "Panel de Cliente"}
        </p>

        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <div className={`w-1.5 h-1.5 ${isAdmin ? 'bg-emerald-500' : 'bg-blue-500'} rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
            <div className={`w-1.5 h-1.5 ${isAdmin ? 'bg-emerald-500' : 'bg-blue-500'} rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
            <div className={`w-1.5 h-1.5 ${isAdmin ? 'bg-emerald-500' : 'bg-blue-500'} rounded-full animate-bounce`}></div>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest animate-pulse">Cargando entorno...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-200 via-slate-50 to-indigo-50 flex items-center justify-center p-6">
      
      <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3rem] p-10 lg:p-14 transition-all overflow-hidden relative">
        
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>

        {sentSuccess ? (
          <div className="text-center py-10 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-800">Código Enviado</h3>
            <p className="text-slate-500 mt-3 text-sm leading-relaxed font-medium">Revisa tu bandeja de entrada para verificar tu identidad.</p>
          </div>
        ) : (
          <>
            <div className="mb-10 text-center relative z-10">
              <div className="inline-flex p-4 bg-slate-900 text-white rounded-[1.5rem] mb-6 shadow-2xl shadow-slate-900/20">
                <Lock size={24} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">
                {step === "verify" ? "Seguridad" : isLogin ? "Login" : "Registro"}
              </h3>
              <p className="text-slate-400 text-[11px] mt-2 font-bold uppercase tracking-wider">
                {step === "verify" ? "Ingresa código de 6 dígitos" : "Sistema de gestión centralizada"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {step === "auth" ? (
                <>
                  {!isLogin && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <AuthInput icon={<User size={18}/>} placeholder="Nombre completo" type="text" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                      <AuthInput icon={<Phone size={18}/>} placeholder="Teléfono" type="tel" 
                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                    </div>
                  )}
                  <AuthInput icon={<Mail size={18}/>} placeholder="Email corporativo" type="email" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  
                  <AuthInput icon={<Lock size={18}/>} placeholder="Contraseña" type="password" 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                </>
              ) : (
                <AuthInput icon={<ShieldCheck size={18}/>} placeholder="000 000" type="text" 
                  value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
              )}

              <button 
                disabled={loading} 
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 mt-8"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    {step === "verify" ? "Confirmar" : isLogin ? "Entrar ahora" : "Registrar"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {step === "auth" && (
              <div className="mt-10 text-center relative z-10">
                <button 
                  type="button" 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya eres miembro? Inicia sesión"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AuthInput({ icon, ...props }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors">
        {icon}
      </div>
      <input 
        {...props} 
        className="w-full bg-slate-100/50 border border-slate-200/50 pl-12 pr-4 py-4 rounded-2xl text-[13px] font-semibold outline-none focus:ring-0 focus:bg-white focus:border-slate-900 transition-all placeholder:text-slate-300 placeholder:font-medium" 
      />
    </div>
  );
}