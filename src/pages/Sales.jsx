import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  History,
} from "lucide-react";

import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/products").then((res) => setProducts(res.data));
  }, []);

  const addToCart = (product) => {
    const exists = cart.find((p) => p.id === product.id);

    if (exists) {
      setCart(
        cart.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(
      cart
        .map((p) =>
          p.id === id
            ? { ...p, quantity: p.quantity + delta }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const total = cart.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  const checkout = async () => {
    if (cart.length === 0) return;

    await api.post("/sales", {
      items: cart,
      total,
    });

    alert("✅ Venta registrada");
    setCart([]);
  };

  return (
    <div className="pb-16 bg-gray-50 min-h-screen">
      <Header />

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PRODUCTOS */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold mb-3">
            Productos
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="p-4 border rounded-xl text-left bg-white hover:bg-blue-50 transition"
              >
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-500">
                  ${p.price}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* CARRITO */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col">
          {/* HEADER CARRITO */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 font-bold">
              <ShoppingCart size={20} />
              Carrito
            </h2>

            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <History size={16} />
              Historial
            </button>
          </div>

          {cart.length === 0 && (
            <p className="text-sm text-gray-400">
              Carrito vacío
            </p>
          )}

          <div className="flex-1">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center mb-2"
              >
                <span className="text-sm font-medium">
                  {item.name}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQty(item.id, -1)
                    }
                  >
                    <Minus size={16} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQty(item.id, 1)
                    }
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    onClick={() =>
                      updateQty(
                        item.id,
                        -item.quantity
                      )
                    }
                  >
                    <Trash2
                      size={16}
                      className="text-red-500"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-3" />

          <p className="font-bold text-lg">
            Total: ${total.toFixed(2)}
          </p>

          <button
            onClick={checkout}
            disabled={cart.length === 0}
            className="mt-4 w-full bg-blue-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition"
          >
            Confirmar Venta
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
