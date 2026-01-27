import React, { useState, useEffect } from "react";
import { Plus, Trash2, FolderTree, X, Loader2, Edit3, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../../context/AuthContext"; 
import { useLoading } from "../../context/LoadingContext";

const Categories = () => {
  const { user } = useAuth();
  const permissions = user?.permissions || []; // Obtener permisos del usuario
  const { startLoading, stopLoading } = useLoading();
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    parent_id: "",
    description: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    startLoading();
    setLoading(true);
    try {
      const [treeRes, flatRes] = await Promise.all([
        api.get("/categories").catch(() => ({ data: [] })),
        api.get("/categories/flat").catch(() => ({ data: [] }))
      ]);
      setCategories(Array.isArray(treeRes.data) ? treeRes.data : []);
      setFlatCategories(Array.isArray(flatRes.data) ? flatRes.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setTimeout(stopLoading, 800);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ name: "", parent_id: "", description: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    startLoading();
    e.preventDefault();
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success("Categoría actualizada");
      } else {
        await api.post("/categories", form);
        toast.success("Categoría creada");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar");
    }
    finally {
      setTimeout(stopLoading, 800);
    }
  };

  const handleDelete = async (id) => {
    startLoading();
    if (!window.confirm("¿Estás seguro? Se eliminarán también las subcategorías.")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Eliminada correctamente");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo eliminar");
    }
    finally {
      setTimeout(stopLoading, 800);
    }
  };

  // Renderizado recursivo con estilo moderno
  const renderTree = (nodes) => (
    <div className="space-y-3 mt-3">
      {nodes.map((node) => (
        <div key={node.id} className="ml-4 border-l-2 border-slate-100 pl-4">
          <div className="group bg-white border border-slate-200/60 rounded-2xl p-4 flex justify-between items-center hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${node.parent_id ? 'bg-blue-50 text-blue-500' : 'bg-slate-900 text-white'}`}>
                <FolderTree size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-800 tracking-tight">{node.name}</span>
                {node.slug && <p className="text-[10px] text-slate-400 font-mono">/{node.slug}</p>}
              </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Verificar permiso de eliminación */}
              {permissions.includes('category.delete') && (
                <button 
                  onClick={() => handleDelete(node.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          {node.children && node.children.length > 0 && renderTree(node.children)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="pb-32 bg-[#F8FAFC] min-h-screen font-sans text-slate-900 antialiased">
      <Header />

      <main className="max-w-2xl mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Categorías</h2>
            <p className="text-slate-500 mt-1 font-medium">Organiza tu catálogo de productos</p>
          </div>
          
          {/* Verificar permiso de creación de categorías */}
          {permissions.includes('category.create') && (
            <button 
              onClick={handleOpenCreate} 
              className="group flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold text-sm">Añadir</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0"></div>
            </div>
            <p className="text-slate-400 font-medium animate-pulse">Cargando jerarquía...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderTree className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Sin categorías</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">Crea estructuras para que tus clientes encuentren productos más rápido.</p>
          </div>
        ) : (
          <div className="-ml-4">
            {renderTree(categories)}
          </div>
        )}
      </main>

      {/* Modal Premium para Categorías */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                <p className="text-slate-500 text-sm">Define el nombre y la posición en el árbol</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nombre de categoría</label>
                <input 
                  placeholder="Ej: Laptops Pro"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Categoría Superior</label>
                <div className="relative">
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none appearance-none font-medium cursor-pointer text-slate-600"
                    value={form.parent_id}
                    onChange={e => setForm({...form, parent_id: e.target.value})}
                  >
                    <option value="">-- Es una categoría Principal --</option>
                    {flatCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {"— ".repeat(cat.level || 0)} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Descripción (Opcional)</label>
                <textarea 
                  rows="3"
                  placeholder="Describe brevemente el contenido..."
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium resize-none" 
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>

              <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-blue-600 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] mt-4 flex items-center justify-center gap-2">
                {editingId ? 'Actualizar' : 'Crear Categoría'}
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Categories;
