import { useEffect, useState } from "react";
import { Receipt, Eye, X } from "lucide-react";
import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);

  useEffect(() => {
    api.get("/sales").then((res) => setSales(res.data));
  }, []);

  const viewDetail = async (sale) => {
    const res = await api.get(`/sales/${sale.id}`);
    setItems(res.data);
    setCurrentSale(sale);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setItems([]);
    setCurrentSale(null);
  };

  return (
    <div className="pb-16 bg-gray-50 min-h-screen">
      <Header />

      <div className="p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Receipt size={20} /> Historial de ventas
        </h2>

        <div className="space-y-3">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">Venta #{sale.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(sale.created_at).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">
                  ${Number(sale.total).toFixed(2)}
                </p>

                <button
                  onClick={() => viewDetail(sale)}
                  className="mt-2 text-blue-600 flex items-center gap-1 text-sm"
                >
                  <Eye size={16} /> Ver
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {open && currentSale && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold mb-1">
              Venta #{currentSale.id}
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              {new Date(currentSale.created_at).toLocaleString()}
            </p>

            <div className="space-y-2 text-sm">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t text-right font-bold">
              Total: ${Number(currentSale.total).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
