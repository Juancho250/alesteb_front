import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, X, CheckCircle2, Loader2 } from "lucide-react";
import api from "../../services/api";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({
    name: "", type: "percentage", value: "",
    starts_at: "", ends_at: "", target_type: "product", category_name: ""
  });

  // CARGA DE DATOS IGUAL A FINANCE.JSX
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        // Ejecutamos ambas al tiempo. Promise.all fallará si una falla.
        // Para ser más seguros, podemos hacerlas por separado:
        
        try {
        const resP = await api.get("/products");
        console.log("Productos cargados:", resP.data); // Para debug
        setProducts(resP.data);
        } catch (e) {
        console.error("Error cargando productos:", e);
        }

        try {
        const resD = await api.get("/discounts");
        setDiscounts(resD.data);
        } catch (e) {
        console.error("Error cargando descuentos:", e);
        }

    } finally {
        setLoading(false);
    }
    };

  const toggleProductSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalTargets = [];
      if (form.target_type === "product") {
        finalTargets = selectedIds.map(id => ({ 
          target_type: "product", 
          target_id: id.toString() 
        }));
      } else {
        finalTargets = [{ 
          target_type: "category", 
          target_id: form.category_name 
        }];
      }

      await api.post("/discounts", { ...form, targets: finalTargets });
      
      // Resetear todo
      setShowModal(false);
      setSelectedIds([]);
      setForm({ name: "", type: "percentage", value: "", starts_at: "", ends_at: "", target_type: "product", category_name: "" });
      loadData();
    } catch (err) {
      alert("Error al crear el descuento");
    }
  };

  return (
    <div className="pb-24 bg-[#F8FAFC] min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800">Descuentos</h2>
            <p className="text-slate-400 text-sm font-medium">Ofertas activas en la tienda</p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
        ) : (
          <div className="grid gap-4">
            {discounts.map((d) => (
              <div key={d.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><Tag size={24} /></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{d.name}</h4>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Válido hasta: {new Date(d.ends_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-black text-2xl text-emerald-600">
                      {d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}
                    </p>
                  </div>
                  <button 
                    onClick={async () => { if(confirm("¿Eliminar?")) { await api.delete(`/discounts/${d.id}`); loadData(); } }}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-8 rounded-[3rem] space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"><X /></button>
            
            <h3 className="text-2xl font-black text-slate-800">Crear Promoción</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Nombre de Campaña</label>
                <input 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <select className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo ($)</option>
                </select>
                <input type="number" placeholder="Valor" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold text-emerald-600" onChange={e => setForm({...form, value: e.target.value})} required />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Aplicar a:</label>
                <select 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium" 
                  value={form.target_type}
                  onChange={e => { setForm({...form, target_type: e.target.value}); setSelectedIds([]); }}
                >
                  <option value="product">Productos Seleccionados</option>
                  <option value="category">Categoría Completa</option>
                </select>
                
                {form.target_type === "product" ? (
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                    <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Selecciona los productos:</p>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {products.length > 0 ? (
                        products.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => toggleProductSelection(p.id)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedIds.includes(p.id) ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-100'}`}
                          >
                            <span className="text-xs font-bold">{p.name}</span>
                            {selectedIds.includes(p.id) && <CheckCircle2 size={16} />}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 p-2 italic">No hay productos cargados...</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <input 
                    placeholder="Escribe la categoría (ej: Buzos)" 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium border border-slate-100" 
                    onChange={e => setForm({...form, category_name: e.target.value})} 
                    required 
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Inicio</label>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold" onChange={e => setForm({...form, starts_at: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Fin</label>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold" onChange={e => setForm({...form, ends_at: e.target.value})} required />
                </div>
              </div>

              <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95">
                Activar Descuento {selectedIds.length > 0 && `(${selectedIds.length})`}
              </button>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}