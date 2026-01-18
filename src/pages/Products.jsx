import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
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

  const openEdit = (product) => {
    setCurrent(product);
    setOpen(true);
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
        {/* HEADER */}
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

        {/* LISTADO */}
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
            >
              <div>
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />
                <p className="text-sm text-gray-500">
                  ${p.price} · Stock: {p.stock}
                </p>
                {p.category && (
                  <p className="text-xs text-gray-400">
                    Categoría: {p.category}
                  </p>
                )}
              </div>

              {/* ACCIONES */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openEdit(p)}
                  className="text-blue-600"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => deleteProduct(p.id)}
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL EDIT */}
      {open && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold mb-4">
              Editar producto
            </h3>

            <form
              onSubmit={updateProduct}
              className="space-y-3"
            >
              <input
                className="w-full border p-3 rounded-xl"
                placeholder="Nombre"
                value={current.name}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                className="w-full border p-3 rounded-xl"
                placeholder="Precio"
                value={current.price}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    price: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                className="w-full border p-3 rounded-xl"
                placeholder="Stock"
                value={current.stock}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    stock: e.target.value,
                  })
                }
                required
              />

              <input
                className="w-full border p-3 rounded-xl"
                placeholder="Categoría (opcional)"
                value={current.category || ""}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    category: e.target.value,
                  })
                }
              />

              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">
                Guardar cambios
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
