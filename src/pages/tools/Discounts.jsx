import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, X, CheckCircle2, Loader2, Edit3, Calendar } from "lucide-react";
import api from "../../services/api";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // NULL para crear, ID para editar

  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({
    name: "", type: "percentage", value: "",
    starts_at: "", ends_at: "", target_type: "product", category_name: ""
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resP, resD] = await Promise.all([
        api.get("/products"),
        api.get("/discounts")
      ]);
      setProducts(resP.data);
      setDiscounts(resD.data);
    } catch (e) {
      console.error("Error cargando datos", e);
    } finally { setLoading(false); }
  };

  // Función para preparar el modal para EDITAR
  const handleEditClick = (d) => {
    setEditingId(d.id);
    const firstTarget = d.targets?.[0];
    
    // Mapear targets para la selección visual
    if (firstTarget?.target_type === 'product') {
      setSelectedIds(d.targets.map(t => parseInt(t.target_id)));
    }

    setForm({
      name: d.name,
      type: d.type,
      value: d.value,
      starts_at: d.starts_at.split('T')[0],
      ends_at: d.ends_at.split('T')[0],
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

  const toggleProductSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalTargets = [];
      if (form.target_type === "product") {
        finalTargets = selectedIds.map(id => ({ target_type: "product", target_id: id.toString() }));
      } else {
        finalTargets = [{ target_type: "category", target_id: form.category_name }];
      }

      const payload = { ...form, targets: finalTargets };

      if (editingId) {
        await api.put(`/discounts/${editingId}`, payload);
      } else {
        await api.post("/discounts", payload);
      }
      
      setShowModal(false);
      loadData();
    } catch (err) {
      alert("Error al procesar la solicitud");
    }
  };

  return (
    <div className="pb-24 bg-[#F8FAFC] min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic">PROMOCIONES</h2>
            <p className="text-slate-400 text-sm font-medium">Gestiona ofertas y campañas</p>
          </div>
          <button onClick={handleOpenCreate} className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:rotate-90 transition-all">
            <Plus size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
        ) : (
          <div className="grid gap-4">
            {discounts.map((d) => (
              <div key={d.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${new Date(d.ends_at) < new Date() ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                    <Tag size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{d.name}</h4>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       <Calendar size={10}/> {new Date(d.starts_at).toLocaleDateString()} - {new Date(d.ends_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 px-3 py-1 rounded-full">
                     <span className="font-black text-emerald-600 text-sm">
                        {d.type === 'percentage' ? `${d.value}% OFF` : `$${d.value} DTO`}
                     </span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(d)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={18} /></button>
                    <button 
                       onClick={async () => { if(confirm("¿Eliminar promo?")) { await api.delete(`/discounts/${d.id}`); loadData(); } }}
                       className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    ><Trash2 size={18} /></button>
                  </div>
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
            <h3 className="text-2xl font-black text-slate-800">{editingId ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                placeholder="Nombre de la campaña"
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
              />
              
              <div className="grid grid-cols-2 gap-3">
                <select className="p-4 bg-slate-50 rounded-2xl font-bold" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo ($)</option>
                </select>
                <input type="number" placeholder="Valor" className="p-4 bg-slate-50 rounded-2xl font-bold text-emerald-600" value={form.value} onChange={e => setForm({...form, value: e.target.value})} required />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Aplicar a:</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={form.target_type} onChange={e => { setForm({...form, target_type: e.target.value}); setSelectedIds([]); }}>
                  <option value="product">Productos específicos</option>
                  <option value="category">Toda una categoría</option>
                </select>
                
                {form.target_type === "product" ? (
                  <div className="bg-slate-50 rounded-2xl p-4 max-h-40 overflow-y-auto grid gap-2">
                    {products.map(p => (
                      <div key={p.id} onClick={() => toggleProductSelection(p.id)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedIds.includes(p.id) ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>
                        <span className="text-xs font-bold">{p.name}</span>
                        {selectedIds.includes(p.id) && <CheckCircle2 size={14} />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <input placeholder="Ej: Zapatillas" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={form.category_name} onChange={e => setForm({...form, category_name: e.target.value})} required />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Fecha Inicio</label>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold" value={form.starts_at} onChange={e => setForm({...form, starts_at: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Fecha Fin</label>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold" value={form.ends_at} onChange={e => setForm({...form, ends_at: e.target.value})} required />
                </div>
              </div>

              <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all">
                {editingId ? 'Guardar Cambios' : 'Activar Descuento'}
              </button>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}