import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, X, CheckCircle2, Edit3, Calendar, Percent, DollarSign, Package, Layers } from "lucide-react";
import api from "../../services/api";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { useLoading } from "../../context/LoadingContext";
import { useNotice } from "../../context/NoticeContext";

export default function Discounts() {
  const { startLoading, stopLoading } = useLoading();
  const { showNotice, askConfirmation } = useNotice();

  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({
    name: "", type: "percentage", value: "",
    starts_at: "", ends_at: "", target_type: "product", category_name: ""
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    startLoading();
    try {
      const [resP, resD] = await Promise.all([
        api.get("/products"),
        api.get("/discounts")
      ]);
      
      // ✅ CORRECCIÓN: Maneja la estructura con paginación
      const productsData = resP.data.products || resP.data;
      setProducts(Array.isArray(productsData) ? productsData : []);
      setDiscounts(resD.data || []);
    } catch (e) { 
      console.error("Error cargando descuentos:", e);
      showNotice("Error al cargar descuentos", "error");
    } finally { 
      setLoading(false);
      setTimeout(stopLoading, 600);
    }
  };

  const handleEditClick = (d) => {
    setEditingId(d.id);
    const firstTarget = d.targets?.[0];
    if (firstTarget?.target_type === 'product') {
      setSelectedIds(d.targets.map(t => parseInt(t.target_id)));
    } else { setSelectedIds([]); }

    setForm({
      name: d.name, type: d.type, value: d.value,
      starts_at: d.starts_at?.split('T')[0] || "",
      ends_at: d.ends_at?.split('T')[0] || "",
      target_type: firstTarget?.target_type || "product",
      category_name: firstTarget?.target_type === 'category' ? firstTarget.target_id : ""
    });
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setSelectedIds([]);
    setForm({ name: "", type: "percentage", value: "", starts_at: "", ends_at: "", target_type: "product", category_name: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    startLoading();
    try {
      const finalTargets = form.target_type === "product" 
        ? selectedIds.map(id => ({ target_type: "product", target_id: id.toString() }))
        : [{ target_type: "category", target_id: form.category_name }];

      const payload = { ...form, targets: finalTargets };
      
      if (editingId) {
        await api.put(`/discounts/${editingId}`, payload);
        showNotice("Descuento actualizado", "success");
      } else {
        await api.post("/discounts", payload);
        showNotice("Descuento creado con éxito", "success");
      }
      
      setShowModal(false);
      loadData();
    } catch (err) { 
      console.error("Error al guardar:", err);
      showNotice("Error al guardar el descuento", "error");
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await askConfirmation(
      "¿Eliminar descuento?",
      "Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    startLoading();
    try {
      await api.delete(`/discounts/${id}`);
      showNotice("Descuento eliminado", "success");
      loadData();
    } catch (err) {
      console.error("Error al eliminar:", err);
      showNotice("Error al eliminar el descuento", "error");
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="pb-32 bg-[#F8FAFC] min-h-screen font-sans text-slate-900 antialiased">
      <Header />
      
      <main className="max-w-2xl mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Ofertas</h2>
            <p className="text-slate-500 mt-1 font-medium">Gestiona tus campañas activas</p>
          </div>
          
          <button 
            onClick={handleOpenCreate} 
            className="group flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold text-sm">Crear</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0"></div>
            </div>
            <p className="text-slate-400 font-medium animate-pulse">Sincronizando catálogo...</p>
          </div>
        ) : discounts.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Tag className="text-slate-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No hay descuentos</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">Empieza a crear ofertas para incentivar tus ventas.</p>
            </div>
        ) : (
          <div className="grid gap-4">
            {discounts.map((d) => (
              <div 
                key={d.id} 
                className="group bg-white border border-slate-200/60 rounded-[2rem] p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${d.type === 'percentage' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {d.type === 'percentage' ? <Percent size={24} /> : <DollarSign size={24} />}
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-xl text-slate-900 tracking-tight">{d.name}</h4>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                <Calendar size={14} />
                                <span>Expira: {new Date(d.ends_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${d.type === 'percentage' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {d.type === 'percentage' ? `-${d.value}%` : `-$${d.value}`}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => handleEditClick(d)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        <Edit3 size={18}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Premium */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{editingId ? 'Editar Oferta' : 'Nueva Oferta'}</h3>
                <p className="text-slate-500 text-sm">Configura los parámetros de tu descuento</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-colors">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nombre de la campaña</label>
                <input 
                  placeholder="Ej: Black Friday"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Tipo</label>
                  <div className="relative">
                    <select className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none appearance-none font-medium cursor-pointer" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                        <option value="percentage">Porcentaje (%)</option>
                        <option value="fixed">Monto Fijo ($)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Valor</label>
                  <input type="number" placeholder="0" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-blue-600" value={form.value} onChange={e => setForm({...form, value: e.target.value})} required />
                </div>
              </div>

              {/* Selector de objetivo con estilo moderno */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Aplicar a</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => { setForm({...form, target_type: 'product'}); setSelectedIds([]); }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${form.target_type === 'product' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
                  >
                    <Package size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Productos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setForm({...form, target_type: 'category'}); setSelectedIds([]); }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${form.target_type === 'category' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
                  >
                    <Layers size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Categoría</span>
                  </button>
                </div>
                
                <div className="mt-3">
                    {form.target_type === "product" ? (
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {products.map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(i => i !== p.id) : [...prev, p.id])} 
                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedIds.includes(p.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-600'}`}
                        >
                            <span className="text-sm font-bold">{p.name}</span>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${selectedIds.includes(p.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200'}`}>
                                {selectedIds.includes(p.id) && <CheckCircle2 size={14} />}
                            </div>
                        </div>
                        ))}
                    </div>
                    ) : (
                    <input placeholder="Nombre de la categoría (ej: Bebidas)" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-medium" value={form.category_name} onChange={e => setForm({...form, category_name: e.target.value})} required />
                    )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Inicio</label>
                  <input type="date" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl text-sm font-semibold outline-none" value={form.starts_at} onChange={e => setForm({...form, starts_at: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Fin</label>
                  <input type="date" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl text-sm font-semibold outline-none" value={form.ends_at} onChange={e => setForm({...form, ends_at: e.target.value})} required />
                </div>
              </div>

              <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-blue-600 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] mt-4">
                {editingId ? 'Actualizar Oferta' : 'Lanzar Descuento'}
              </button>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}