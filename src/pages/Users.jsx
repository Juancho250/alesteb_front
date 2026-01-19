import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { Search, UserPlus, Phone, Mail, X, Loader2, Save, MapPin, CreditCard } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado inicial expandido
  const initialFormState = { 
    name: "", email: "", phone: "", 
    cedula: "", city: "", address: "" 
  };
  const [newUser, setNewUser] = useState(initialFormState);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://alesteb-back.onrender.com/api/users");
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
      await axios.post("https://alesteb-back.onrender.com/api/users", newUser);
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
    <div className="min-h-screen bg-gray-50 pb-24">
        <Header/>
      {/* Header Fijo */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-3 bg-blue-600 text-white rounded-full shadow-lg active:scale-95 transition-all"
          >
            <UserPlus size={24} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Listado de Clientes */}
      <div className="px-4 mt-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center py-20 text-gray-400"><Loader2 className="animate-spin" /></div>
        ) : filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">{user.name[0]}</div>
              <div>
                <h3 className="font-bold text-gray-900">{user.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1"><CreditCard size={12}/> {user.cedula}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-blue-600">${user.total_spent || '0'}</p>
              <p className="text-[10px] text-gray-400">Total Compras</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL AJUSTADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Nuevo Cliente</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pb-4">
              {/* Cédula y Nombre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Cédula / NIT *</label>
                  <input required className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                    value={newUser.cedula} onChange={e => setNewUser({...newUser, cedula: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nombre Completo *</label>
                  <input required className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                    value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Email *</label>
                  <input required type="email" className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                    value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Teléfono</label>
                  <input type="tel" className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                    value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                </div>
              </div>

              {/* Ubicación (Para estadísticas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Ciudad</label>
                  <input className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                    value={newUser.city} onChange={e => setNewUser({...newUser, city: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Dirección</label>
                  <input className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                    value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} />
                </div>
              </div>

              <button disabled={isSaving} type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {isSaving ? "Procesando..." : "Registrar Cliente"}
              </button>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}