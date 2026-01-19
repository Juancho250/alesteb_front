import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, X, Upload } from "lucide-react";
import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

// --- COMPONENTE MODAL PARA CREAR ---
function CreateProductModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", price: "", stock: "", category: "" });
  const [preview, setPreview] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("price", form.price);
      data.append("stock", form.stock);
      data.append("category", form.category);
      images.forEach((img) => data.append("images", img));

      await api.post("/products", data);
      onCreated(); // Recarga la lista
      onClose();   // Cierra modal
      setForm({ name: "", price: "", stock: "", category: "" });
      setPreview([]);
      setImages([]);
    } catch (err) {
      alert("Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold mb-6">Nuevo Producto</h3>

        <form onSubmit={submit} className="space-y-4">
          <input name="name" placeholder="Nombre" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
          <input name="category" placeholder="Categoría" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
          
          <div className="grid grid-cols-2 gap-4">
            <input name="price" type="number" placeholder="Precio" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
            <input name="stock" type="number" placeholder="Stock" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition relative">
            <input type="file" multiple accept="image/*" onChange={handleImages} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-gray-400 flex flex-col items-center">
              <Upload size={24} />
              <span className="text-xs mt-2">Subir imágenes</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {preview.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} className="w-full h-20 object-cover rounded-lg border" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center">✕</button>
              </div>
            ))}
          </div>

          <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar Producto"}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function Products() {
  const [products, setProducts] = useState([]);
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

  const deleteProduct = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
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
        category: current.category,
      });
      setOpenDetail(false);
      loadProducts();
    } catch (err) {
      alert("Error al actualizar");
    }
  };

  return (
    <div className="pb-16 bg-gray-50 min-h-screen">
      <Header />

      <main className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Productos</h2>
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md active:scale-95 transition"
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>

        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center transition-all">
              <div className="flex items-center gap-4">
                {p.main_image && <img src={p.main_image} className="w-14 h-14 object-cover rounded-lg bg-gray-100" />}
                <div>
                  <h3 className="font-semibold text-gray-800 leading-tight">{p.name}</h3>
                  <p className="text-sm text-gray-500">${p.price} · Stock: {p.stock}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openPreview(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Eye size={18} /></button>
                <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL DE CREACIÓN */}
      <CreateProductModal 
        isOpen={openCreate} 
        onClose={() => setOpenCreate(false)} 
        onCreated={loadProducts} 
      />

      {/* MODAL DE EDICIÓN / DETALLE */}
      {openDetail && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button onClick={() => setOpenDetail(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6">Detalles del Producto</h3>
            
            <div className="mb-6">
              <img src={current.main_image} className="w-full h-56 object-cover rounded-2xl border" />
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {current.images?.map((img) => (
                  <img 
                    key={img.id} src={img.url} 
                    onClick={() => setCurrent({ ...current, main_image: img.url })}
                    className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer ${current.main_image === img.url ? "border-blue-500" : "border-transparent"}`} 
                  />
                ))}
              </div>
            </div>

            <form onSubmit={updateProduct} className="space-y-4">
              <input className="w-full border p-3 rounded-xl bg-gray-50" value={current.name} onChange={(e) => setCurrent({ ...current, name: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" className="w-full border p-3 rounded-xl bg-gray-50" value={current.price} onChange={(e) => setCurrent({ ...current, price: e.target.value })} required />
                <input type="number" className="w-full border p-3 rounded-xl bg-gray-50" value={current.stock} onChange={(e) => setCurrent({ ...current, stock: e.target.value })} required />
              </div>
              <input className="w-full border p-3 rounded-xl bg-gray-50" value={current.category || ""} onChange={(e) => setCurrent({ ...current, category: e.target.value })} />
              <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg">Actualizar Producto</button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}