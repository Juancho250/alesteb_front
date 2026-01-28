import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, Phone, ArrowRight, Loader2, ShieldCheck, Zap, Globe, CheckCircle2 } from "lucide-react";
import api from "../services/api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState("auth"); 
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
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
          // LOGIN
          const { data } = await api.post("/auth/login", { 
            email: formData.email, 
            password: formData.password 
          });
          localStorage.setItem("token", data.token);
          navigate("/"); // Al Dashboard (según tu App.js)
        } else {
          // REGISTRO
          await api.post("/auth/register", {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone
          });
          
          setSentSuccess(true);
          // Esperamos 2 segundos mostrando el check verde antes de pasar al código
          setTimeout(() => {
            setStep("verify");
            setSentSuccess(false);
          }, 2500);
        }
      } else {
        // VERIFICAR CÓDIGO
        await api.post("/auth/verify", { 
          email: formData.email, 
          code: formData.code 
        });
        alert("¡Cuenta verificada! Ahora inicia sesión.");
        setStep("auth");
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Error en la petición:", error.response?.data);
      alert(error.response?.data?.message || "Ocurrió un error inesperado");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-slate-900">
      {/* LADO IZQUIERDO (Estético) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#f5f5f7] p-16 flex-col justify-between relative overflow-hidden">
        <div className="z-10">
          <h2 className="text-6xl font-black tracking-tighter leading-[0.9] uppercase italic mb-8 whitespace-pre-line">
            {sentSuccess ? "Correo\nEnviado." : step === "verify" ? "Confirma tu\nidentidad." : isLogin ? "Bienvenido de\nvuelta." : "Únete a la\nvanguardia."}
          </h2>
          <div className="space-y-6 mt-12">
            <AuthBenefit icon={<ShieldCheck />} text="Seguridad encriptada" />
            <AuthBenefit icon={<Zap />} text="Acceso prioritario" />
            <AuthBenefit icon={<Globe />} text="Comunidad global" />
          </div>
        </div>
        <div className="absolute bottom-[-10%] right-[-10%] opacity-[0.03] select-none pointer-events-none text-[20rem] font-black italic">A</div>
      </div>

      {/* LADO DERECHO (Formulario) */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="w-full max-w-sm">
          {sentSuccess ? (
            <div className="text-center animate-bounce">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">¡Enviado!</h3>
              <p className="text-slate-500 mt-2">Revisa tu correo para el código de 6 dígitos.</p>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h3 className="text-2xl font-black tracking-tighter uppercase italic">
                  {step === "verify" ? "Verificar Código" : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                </h3>
                <p className="text-slate-400 text-sm font-medium mt-1">
                  {step === "verify" ? `Ingresado a ${formData.email}` : "Completa los campos para continuar."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === "auth" ? (
                  <>
                    {!isLogin && (
                      <>
                        <AuthInput icon={<User size={16}/>} placeholder="NOMBRE COMPLETO" type="text" 
                          value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        
                        <AuthInput icon={<Phone size={16}/>} placeholder="TELÉFONO" type="tel" 
                          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                      </>
                    )}
                    <AuthInput icon={<Mail size={16}/>} placeholder="EMAIL" type="email" 
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    
                    <AuthInput icon={<Lock size={16}/>} placeholder="CONTRASEÑA" type="password" 
                      value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                  </>
                ) : (
                  <AuthInput icon={<ShieldCheck size={16}/>} placeholder="CÓDIGO DE 6 DÍGITOS" type="text" 
                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
                )}

                <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <>{step === "verify" ? "VERIFICAR" : isLogin ? "ENTRAR" : "REGISTRARME"} <ArrowRight size={14} /></>}
                </button>
              </form>

              {step === "auth" && (
                <div className="mt-8 text-center">
                  <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                    {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helpers locales
function AuthInput({ icon, ...props }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">{icon}</div>
      <input {...props} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl text-[11px] font-black tracking-widest outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all placeholder:text-slate-300 uppercase" />
    </div>
  );
}

function AuthBenefit({ icon, text }) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">{icon}</div>
      <span className="text-sm font-bold text-slate-600 tracking-tight">{text}</span>
    </div>
  );
}