import { useState, useEffect } from "react";
import api from "../services/api"; // Usamos tu instancia de axios centralizada
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { 
  Search, UserPlus, Phone, Mail, X, 
  Loader2, Save, CreditCard, ExternalLink, 
  MessageSquare, User 
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
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      <Header />

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Cabecera de Sección */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Directorio</p>
            <h1 className="text-3xl font-black text-slate-800">Clientes</h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 active:scale-90 transition-all"
          >
            <UserPlus size={24} />
          </button>
        </div>

        {/* Buscador */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-12 pr-4 py-4 bg-white border-none shadow-sm rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Listado */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center py-20 text-slate-300">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="font-medium">Cargando base de datos...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div key={user.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black text-xl border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    {user.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{user.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                        <CreditCard size={12}/> {user.cedula}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Acciones Rápidas */}
                  <a href={`tel:${user.phone}`} className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all">
                    <Phone size={18} />
                  </a>
                  <div className="text-right ml-4 hidden sm:block">
                    <p className="text-sm font-black text-slate-900">${Number(user.total_spent || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Inversión Total</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <User size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-bold">No se encontraron clientes</p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">Nuevo Cliente</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Documento ID</label>
                    <input required className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                      placeholder="123456..." value={newUser.cedula} onChange={e => setNewUser({...newUser, cedula: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre</label>
                    <input required className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                      placeholder="Ej: Juan Pérez" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">WhatsApp / Tel</label>
                    <input type="tel" className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                      placeholder="300..." value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
                    <input type="email" className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                      placeholder="cliente@correo.com" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ubicación</label>
                  <div className="flex gap-2">
                    <input placeholder="Ciudad" className="w-1/3 px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                      value={newUser.city} onChange={e => setNewUser({...newUser, city: e.target.value})} />
                    <input placeholder="Dirección completa" className="w-2/3 px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                      value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} />
                  </div>
                </div>
              </div>

              <button disabled={isSaving} type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 mt-4">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {isSaving ? "Guardando..." : "Crear Cliente"}
              </button>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}