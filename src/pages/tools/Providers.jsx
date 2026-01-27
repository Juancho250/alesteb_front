import { Phone, MessageCircle, AlertCircle, History, Package, Search, Plus, ExternalLink, Loader2, X, Save, Building2, MapPin, Mail, ChevronRight, TrendingUp, Wallet, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../services/api";

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [stats, setStats] = useState(null); // Para la sección de Gráficas/Resumen
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialProviderState = {
    name: "",
    category: "Productos Terminados",
    phone: "",
    email: "",
    address: "",
    balance: 0,
    lead_time: "",
    reliability: 5.0
  };

  const [newProvider, setNewProvider] = useState(initialProviderState);

  const fetchProviders = async () => {
    try {
      const response = await api.get("/providers");
      setProviders(response.data);
      if (response.data.length > 0 && !selectedProvider) {
        handleSelectProvider(response.data[0]);
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carga estadísticas cuando seleccionas un proveedor
  const handleSelectProvider = async (provider) => {
    setSelectedProvider(provider);
    try {
      const response = await api.get(`/providers/${provider.id}/history`); // Usamos este endpoint o el de stats
      // Aquí podrías procesar los datos para las gráficas
      setStats(response.data); 
    } catch (error) {
      console.error("Error al cargar stats del proveedor");
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleCreateProvider = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formattedProvider = {
        ...newProvider,
        balance: parseFloat(newProvider.balance) || 0,
        reliability: parseFloat(newProvider.reliability) || 5.0
      };
      const response = await api.post("/providers", formattedProvider);
      await fetchProviders();
      setIsModalOpen(false);
      setNewProvider(initialProviderState);
    } catch (error) {
      alert("Error al crear el proveedor.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Totales para la sección RESUMEN
  const totalDeuda = providers.reduce((acc, curr) => acc + Number(curr.balance), 0);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-black italic tracking-tighter text-lg uppercase">Sincronizando Suministros</p>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 lg:pb-8 font-sans selection:bg-blue-100 selection:text-blue-600">
      
      {/* MODAL: REGISTRO SOFISTICADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 lg:p-12">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-800 italic leading-none">Nuevo Aliado</h3>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mt-2">Configuración de parámetros operativos</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateProvider} className="space-y-4">
                {/* Identificación */}
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    required 
                    value={newProvider.name}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold transition-all outline-none" 
                    placeholder="Nombre de la Empresa / Proveedor" 
                    onChange={e => setNewProvider({...newProvider, name: e.target.value})} 
                  />
                </div>

                {/* Contacto y Categoría */}
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={newProvider.category}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold outline-none cursor-pointer" 
                    onChange={e => setNewProvider({...newProvider, category: e.target.value})}
                  >
                    <option value="Productos Terminados">🛍️ Productos Terminados</option>
                    <option value="Materia Prima">🏗️ Materia Prima</option>
                    <option value="Servicios">⚡ Servicios (Luz/Internet)</option>
                  </select>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      value={newProvider.phone}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none" 
                      placeholder="WhatsApp" 
                      onChange={e => setNewProvider({...newProvider, phone: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Ubicación y Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      value={newProvider.address}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none" 
                      placeholder="Dirección" 
                      onChange={e => setNewProvider({...newProvider, address: e.target.value})} 
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      value={newProvider.email}
                      type="email"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none" 
                      placeholder="Email" 
                      onChange={e => setNewProvider({...newProvider, email: e.target.value})} 
                    />
                  </div>
                </div>

                {/* SECCIÓN TÉCNICA */}
                <div className="bg-slate-50 p-6 rounded-[2rem] grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Saldo Deuda ($)</label>
                    <input 
                      type="number"
                      value={newProvider.balance}
                      className="w-full bg-white rounded-xl p-3 text-sm font-black text-red-500 outline-none border border-slate-100" 
                      placeholder="0.00" 
                      onChange={e => setNewProvider({...newProvider, balance: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Días Entrega</label>
                    <input 
                      type="text"
                      value={newProvider.lead_time}
                      className="w-full bg-white rounded-xl p-3 text-sm font-black text-slate-700 outline-none border border-slate-100" 
                      placeholder="Ej: 3-5 días" 
                      onChange={e => setNewProvider({...newProvider, lead_time: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Fiabilidad (1-5)</label>
                    <input 
                      type="number" 
                      max="5" 
                      min="1"
                      step="0.1"
                      value={newProvider.reliability}
                      className="w-full bg-white rounded-xl p-3 text-sm font-black text-blue-600 outline-none border border-slate-100" 
                      placeholder="5.0" 
                      onChange={e => setNewProvider({...newProvider, reliability: e.target.value})} 
                    />
                  </div>
                </div>

                <button 
                  disabled={isSaving} 
                  className="w-full bg-slate-900 text-white p-6 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50 mt-4"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Establecer Alianza Comercial
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 lg:p-10 space-y-8">
        
        {/* TOP BAR */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter">Providers<span className="text-blue-600">.</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Ecosistema de Abastecimiento</p>
          </div>
          
          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Filtrar por nombre o tipo..." 
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-blue-600 text-white px-6 rounded-[1.5rem] hover:bg-slate-900 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              <span className="hidden md:block font-black text-xs uppercase tracking-widest">Añadir</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LISTA DE PROVEEDORES */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 border border-white shadow-sm">
              <div className="flex justify-between items-center mb-6 px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aliados Activos</span>
                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{filteredProviders.length} TOTAL</span>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredProviders.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedProvider(p)} 
                    className={`group relative flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${selectedProvider?.id === p.id ? 'bg-white border-blue-500 shadow-xl shadow-blue-500/5 scale-[1.02]' : 'bg-white/50 border-transparent hover:border-slate-100'}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-colors ${Number(p.balance) > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-base">{p.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase border border-slate-100 px-2 py-0.5 rounded-md">{p.category}</span>
                          {Number(p.balance) > 0 && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:block text-right">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Saldo</p>
                        <p className={`text-lg font-black tracking-tighter italic ${Number(p.balance) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          ${Number(p.balance).toLocaleString()}
                        </p>
                      </div>
                      <ChevronRight size={20} className={`text-slate-300 transition-transform ${selectedProvider?.id === p.id ? 'translate-x-1 text-blue-500' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DETALLES Y ACCIONES (STICKY) */}
          <div className="lg:col-span-5 sticky top-10">
            {selectedProvider ? (
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] opacity-10 rotate-12">
                   <Building2 size={240} />
                </div>
                
                <div className="relative z-10">
                  <span className="px-4 py-1.5 bg-blue-600 text-[10px] font-black rounded-full uppercase italic tracking-widest">
                    {selectedProvider.category}
                  </span>
                  <h3 className="font-black text-4xl mt-6 tracking-tighter italic leading-tight">{selectedProvider.name}</h3>
                  
                  <div className="flex flex-col gap-3 mt-8">
                    <div className="flex items-center gap-3 text-slate-400">
                      <MapPin size={16} className="text-blue-500" />
                      <span className="text-xs font-bold">{selectedProvider.address || 'Ubicación no especificada'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <Phone size={16} className="text-blue-500" />
                      <span className="text-xs font-bold">{selectedProvider.phone || 'Sin teléfono'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <Mail size={16} className="text-blue-500" />
                      <span className="text-xs font-bold">{selectedProvider.email || 'Sin correo electrónico'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-10">
                    <div className="bg-white/5 backdrop-blur-md p-5 rounded-[2rem] border border-white/5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 text-center">Fiabilidad</p>
                      <p className="text-2xl font-black text-center text-blue-400 italic">{selectedProvider.reliability || '5.0'}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-5 rounded-[2rem] border border-white/5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 text-center">Crédito</p>
                      <p className={`text-2xl font-black text-center tracking-tighter italic ${Number(selectedProvider.balance) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        ${Number(selectedProvider.balance).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center p-6 bg-blue-600 hover:bg-blue-500 rounded-[2rem] transition-all group shadow-xl shadow-blue-600/20 active:scale-95">
                      <AlertCircle className="mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Abonar</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-6 bg-white/10 hover:bg-white/20 rounded-[2rem] transition-all group active:scale-95">
                      <History className="mb-2 group-hover:scale-110 transition-transform text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Precios</span>
                    </button>
                  </div>

                  <div className="mt-8 flex justify-center gap-6 border-t border-white/10 pt-8">
                    <a href={`tel:${selectedProvider.phone?.replace(/\s/g, '')}`} 
                        className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all text-blue-400 hover:text-white">
                        <Phone size={20}/>
                    </a>
                    <a href={`https://wa.me/${selectedProvider.phone?.replace(/\s/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-4 bg-white/5 rounded-2xl hover:bg-emerald-600 transition-all text-emerald-400 hover:text-white">
                        <MessageCircle size={20}/>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-[3rem] border-4 border-dashed border-slate-50 text-slate-300 p-20 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Package size={40} className="opacity-20" />
                </div>
                <p className="text-sm font-black italic uppercase tracking-tighter">Selecciona un aliado para ver el rendimiento operacional</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}