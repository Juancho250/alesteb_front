import { useState, useEffect } from "react";
import api from "../services/api"; 
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext"; 
import { 
  Search, UserPlus, Phone, Mail, X, 
  Loader2, Save, CreditCard, MapPin, 
  User, Users as UsersIcon, Edit3, Trash2, 
  ShieldAlert, Key, ShieldCheck, CheckCircle2
} from "lucide-react";

export default function Users() {
  const { can } = useAuth(); 
  const [users, setUsers] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]); // Lista global de permisos
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialFormState = { 
    id: null, name: "", email: "", phone: "", 
    cedula: "", city: "", address: "",
    role_id: 2, 
    password: "",
    permissions: [] // IDs de permisos seleccionados
  };
  const [formData, setFormData] = useState(initialFormState);

  // Carga inicial de datos
  const fetchData = async () => {
    if (!can('user.read')) {
      setLoading(false);
      return;
    }

    try {
      console.log("Iniciando carga de datos...");
      
      // Cargamos por separado para que si uno falla, el otro no se detenga
      const usersRes = await api.get("/users").catch(err => {
        console.error("Error en /users:", err);
        return { data: [] };
      });

      const permsRes = await api.get("/permissions").catch(err => {
        console.error("Error en /permissions (omitiendo):", err);
        return { data: [] };
      });

      console.log("Respuesta de Usuarios:", usersRes.data);

      // VALIDACIÓN DE ESTRUCTURA:
      // Si tu API devuelve { data: [...] }, usa res.data.data
      const userData = Array.isArray(usersRes.data) 
        ? usersRes.data 
        : (usersRes.data?.data || []);

      setUsers(userData);
      setAvailablePermissions(permsRes.data || []);

    } catch (err) {
      console.error("Error crítico en fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // Lógica para marcar/desmarcar permisos
  const togglePermission = (id) => {
    setFormData(prev => {
      const isSelected = prev.permissions.includes(id);
      return {
        ...prev,
        permissions: isSelected 
          ? prev.permissions.filter(pId => pId !== id) 
          : [...prev.permissions, id]
      };
    });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData(initialFormState);
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
      role_id: user.role_id || 2,
      password: "",
      // Mapeamos los permisos actuales del usuario si el backend los envía
      permissions: user.permissions?.map(p => p.id) || [] 
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
    } catch (err) {
        alert("Error al eliminar: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveUser = async (e) => {
  e.preventDefault();
  
    // Validación extra de seguridad para Admin
    if (formData.role_id === 1 && !isEditing && !formData.password) {
      alert("La contraseña es obligatoria para administradores");
      return;
    }

    if (formData.role_id === 1 && formData.permissions.length === 0) {
      if (!window.confirm("¿Seguro que quieres crear un Admin sin permisos específicos?")) return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        await api.put(`/users/${formData.id}`, formData);
      } else {
        await api.post("/users", formData);
      }
      
      setIsModalOpen(false);
      fetchData(); 
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
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Usuarios y Clientes</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Administra accesos y permisos del sistema</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end px-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registros Totales</span>
                <span className="text-xl font-black text-slate-800">{users.length}</span>
             </div>
             
             {can('user.create') && (
                 <button 
                    onClick={openCreateModal}
                    className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center gap-2 font-bold transition-all active:scale-95"
                 >
                    <UserPlus size={20} />
                    <span>Nuevo Registro</span>
                 </button>
             )}
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
          ) : !can('user.read') ? (
            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-red-100">
               <ShieldAlert className="mx-auto mb-4 text-red-400" size={48} />
               <p className="text-slate-800 font-bold text-lg">Acceso Restringido</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div key={user.id} className="group bg-white p-5 rounded-[1.5rem] border border-slate-100 hover:border-[#0071e3]/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                    {can('user.update') && (
                        <button onClick={() => openEditModal(user)} className="p-2 bg-slate-50 text-slate-400 hover:bg-[#0071e3] hover:text-white rounded-full transition-all border border-slate-100">
                          <Edit3 size={16} />
                        </button>
                    )}
                    {can('user.delete') && (
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-full transition-all border border-slate-100">
                          <Trash2 size={16} />
                        </button>
                    )}
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
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                      <ShieldAlert size={12} className="text-[#0071e3]"/> Configuración de accesos
                    </div>
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
                  <button type="button" onClick={() => setFormData({...formData, role_id: 2})}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${formData.role_id === 2 ? 'border-[#0071e3] bg-blue-50 text-[#0071e3]' : 'border-slate-100 text-slate-400'}`}>
                    <User size={18}/> Cliente
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, role_id: 1})}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${formData.role_id === 1 ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-slate-100 text-slate-400'}`}>
                    <ShieldCheck size={18}/> Admin
                  </button>
                </div>
              </div>

              {/* SECCIÓN DINÁMICA DE PERMISOS (Solo si es Admin) */}
              {formData.role_id === 1 && (
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                      <Key size={12} className="text-amber-500"/> Permisos de Admin
                    </span>
                    <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                      {formData.permissions.length} activos
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                    {availablePermissions.map((perm) => (
                      <div 
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${formData.permissions.includes(perm.id) ? 'bg-white border-amber-200 shadow-sm' : 'bg-transparent border-transparent opacity-60'}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{perm.description}</span>
                          <span className="text-[9px] font-mono text-slate-400">{perm.slug}</span>
                        </div>
                        {formData.permissions.includes(perm.id) ? (
                          <CheckCircle2 size={16} className="text-amber-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#0071e3] outline-none transition-all" 
                      placeholder="email@correo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 </div>
              </div>

              {/* Campo de Contraseña con validación dinámica */}
              {(formData.role_id === 1 || !isEditing) && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Contraseña {isEditing ? (formData.role_id === 1 ? "*" : "(Opcional)") : "*"}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      // Obligatorio si es Admin o si es un registro nuevo
                      required={formData.role_id === 1 || !isEditing}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-[#0071e3] outline-none transition-all" 
                    />
                  </div>
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