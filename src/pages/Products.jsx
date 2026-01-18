import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Eye, // Cambiamos Pencil por Eye
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const navigate = useNavigate();

  const loadProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  };

  const openPreview = async (product) => {
    try {
      const res = await api.get(`/products/${product.id}`);
      setCurrent({
        ...res.data,
        main_image:
          res.data.images?.find((img) => img.is_main)?.url ||
          product.main_image,
      });
      setOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setOpen(false);
    setCurrent(null);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    await api.put(`/products/${current.id}`, {
      name: current.name,
      price: Number(current.price),
      stock: Number(current.stock),
      category: current.category,
    });
    closeModal();
    loadProducts();
  };

  return (
    <div className="pb-16 bg-gray-50 min-h-screen">
      <Header />

      <main className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Productos</h2>
          <button
            onClick={() => navigate("/products/new")}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>

        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {p.main_image && (
                  <img
                    src={p.main_image}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>
                  <p className="text-sm text-gray-500">
                    ${p.price} · Stock: {p.stock}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* BOTÓN OJO (VISTA PREVIA + EDITAR) */}
                <button
                  onClick={() => openPreview(p)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Vista previa y editar"
                >
                  <Eye size={20} />
                </button>

                <button
                  onClick={() => deleteProduct(p.id)}
                  className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL VISTA PREVIA Y EDICIÓN */}
      {/* MODAL VISTA PREVIA Y EDICIÓN */}
{open && current && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
      
      {/* Botón Cerrar */}
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 z-10"
      >
        <X size={20} />
      </button>

      <h3 className="text-xl font-bold mb-6">Detalles del Producto</h3>

      {/* SECCIÓN DE GALERÍA COMPLETA */}
      {/* GALERÍA */}
      <div className="mb-8">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
          Galería de imágenes
        </p>

        {/* Imagen principal */}
        <div className="w-full h-64 mb-3">
          <img
            src={current.main_image}
            className="w-full h-full object-cover rounded-2xl shadow border"
            alt="Vista principal"
          />
        </div>

        {/* Miniaturas */}
        <div className="flex gap-2 overflow-x-auto">
          {current.images?.map((img) => (
            <img
              key={img.id}
              src={img.url}
              onClick={() =>
                setCurrent({ ...current, main_image: img.url })
              }
              className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer transition
                ${
                  current.main_image === img.url
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
            />
          ))}
        </div>
      </div>


      {/* FORMULARIO DE EDICIÓN */}
      <form onSubmit={updateProduct} className="space-y-4">
        <div className="group">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre del Producto</label>
          <input
            className="w-full border-gray-200 border p-3 mt-1 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
            value={current.name}
            onChange={(e) => setCurrent({ ...current, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Precio ($)</label>
            <input
              type="number"
              className="w-full border-gray-200 border p-3 mt-1 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
              value={current.price}
              onChange={(e) => setCurrent({ ...current, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Stock</label>
            <input
              type="number"
              className="w-full border-gray-200 border p-3 mt-1 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
              value={current.stock}
              onChange={(e) => setCurrent({ ...current, stock: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Categoría</label>
          <input
            className="w-full border-gray-200 border p-3 mt-1 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
            value={current.category || ""}
            onChange={(e) => setCurrent({ ...current, category: e.target.value })}
          />
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] mt-4">
          Actualizar Producto
        </button>
      </form>
    </div>
  </div>
)}

      <BottomNav />
    </div>
  );
}