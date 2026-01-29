import { useState, useEffect } from "react";
import api from "../services/api"; 
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { 
  Search, UserPlus, Phone, Mail, X, 
  Loader2, Save, CreditCard, 
  User, Edit3, Trash2, 
  ShieldCheck
} from "lucide-react";
import { useLoading } from "../context/LoadingContext";
import { useNotice } from "../context/NoticeContext";

export default function Users() {
  const { showNotice, askConfirmation } = useNotice();
  const { startLoading, stopLoading } = useLoading();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialFormState = { 
    id: null, name: "", email: "", phone: "", 
    cedula: "", city: "", address: "",
    role_id: 3,
    password: ""
  };
  const [formData, setFormData] = useState(initialFormState);

  // Carga inicial de usuarios
  const fetchData = async () => {
    startLoading();
    try {
      const response = await api.get("/users");
      // El backend devuelve directamente el array
      const userData = response.data;
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      showNotice("Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
      setTimeout(stopLoading, 800);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      ...initialFormState,
      role_id: 3,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setFormData({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      cedula: user.cedula || "",
      city: user.city || "",
      address: user.address || "",
      role_id: user.role_id || 3,
      password: ""
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    const confirmed = await askConfirmation(
      "¿Eliminar Usuario?", 
      "Esta acción no se puede deshacer. El usuario perderá el acceso."
    );

    if (!confirmed) return;
    
    startLoading();
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      showNotice("Usuario eliminado con éxito");
    } catch (err) {
      showNotice("No se pudo eliminar el registro", "error");
    } finally {
      stopLoading();
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    startLoading();

    try {
      const cleanData = {
        ...formData,
        email: formData.email.trim(),
        phone: formData.phone.trim()
      };

      if (isEditing) {
        if (!cleanData.password) delete cleanData.password;
        await api.put(`/users/${formData.id}`, cleanData);
      } else {
        await api.post("/users", cleanData);
      }
      
      setIsModalOpen(false);
      setFormData(initialFormState);
      fetchData(); 
      showNotice(isEditing ? "Usuario actualizado" : "Usuario creado con éxito");
    } catch (err) {
      showNotice("Error: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setIsSaving(false);
      stopLoading();
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
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Usuarios y Clientes</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Administra accesos del sistema</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end px-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registros Totales</span>
                <span className="text-xl font-black text-slate-800">{users.length}</span>
             </div>
             
             <button 
                onClick={openCreateModal}
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center gap-2 font-bold transition-all active:scale-95"
             >
                <UserPlus size={20} />
                <span>Nuevo Registro</span>
             </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-[#0071e3] transition-colors" size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-semibold shadow-sm focus:ring-4 focus:ring-[#0071e3]/10 focus:border-[#0071e3] outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Grid de Usuarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-3 text-[#0071e3]" size={32} />
                <p className="font-medium text-sm">Sincronizando base de datos...</p>
             </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div key={user.id} className="group bg-white p-5 rounded-[1.5rem] border border-slate-100 hover:border-[#0071e3]/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button onClick={() => openEditModal(user)} className="p-2 bg-slate-50 text-slate-400 hover:bg-[#0071e3] hover:text-white rounded-full transition-all border border-slate-100">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-full transition-all border border-slate-100">
                      <Trash2 size={16} />
                    </button>
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-lg font-black transition-colors ${user.role_id === 1 ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className={`px-2 py-1 rounded-lg border flex items-center gap-1 mr-16 ${user.role_id === 1 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                            {user.role_id === 1 ? <ShieldCheck size={12}/> : <User size={12} />}
                            <span className="text-[10px] font-bold uppercase">{user.role_id === 1 ? 'Admin' : 'Cliente'}</span>
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 truncate pr-8">{user.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                            <CreditCard size={12}/> {user.cedula || "S/N"}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50">
                        <a href={`tel:${user.phone}`} className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600">
                            <Phone size={14} /> Llamar
                        </a>
                        <a href={`mailto:${user.email}`} className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600">
                            <Mail size={14} /> Email
                        </a>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-500 font-bold">No se encontraron registros</p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL PRINCIPAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-slate-800">{isEditing ? "Editar Perfil" : "Nuevo Registro"}</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Configuración de accesos</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white text-slate-400 hover:text-red-500 rounded-full transition-colors border border-slate-100">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
              
              {/* Selector de Rol */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Rol de Usuario</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, role_id: 3})}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      formData.role_id === 3 ? 'border-[#0071e3] bg-blue-50 text-[#0071e3]' : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <User size={18}/> Cliente
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, role_id: 1})}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${formData.role_id === 1 ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-slate-100 text-slate-400'}`}>
                    <ShieldCheck size={18}/> Admin
                  </button>
                </div>
              </div>

              {/* Datos Personales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Identificación</label>
                    <input required className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#0071e3] font-bold text-slate-700 outline-none transition-all" 
                      placeholder="123456789" value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre</label>
                    <input required className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#0071e3] font-bold text-slate-700 outline-none transition-all" 
                      placeholder="Nombre Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Teléfono</label>
                    <input type="tel" className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#0071e3] outline-none transition-all" 
                      placeholder="300..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                    <input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#0071e3] outline-none transition-all" 
                      placeholder="email@correo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 </div>
              </div>

              {/* Contraseña (solo para admin o nuevo usuario) */}
              {(formData.role_id === 1 || !isEditing) && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Contraseña {!isEditing && "*"}
                  </label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required={!isEditing}
                    className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#0071e3] outline-none transition-all" 
                  />
                </div>
              )}

              <div className="space-y-1.5 pb-4">
                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ubicación</label>
                 <div className="flex gap-3">
                    <input placeholder="Ciudad" className="w-1/3 px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#0071e3] outline-none transition-all" 
                      value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    <input placeholder="Dirección" className="w-2/3 px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#0071e3] outline-none transition-all" 
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                 </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-2">
                  <button disabled={isSaving} type="submit" className={`w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 ${formData.role_id === 1 ? 'bg-amber-600 shadow-amber-900/20' : 'bg-slate-900 shadow-slate-900/20'}`}>
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {isSaving ? "Guardando..." : (isEditing ? "Actualizar Datos" : "Crear Registro")}
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