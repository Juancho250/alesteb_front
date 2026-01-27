import { 
  Plus, Trash2, Eye, X, Upload, 
  Package, ShoppingBag, AlertCircle, Search,
  Save, Edit2, CheckCircle2 // <--- Agregado CheckCircle2
} from "lucide-react";
import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLoading } from "../context/LoadingContext";
import Toast from "../components/Toast"; 
import ConfirmModal from "../components/ConfirmModal";

// --- NUEVO COMPONENTE DE DETALLE/EDICIÓN ---
function ProductDetailModal({ openDetail, current, setOpenDetail, categories, refreshProducts, showNotice }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    category_name: ''
  });

  const [existingImages, setExistingImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagesPreview, setNewImagesPreview] = useState([]);

  useEffect(() => {
    if (current) {
      setFormData({
        name: current.name,
        description: current.description || '',
        price: current.price,
        stock: current.stock,
        category_id: current.category_id || '',
        category_name: current.category_name || ''
      });
      setExistingImages(current.images || []);
      setDeletedImageIds([]);
      setNewImages([]);
      setNewImagesPreview([]);
      setIsEditing(false);
    }
  }, [current]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewImagesPreview([...newImagesPreview, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    const updatedFiles = [...newImages];
    updatedFiles.splice(index, 1);
    setNewImages(updatedFiles);
    const updatedPreviews = [...newImagesPreview];
    updatedPreviews.splice(index, 1);
    setNewImagesPreview(updatedPreviews);
  };

  const markImageForDeletion = (imgId) => {
    const remainingExisting = existingImages.length - deletedImageIds.length - 1;
    const totalRemaining = remainingExisting + newImages.length;

    if (totalRemaining < 1) {
      showNotice("El producto debe tener al menos una imagen.", "error"); // <--- Ahora sí existe
      return;
    }
    setDeletedImageIds([...deletedImageIds, imgId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('category_id', formData.category_id);
      
      if (deletedImageIds.length > 0) {
        data.append('deleted_image_ids', JSON.stringify(deletedImageIds));
      }

      newImages.forEach((file) => {
        data.append('images', file);
      });

      await api.put(`/products/${current.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showNotice("Producto actualizado correctamente", "success"); // Aviso de éxito
      setOpenDetail(false);
      if (refreshProducts) refreshProducts();
    } catch (error) {
      console.error(error);
      showNotice("Error al actualizar el producto", "error"); // Aviso de error
    } finally {
      setLoading(false);
    }
  };

  if (!openDetail || !current) return null;

  const visibleExistingImages = existingImages.filter(img => !deletedImageIds.includes(img.id));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl animate-in fade-in duration-300 custom-scrollbar">
        
        <button onClick={() => setOpenDetail(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 z-10 transition-colors">
            <X size={20} />
        </button>

        <div className="flex justify-between items-center mb-6 pr-10">
            <h3 className="text-2xl font-black text-slate-800">
                {isEditing ? "Editar Producto" : "Detalles"}
            </h3>
            {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                    <Edit2 size={16} /> Editar
                </button>
            )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="relative group w-full h-64 bg-slate-100 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner">
                    <img 
                        src={visibleExistingImages[0]?.url || newImagesPreview[0] || current.main_image} 
                        className="w-full h-full object-cover" 
                        alt="Main"
                    />
                </div>

                {isEditing && (
                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-3">Gestión de Fotos</p>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                            {visibleExistingImages.map((img) => (
                                <div key={img.id} className="relative flex-shrink-0 w-20 h-20 group">
                                    <img src={img.url} className="w-full h-full object-cover rounded-xl border border-slate-200" />
                                    <button type="button" onClick={() => markImageForDeletion(img.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-transform hover:scale-110">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {newImagesPreview.map((src, i) => (
                                <div key={`new-${i}`} className="relative flex-shrink-0 w-20 h-20">
                                    <img src={src} className="w-full h-full object-cover rounded-xl border-2 border-blue-200 opacity-90" />
                                    <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 shadow-md hover:bg-blue-600">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <label className="flex-shrink-0 w-20 h-20 flex flex-col items-center justify-center border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all text-slate-400 hover:text-blue-500">
                                <Upload size={20} />
                                <span className="text-[10px] font-bold mt-1">Agregar</span>
                                <input type="file" multiple accept="image/*" onChange={handleNewImages} className="hidden" />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Nombre</label>
                    {isEditing ? (
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-100 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" required />
                    ) : (
                        <div className="w-full p-4 font-bold text-slate-800 text-lg">{formData.name}</div>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Descripción</label>
                    {isEditing ? (
                        <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full bg-slate-100 p-4 rounded-2xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    ) : (
                        <div className="w-full p-4 font-medium text-slate-600 bg-slate-50/50 rounded-2xl">{formData.description || "Sin descripción"}</div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Precio ($)</label>
                        {isEditing ? (
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-slate-100 p-4 rounded-2xl font-black text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500" required />
                        ) : (
                            <div className="w-full p-4 font-black text-emerald-600 text-xl">${formData.price}</div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Stock</label>
                        {isEditing ? (
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-slate-100 p-4 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" required />
                        ) : (
                            <div className="w-full p-4 font-black text-slate-800 text-xl">{formData.stock} u.</div>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Categoría</label>
                    {isEditing ? (
                        <div className="relative">
                            <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-slate-100 p-4 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                                <option value="">Seleccionar...</option>
                                {categories && categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.full_path || cat.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    ) : (
                        <div className="w-full p-4 font-medium text-slate-800 bg-slate-50 rounded-2xl">{formData.category_name || "Sin categoría"}</div>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? "Guardando..." : <><Save size={20} /> Guardar Cambios</>}
                    </button>
                </div>
            )}
        </form>
      </div>
    </div>
  );
}

// --- MODAL CREAR (Lo dejamos igual) ---
function CreateProductModal({ isOpen, onClose, onCreated, categories, showNotice }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category_id: "",
    description: ""
  });
  // NOTA: Ahora las categorías vienen por props para no hacer doble llamada,
  // pero mantendré tu lógica original si prefieres, aunque ajustada abajo.
  // Para simplificar, usaremos las props si vienen, o el estado local si no.
  // En este código completo, las pasaré desde el padre (Products).
  
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
    if (!form.category_id) {
      return showNotice("Por favor selecciona una categoría", "error"); // <--- Ahora funcionará
    }
    
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("price", form.price);
      data.append("description", form.description);
      data.append("stock", form.stock);
      data.append("category_id", form.category_id);
      images.forEach((img) => data.append("images", img));

      await api.post("/products", data);
      
      showNotice("Producto creado con éxito", "success"); // Aviso de éxito
      onCreated();
      onClose();
      setForm({ name: "", price: "", stock: "", category_id: "", description: "" });
      setPreview([]);
      setImages([]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error al guardar producto";
      showNotice(errorMsg, "error"); // Aviso de error
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">Descripción</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe el producto..."
                className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                onChange={handleChange}
              />
            </div>

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
  const { startLoading, stopLoading } = useLoading();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // <--- AGREGADO: Categorías en el padre
  const [searchTerm, setSearchTerm] = useState("");
  const [openDetail, setOpenDetail] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [current, setCurrent] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirm, setConfirm] = useState({ show: false, id: null });
  const showNotice = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const loadProducts = async () => {
    startLoading();
    try {
      // Cargamos productos y categorías en paralelo
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories/flat")
      ]);

      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      
      localStorage.setItem("products_cache", JSON.stringify(productsRes.data));
    } catch (err) {
      console.error(err);
      const cached = localStorage.getItem("products_cache");
      if (cached) setProducts(JSON.parse(cached));
    }
    finally {
      setTimeout(stopLoading, 800);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 1. Reemplazo del confirm() tradicional
  const handleDeleteClick = (id) => {
    setConfirm({ show: true, id });
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/products/${confirm.id}`);
      showNotice("Producto eliminado correctamente"); // Toast de éxito
      loadProducts();
    } catch (err) {
      showNotice("No se pudo eliminar el producto", "error"); // Toast de error
    } finally {
      setConfirm({ show: false, id: null });
    }
  };

  // 2. Reemplazo del alert en carga de detalles
  const openPreview = async (product) => {
    try {
      const res = await api.get(`/products/${product.id}`);
      const mainImage = res.data.images?.find((img) => img.is_main)?.url || product.main_image;
      setCurrent({ ...res.data, main_image: mainImage });
      setOpenDetail(true);
    } catch (err) {
      showNotice("Error al obtener los detalles", "error");
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
            const hasDiscount = Number(p.final_price) > 0 && Number(p.final_price) < Number(p.price);

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
                  <button onClick={() => handleDeleteClick(p.id)} className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm">
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
        categories={categories}
        showNotice={showNotice} // <--- Agregamos esto
      />

      <ProductDetailModal
        openDetail={openDetail}
        current={current}
        setOpenDetail={setOpenDetail}
        refreshProducts={loadProducts}
        categories={categories}
        showNotice={showNotice} // <--- Agregamos esto
      />
      
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* El ConfirmModal no suele necesitar showNotice directamente 
          porque la lógica de éxito/error la maneja el padre en executeDelete,
          lo cual ya tienes bien configurado. */}
      <ConfirmModal 
        isOpen={confirm.show}
        title="¿Estás seguro?"
        message="Esta acción eliminará el producto de forma permanente."
        onConfirm={executeDelete}
        onClose={() => setConfirm({ show: false, id: null })}
      />

      <BottomNav />
    </div>
  );
}