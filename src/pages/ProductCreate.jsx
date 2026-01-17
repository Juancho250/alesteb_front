import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";

export default function ProductCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    cost: "",
    stock: "",
    min_stock: 5,
    category: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    await api.post("/products", {
      ...form,
      price: Number(form.price),
      cost: Number(form.cost),
      stock: Number(form.stock),
      min_stock: Number(form.min_stock),
    });

    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="p-4">
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl shadow p-5 space-y-4"
        >
          <h2 className="text-lg font-bold">
            Registrar producto
          </h2>

          <input
            name="name"
            placeholder="Nombre"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
            required
          />

          <input
            name="category"
            placeholder="Categoría (ej: Bebidas)"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          <input
            name="price"
            type="number"
            placeholder="Precio de venta"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
            required
          />

          <input
            name="cost"
            type="number"
            placeholder="Costo (opcional)"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          <input
            name="stock"
            type="number"
            placeholder="Stock inicial"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
            required
          />

          <input
            name="min_stock"
            type="number"
            placeholder="Stock mínimo"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="w-1/2 border py-3 rounded-xl"
            >
              Cancelar
            </button>

            <button
              className="w-1/2 bg-blue-600 text-white py-3 rounded-xl"
            >
              Guardar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
