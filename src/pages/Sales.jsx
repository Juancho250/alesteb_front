import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, Plus, Minus, History, 
  Search, User, CreditCard, CheckCircle2, X, Loader2 
} from "lucide-react";

import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useLoading } from "../context/LoadingContext";
import { useNotice } from "../context/NoticeContext";

export default function Sales() {
  const { startLoading, stopLoading } = useLoading();
  const { showNotice } = useNotice(); 
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]); 
  const [cart, setCart] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  // CARGA DE DATOS SIN RESTRICCIONES
  const loadData = async () => {
    startLoading();
    try {
      const [productsRes, usersRes] = await Promise.all([
        api.get("/products"),
        api.get("/users")
      ]);

      // ✅ CORRECCIÓN: Accede a .products si existe, sino usa el data directamente
      const productsData = productsRes.data.products || productsRes.data;
      const usersData = usersRes.data;

      setProducts(Array.isArray(productsData) ? productsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);

    } catch (err) {
      console.error("Error cargando datos de venta:", err);
      showNotice("Error al sincronizar catálogo y clientes", "error");
    } finally {
      setTimeout(stopLoading, 800);
    }
  };

  useEffect(() => { loadData(); }, []);

  const addToCart = (product) => {
    const exists = cart.find((p) => p.id === product.id);
    if (exists) {
      setCart(cart.map((p) => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map((p) => p.id === id ? { ...p, quantity: p.quantity + delta } : p)
      .filter((p) => p.quantity > 0));
  };

  const total = cart.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);

  // LÓGICA DE PAGO SIMPLIFICADA
  const handleCheckout = async () => {
    if (!selectedClient) return showNotice("Selecciona un cliente primero", "warning");
    if (cart.length === 0) return showNotice("El carrito está vacío", "warning");

    setIsSaving(true);
    startLoading();
    try {
      const saleData = {
        customer_id: selectedClient.id,
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name 
        })),
        total: total,
        sale_type: 'fisica'
      };

      await api.post("/sales", saleData);
      
      showNotice("¡Venta completada!", "success");
      setCart([]);
      setSelectedClient(null);
      setIsModalOpen(false);
      // Recargar productos por si bajó el stock
      loadData(); 
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error al procesar la venta";
      showNotice(errorMsg, "error");
    } finally {
      setIsSaving(false);
      stopLoading();
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(clientSearch.toLowerCase()) || 
    u.cedula?.includes(clientSearch)
  );

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="pb-24 bg-[#F8FAFC] min-h-screen">
      <Header />
      
      <main className="p-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- SECCIÓN 1: RESÚMENES (Catálogo) --- */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black italic tracking-tighter uppercase">Productos</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar catálogo..." 
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="group p-3 bg-white rounded-3xl border border-slate-100 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left relative overflow-hidden"
              >
                <div className="aspect-square bg-slate-50 rounded-2xl mb-3 overflow-hidden relative">
                  {p.main_image ? (
                    <img src={p.main_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200 font-black text-4xl">{p.name[0]}</div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">
                    Stock: {p.stock}
                  </div>
                </div>
                <p className="font-bold text-slate-800 truncate text-xs px-1">{p.name}</p>
                <p className="text-blue-600 font-black text-lg px-1">${Number(p.price).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* --- SECCIÓN 2: REGISTROS (Carrito) --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-6 sticky top-24 border border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black italic tracking-tighter uppercase flex items-center gap-2">
                <ShoppingCart className="text-blue-600" size={20} /> Carrito
              </h2>
              <button onClick={() => navigate("/history")} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition">
                <History size={18} />
              </button>
            </div>

            <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 mb-6 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-10 opacity-30 italic font-bold text-sm">Carrito vacío</div>
              ) : cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center group bg-slate-50/50 p-3 rounded-2xl border border-transparent hover:border-slate-100">
                  <div className="max-w-[140px]">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">${Number(item.price).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1 text-slate-400 hover:text-red-500"><Minus size={12} /></button>
                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1 text-blue-600"><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-6">
              <div className="flex justify-between items-end mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">${total.toLocaleString()}</span>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                disabled={cart.length === 0}
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Continuar Venta
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- SECCIÓN 3: GRÁFICAS (No hay en este componente, pero el Modal actúa como resumen final) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Cerrar Orden</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            <div className="mb-6 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Cliente Responsable</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o cédula..." 
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    if(selectedClient) setSelectedClient(null);
                  }}
                />
              </div>

              {clientSearch.length > 0 && !selectedClient && (
                <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-2xl bg-white shadow-xl custom-scrollbar">
                  {filteredUsers.length > 0 ? filteredUsers.map(u => (
                    <button 
                      key={u.id}
                      onClick={() => { setSelectedClient(u); setClientSearch(u.name); }}
                      className="w-full text-left p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors"
                    >
                      <div>
                        <p className="font-black text-slate-800 text-sm">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{u.cedula}</p>
                      </div>
                      <Plus size={16} className="text-blue-500" />
                    </button>
                  )) : (
                    <p className="p-4 text-center text-xs font-bold text-slate-300 italic">No se encontraron resultados</p>
                  )}
                </div>
              )}
            </div>

            {selectedClient && (
              <div className="bg-blue-600 p-5 rounded-[2rem] text-white flex items-center justify-between mb-8 shadow-lg shadow-blue-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"><User size={24}/></div>
                  <div>
                    <p className="font-black tracking-tighter">{selectedClient.name}</p>
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">{selectedClient.cedula}</p>
                  </div>
                </div>
                <button onClick={() => {setSelectedClient(null); setClientSearch("");}} className="text-white/50 hover:text-white"><X size={18}/></button>
              </div>
            )}

            <div className="bg-slate-50 p-6 rounded-[2rem] mb-8 space-y-2 border border-slate-100">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-tighter">
                <span>Items</span>
                <span>{cart.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-black italic tracking-tighter uppercase text-slate-800">Total Neto</span>
                <span className="font-black text-2xl text-blue-600 tracking-tighter">${total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSaving || !selectedClient}
              className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/10 transition-all flex items-center justify-center gap-3"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
              {isSaving ? "Procesando..." : "Confirmar y Cobrar"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}