import { useState, useEffect } from "react";
import api from "../services/api"; 
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { 
  Search, UserPlus, Phone, Mail, X, 
  Loader2, Save, CreditCard, MapPin, 
  User, ChevronRight, Hash, Users as UsersIcon 
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialFormState = { 
    name: "", email: "", phone: "", 
    cedula: "", city: "", address: "" 
  };
  const [newUser, setNewUser] = useState(initialFormState);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error cargando clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post("/users", newUser);
      setIsModalOpen(false);
      setNewUser(initialFormState);
      fetchUsers();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cedula?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      <Header />

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        
        {/* Encabezado y Stats */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Directorio</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Administra tu base de clientes</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end px-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Clientes</span>
                <span className="text-xl font-black text-slate-800">{users.length}</span>
             </div>
             <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center gap-2 font-bold transition-all active:scale-95"
             >
                <UserPlus size={20} />
                <span className="hidden md:inline">Nuevo Cliente</span>
                <span className="md:hidden">Nuevo</span>
             </button>
          </div>
        </div>

        {/* Barra de Búsqueda Premium */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-[#0071e3] transition-colors" size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o teléfono..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-semibold shadow-sm focus:ring-4 focus:ring-[#0071e3]/10 focus:border-[#0071e3] outline-none transition-all placeholder:text-slate-400"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Grid de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-3 text-[#0071e3]" size={32} />
                <p className="font-medium text-sm">Sincronizando contactos...</p>
             </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div key={user.id} className="group bg-white p-5 rounded-[1.5rem] border border-slate-100 hover:border-[#0071e3]/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
                
                {/* Fondo decorativo hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-150 group-hover:bg-blue-50/50" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg font-black text-slate-400 group-hover:bg-[#0071e3] group-hover:text-white transition-colors shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
                            <Hash size={12} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-600">{user.id}</span>
                        </div>
                    </div>

                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 truncate">{user.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                            <CreditCard size={12}/> {user.cedula || "S/N"}
                        </span>
                        {user.city && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md truncate max-w-[100px]">
                                <MapPin size={12}/> {user.city}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50">
                        <a href={`tel:${user.phone}`} className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors ${user.phone ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}>
                            <Phone size={14} /> Llamar
                        </a>
                        <a href={`mailto:${user.email}`} className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors ${user.email ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}>
                            <Mail size={14} /> Email
                        </a>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                   <UsersIcon size={32} />
               </div>
               <p className="text-slate-500 font-bold">No se encontraron clientes</p>
               <p className="text-xs text-slate-400 mt-1">Intenta buscar con otro término</p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL CREAR CLIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setIsModalOpen(false)} 
          />
          
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-10 zoom-in-95 duration-300 overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-slate-800">Nuevo Cliente</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Completa la información de registro</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-sm border border-slate-100">
                    <X size={20} />
                </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreateUser} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1.5 group">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-[#0071e3] transition-colors">Identificación</label>
                    <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] font-bold text-slate-700 transition-all" 
                          placeholder="123456789" value={newUser.cedula} onChange={e => setNewUser({...newUser, cedula: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-1.5 group">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-[#0071e3] transition-colors">Nombre Completo</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] font-bold text-slate-700 transition-all" 
                          placeholder="Ej: Ana Gómez" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1.5 group">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-[#0071e3] transition-colors">Teléfono / WhatsApp</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="tel" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] font-medium text-slate-700 transition-all" 
                          placeholder="300 123 4567" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                    </div>
                 </div>
                 
                 <div className="space-y-1.5 group">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-[#0071e3] transition-colors">Correo Electrónico</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="email" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] font-medium text-slate-700 transition-all" 
                          placeholder="cliente@email.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                    </div>
                 </div>
              </div>

              <div className="space-y-1.5 group">
                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-[#0071e3] transition-colors">Ubicación</label>
                 <div className="flex gap-3">
                    <div className="relative w-1/3">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input placeholder="Ciudad" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] font-medium text-slate-700 transition-all" 
                          value={newUser.city} onChange={e => setNewUser({...newUser, city: e.target.value})} />
                    </div>
                    <input placeholder="Dirección y barrio" className="w-2/3 px-4 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] font-medium text-slate-700 transition-all" 
                      value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} />
                 </div>
              </div>

              <div className="pt-4">
                  <button disabled={isSaving} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {isSaving ? "Guardando Registro..." : "Guardar Cliente"}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}