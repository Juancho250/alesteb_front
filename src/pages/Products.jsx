import { 
  Plus, Trash2, Eye, X, Upload, 
  Package, ShoppingBag, AlertCircle, Search 
} from "lucide-react";
import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

function CreateProductModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", price: "", stock: "", category_id: "" });
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Cargar categorías al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const fetchCats = async () => {
        try {
          const { data } = await api.get("/categories/flat");
          setCategories(data);
        } catch (err) {
          console.error("Error cargando categorías", err);
        }
      };
      fetchCats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreview((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setPreview(preview.filter((_, i) => i !== index));
    setImages(images.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category_id) return alert("Por favor selecciona una categoría");
    
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("price", form.price);
      data.append("stock", form.stock);
      data.append("category_id", form.category_id);
      images.forEach((img) => data.append("images", img));

      await api.post("/products", data);
      onCreated();
      onClose();
      setForm({ name: "", price: "", stock: "", category_id: "" });
      setPreview([]);
      setImages([]);
    } catch (err) {
      alert(err.response?.data?.message || "Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
          <X size={20} />
        </button>

        <h3 className="text-2xl font-black text-slate-800 mb-6">Nuevo Producto</h3>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Información Básica</label>
            <input 
              name="name" 
              placeholder="Nombre del producto" 
              className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
              onChange={handleChange} 
              required 
            />
            
            <div className="relative">
              <select 
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium appearance-none cursor-pointer"
                required
              >
                <option value="">Seleccionar Categoría...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.full_path}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">Precio</label>
              <input name="price" type="number" step="0.01" placeholder="0.00" className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-emerald-600" onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">Stock Inicial</label>
              <input name="stock" type="number" placeholder="0" className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" onChange={handleChange} required />
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-[1.5rem] p-6 text-center hover:bg-slate-50 transition-all relative group">
            <input type="file" multiple accept="image/*" onChange={handleImages} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-slate-400 flex flex-col items-center">
              <Upload size={28} className="group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-bold mt-2">Galería de Fotos</span>
              <span className="text-xs opacity-60">Toca para subir</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {preview.map((src, i) => (
              <div key={i} className="relative flex-shrink-0">
                <img src={src} className="w-16 h-16 object-cover rounded-xl border-2 border-slate-100" alt="Preview" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-black shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? "Procesando..." : "Guardar Producto"}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDetail, setOpenDetail] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [current, setCurrent] = useState(null);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
      localStorage.setItem("products_cache", JSON.stringify(res.data));
    } catch (err) {
      const cached = localStorage.getItem("products_cache");
      if (cached) setProducts(JSON.parse(cached));
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteProduct = async (id) => {
    if (!confirm("¿Eliminar este producto permanentemente?")) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  const openPreview = async (product) => {
    try {
      const res = await api.get(`/products/${product.id}`);
      const mainImage = res.data.images?.find((img) => img.is_main)?.url || product.main_image;
      setCurrent({ ...res.data, main_image: mainImage });
      setOpenDetail(true);
    } catch (err) {
      alert("Error al cargar detalles");
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${current.id}`, {
        name: current.name,
        price: Number(current.price),
        stock: Number(current.stock),
        category_id: current.category_id,
      });
      setOpenDetail(false);
      loadProducts();
    } catch (err) {
      alert("Error al actualizar");
    }
  };
  

  return (
    <div className="pb-24 bg-[#F8FAFC] min-h-screen font-sans">
      <Header />

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Inventario</p>
              <h2 className="text-3xl font-black text-slate-800">Tus Productos</h2>
            </div>
            <button
              onClick={() => setOpenCreate(true)}
              className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-90"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nombre o categoría..."
              className="w-full bg-white border-none shadow-sm rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((p) => {
            const lowStock = p.stock <= 5;
            const criticalStock = p.stock === 0;
            const hasDiscount =
            Number(p.final_price) > 0 && Number(p.final_price) < Number(p.price);

            const discountPercent = hasDiscount
            ? Math.round(((p.price - p.final_price) / p.price) * 100)
            : 0;


            return (
              <div key={p.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group">
                <div className="relative flex-shrink-0">

                  {p.main_image ? (
                    <img src={p.main_image} className="w-20 h-20 object-cover rounded-[1.5rem] bg-slate-100" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-300">
                      <ShoppingBag size={32} />
                    </div>
                  )}
                  {criticalStock && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full border-4 border-white">
                      <AlertCircle size={14} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                      {p.category_name || 'General'}
                    </span>
                    {lowStock && (
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${criticalStock ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        {criticalStock ? 'Sin Stock' : 'Stock Bajo'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">{p.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-slate-500">
                    {hasDiscount ? (
                      <p className="text-sm font-bold text-slate-700">
                        ${Number(p.price).toLocaleString()}
                        <span className="mx-2 text-slate-300">→</span>
                        <span className="text-emerald-600">
                          ${Number(p.final_price).toLocaleString()}
                        </span>
                      </p>
                    ) : (
                      <p className="font-black text-slate-900">
                        ${Number(p.price).toLocaleString()}
                      </p>
                    )}


                    <span className="text-slate-200">|</span>
                    <p className={`text-xs font-bold ${lowStock ? 'text-red-500' : 'text-slate-400'}`}>
                      {p.stock} unidades
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => openPreview(p)} className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">No encontramos productos</p>
          </div>
        )}
      </main>

      <CreateProductModal 
        isOpen={openCreate} 
        onClose={() => setOpenCreate(false)} 
        onCreated={loadProducts} 
      />

      {openDetail && current && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl animate-in fade-in duration-300">
            <button onClick={() => setOpenDetail(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={20} /></button>
            
            <h3 className="text-2xl font-black text-slate-800 mb-6">Detalles del Producto</h3>
            
            <div className="mb-8">
              <div className="relative group">
                <img src={current.main_image} className="w-full h-64 object-cover rounded-[2rem] border-4 border-slate-50 shadow-inner" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/80 backdrop-blur px-3 py-2 rounded-2xl shadow-xl">
                  {current.images?.map((img) => (
                    <img 
                      key={img.id} src={img.url} 
                      onClick={() => setCurrent({ ...current, main_image: img.url })}
                      className={`w-12 h-12 object-cover rounded-xl cursor-pointer transition-all ${current.main_image === img.url ? "ring-2 ring-blue-500 scale-110" : "opacity-60 hover:opacity-100"}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={updateProduct} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Nombre</label>
                <input className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 outline-none" value={current.name} onChange={(e) => setCurrent({ ...current, name: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Precio ($)</label>
                  <input type="number" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-black text-emerald-600 outline-none" value={current.price} onChange={(e) => setCurrent({ ...current, price: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Stock Disponible</label>
                  <input type="number" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-black text-slate-800 outline-none" value={current.stock} onChange={(e) => setCurrent({ ...current, stock: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Categoría</label>
                <input className="w-full bg-slate-50 border-none p-4 rounded-2xl font-medium outline-none" value={current.category_name || ""} onChange={(e) => setCurrent({ ...current, category_name: e.target.value })} />
              </div>

              <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-black transition-all active:scale-95">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}