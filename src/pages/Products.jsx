import { useEffect, useState } from "react";
import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const loadProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  const createProduct = async (e) => {
    e.preventDefault();
    await api.post("/products", {
      name,
      price: Number(price),
      stock: Number(stock),
    });
    setName("");
    setPrice("");
    setStock("");
    loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="pb-16">
      <Header />

      <main className="p-4 space-y-6">
        {/* FORM */}
        <form
          onSubmit={createProduct}
          className="bg-white rounded-2xl shadow p-4 space-y-3"
        >
          <h2 className="font-semibold text-lg">Nuevo producto</h2>

          <input
            className="w-full border p-3 rounded-xl"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="w-full border p-3 rounded-xl"
            placeholder="Precio"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <input
            className="w-full border p-3 rounded-xl"
            placeholder="Stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-3 rounded-xl">
            Guardar
          </button>
        </form>

        {/* LIST */}
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">
                  ${p.price} · Stock: {p.stock}
                </p>
              </div>

              <button
                onClick={() => deleteProduct(p.id)}
                className="text-red-500 text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
