import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, Plus, Minus, Trash2, History, 
  Search, User, CreditCard, CheckCircle2, X, Loader2 
} from "lucide-react";

import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]); // Para la lista de clientes
  const [cart, setCart] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [prodRes, userRes] = await Promise.all([
        api.get("/products"),
        api.get("/users")
      ]);
      setProducts(prodRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error("Error cargando datos", err);
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

  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const handleCheckout = async () => {
    if (!selectedClient) return alert("Por favor selecciona un cliente");
    if (cart.length === 0) return alert("El carrito está vacío");
    
    setIsSaving(true);
    try {
      const saleData = {
        customer_id: selectedClient.id,
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name // para el log de errores
        })),
        total: total,
        sale_type: 'fisica'
      };

      await api.post("/sales", saleData);
      
      setCart([]);
      setSelectedClient(null);
      setIsModalOpen(false);
      alert("✅ Venta registrada con éxito");
    } catch (err) {
      // Esto te dirá exactamente qué dijo el servidor
      const errorMsg = err.response?.data?.message || err.message;
      alert("Error del servidor: " + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrar clientes para el buscador del modal
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(clientSearch.toLowerCase()) || 
    u.cedula?.includes(clientSearch)
  );

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <Header />
      
      <main className="p-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECCIÓN PRODUCTOS */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Catálogo</h2>
            <div className="relative w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="group p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  {/* CONTENEDOR DE IMAGEN */}
                  <div className="w-full h-32 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                    {p.image_url ? (
                      <img 
                        src={p.main_image || p.image_url}
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150?text=Sin+Imagen";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">
                        {p.name[0]}
                      </div>
                    )}
                  </div>

                  <p className="font-bold text-gray-800 truncate text-sm">{p.name}</p>
                  <p className="text-blue-600 font-black">${Number(p.price).toLocaleString()}</p>
                </button>
              ))}
          </div>
        </div>

        {/* SECCIÓN RESUMEN (CARRITO) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] shadow-xl p-6 sticky top-24 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="text-blue-600" /> Resumen
              </h2>
              <button onClick={() => navigate("/history")} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 transition">
                <History size={20} />
              </button>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">No hay productos seleccionados</p>
                </div>
              ) : cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400">${item.price} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded-md text-gray-500"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded-md text-blue-600"><Plus size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-end mb-6">
                <span className="text-gray-400 font-medium">Total a pagar</span>
                <span className="text-2xl font-black text-gray-900">${total.toLocaleString()}</span>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                disabled={cart.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                Continuar con la Venta
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE FINALIZACIÓN (RELACIÓN CON CLIENTE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-800">Finalizar Venta</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
            </div>

            {/* Buscador de Cliente */}
            <div className="mb-6">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">Seleccionar Cliente</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Nombre o Cédula..." 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
              </div>

              {/* Lista Desplegable de Clientes */}
              {clientSearch.length > 0 && !selectedClient && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-xl bg-white shadow-lg">
                  {filteredUsers.map(u => (
                    <button 
                      key={u.id}
                      onClick={() => { setSelectedClient(u); setClientSearch(""); }}
                      className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-0 flex justify-between"
                    >
                      <span className="font-bold text-sm text-gray-700">{u.name}</span>
                      <span className="text-xs text-gray-400">{u.cedula}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cliente Seleccionado Card */}
            {selectedClient && (
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg"><User size={20}/></div>
                  <div>
                    <p className="font-bold text-blue-900 text-sm">{selectedClient.name}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1"><CreditCard size={12}/> {selectedClient.cedula}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedClient(null)} className="text-blue-400 hover:text-red-500"><X size={18}/></button>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-2xl mb-8">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Total productos</span>
                <span className="font-bold">{cart.length}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-black text-gray-800">Total</span>
                <span className="font-black text-blue-600">${total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSaving || !selectedClient}
              className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
              {isSaving ? "Procesando..." : "Confirmar Pago"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}