import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";

export default function ProductCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    const data = new FormData();
      data.append("name", form.name);
      data.append("price", form.price);
      data.append("stock", form.stock);
      data.append("category", form.category);

      images.forEach((img) => {
        data.append("images", img);
      });

      await api.post("/products", data);


    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="p-4 max-w-xl mx-auto">
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl shadow p-5 space-y-4"
        >
          <h2 className="text-lg font-bold">Registrar producto</h2>

          <input
            name="name"
            placeholder="Nombre"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
            required
          />

          <input
            name="category"
            placeholder="Categoría"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          <input
            name="price"
            type="number"
            placeholder="Precio"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
            required
          />

          <input
            name="stock"
            type="number"
            placeholder="Stock"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
            required
          />

          {/* IMAGEN */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages([...e.target.files])}
          />



          <button className="w-full bg-blue-600 text-white py-3 rounded-xl">
            Guardar producto
          </button>
        </form>
      </main>
    </div>
  );
}
