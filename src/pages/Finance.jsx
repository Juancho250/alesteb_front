import { useEffect, useState } from "react";
import {
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
  X
} from "lucide-react";

import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function Finance() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalVentas: 0,
    totalGastos: 0,
    totalCompras: 0,
    rentabilidad: 0
    });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "gasto",
    category: "",
    description: "",
    amount: ""
  });

  useEffect(() => {
    loadFinance();
  }, []);

    const loadFinance = async () => {
    try {
        const [expRes, sumRes, salesRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/expenses/summary"),
        api.get("/sales")
        ]);

        const ventas = (salesRes.data || []).reduce(
        (sum, s) => sum + Number(s.total || 0),
        0
        );

        const totalGastos = Number(sumRes.data?.totalGastos || 0);
        const totalCompras = Number(sumRes.data?.totalCompras || 0);

        setExpenses(expRes.data || []);
        setSummary({
        totalVentas: ventas,
        totalGastos,
        totalCompras,
        rentabilidad: ventas - totalGastos
        });

    } catch (error) {
        console.error("Error cargando finanzas:", error);
    }
    };



  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/expenses", {
      ...form,
      amount: Number(form.amount)
    });
    setForm({ type: "gasto", category: "", description: "", amount: "" });
    setOpen(false);
    loadFinance();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header />

      <main className="max-w-4xl mx-auto p-6 space-y-8">

        {/* RESUMEN */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card
                title="Ventas"
                value={`$${summary.totalVentas.toLocaleString()}`}
                icon={<TrendingUp className="text-emerald-600" />}
            />

            <Card
                title="Gastos"
                value={`$${summary.totalGastos.toLocaleString()}`}
                icon={<TrendingDown className="text-red-500" />}
            />

            <Card
                title="Compras"
                value={`$${summary.totalCompras.toLocaleString()}`}
                icon={<Wallet className="text-amber-500" />}
            />

            <Card
                title="Rentabilidad"
                value={`$${summary.rentabilidad.toLocaleString()}`}
                icon={
                summary.rentabilidad >= 0
                    ? <TrendingUp className="text-green-600" />
                    : <TrendingDown className="text-red-600" />
                }
            />
        </div>


        {/* BOTÓN NUEVO MOVIMIENTO */}
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
        >
          <PlusCircle /> Registrar movimiento
        </button>

        {/* HISTORIAL */}
        <div className="bg-white rounded-2xl p-6 border">
          <h3 className="font-bold mb-4">Historial</h3>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {expenses.map((e) => (
              <div
                key={e.id}
                className="flex justify-between items-center text-sm"
              >
                <div>
                  <p className="font-semibold">{e.category}</p>
                  <p className="text-gray-400">{e.description}</p>
                </div>
                <span
                  className={`font-bold ${
                    e.type === "gasto" ? "text-red-500" : "text-amber-600"
                  }`}
                >
                  -${Number(e.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500"
            >
              <X size={18} />
            </button>

            <h3 className="font-black text-xl mb-6 flex items-center gap-2">
              <Wallet /> Nuevo movimiento
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded-xl p-3"
              >
                <option value="gasto">Gasto</option>
                <option value="compra">Compra</option>
              </select>

              <input
                placeholder="Categoría"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-xl p-3"
                required
              />

              <input
                placeholder="Descripción"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-xl p-3"
              />

              <input
                type="number"
                placeholder="Monto"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border rounded-xl p-3"
                required
              />

              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
                Guardar movimiento
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

/* ===== CARD ===== */
function Card({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl p-5 border flex items-center gap-4">
      <div className="p-3 bg-slate-100 rounded-xl">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-xl font-black">{value}</p>
      </div>
    </div>
  );
}
