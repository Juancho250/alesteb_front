import { useEffect, useState } from "react";
import { Receipt, Eye, X, Package, Calendar, Printer, User, Globe, Store } from "lucide-react";
import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- CÁLCULOS DE IVA (19%) ---
  const IVA_RATE = 0.19;
  const calculateTax = (total) => {
    const totalNum = Number(total) || 0;
    const base = totalNum / (1 + IVA_RATE);
    const iva = totalNum - base;
    return { base, iva };
  };

  const loadSales = async () => {
    try {
      const res = await api.get("/sales");
      // Mapeamos para asegurar que 'total' sea el campo 'total_amount' o 'total' que viene de la DB
      const data = res.data.map(s => ({
        ...s,
        total: s.total || s.total_amount || 0
      }));
      setSales(data);
      localStorage.setItem("sales_cache", JSON.stringify(data));
    } catch (err) {
      const cached = localStorage.getItem("sales_cache");
      if (cached) setSales(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSales(); }, []);

  const viewDetail = async (sale) => {
    try {
      const res = await api.get(`/sales/${sale.id}`);
      setItems(res.data);
      setCurrentSale(sale);
      setOpen(true);
    } catch (err) {
      setItems([]);
      setCurrentSale(sale);
      setOpen(true);
    }
  };

  const closeModal = () => {
    setOpen(false);
    setItems([]);
    setCurrentSale(null);
  };

  const handlePrint = () => window.print();

  return (
    <div className="pb-24 bg-gray-50 min-h-screen font-sans">
      <div className="print:hidden"><Header /></div>

      <div className="p-4 max-w-2xl mx-auto print:hidden">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-slate-800">
          <Receipt className="text-blue-600" size={28} /> Historial de Ventas
        </h2>

        {loading ? (
          <div className="flex justify-center py-10 text-gray-400 italic">Cargando registros...</div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => viewDetail(sale)}
                className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-5 flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sale.sale_type === 'web' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {sale.sale_type === 'web' ? <Globe size={24} /> : <Store size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-slate-800 text-sm">Factura #{sale.id}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${sale.sale_type === 'web' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {sale.sale_type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <User size={14} className="text-gray-400" /> {sale.customer_name || "Cliente General"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(sale.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl text-slate-900">${Number(sale.total).toLocaleString()}</p>
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Completado</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE DETALLE PREMIUM */}
      {open && currentSale && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 md:p-4 print:hidden">
          <div className="bg-white rounded-t-[2.5rem] md:rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl animate-in slide-in-from-bottom duration-300">
            <button onClick={closeModal} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400"><X size={20} /></button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Recibo de Venta</h3>
              <p className="text-gray-400 text-sm">Transacción #{currentSale.id}</p>
            </div>

            <div className="space-y-4 max-h-[25vh] overflow-y-auto mb-6 px-1">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <p className="font-bold text-slate-700 uppercase text-xs">{item.name}</p>
                    <p className="text-gray-400">Cant: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-800">${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-dashed border-gray-200 space-y-3">
              <div className="flex justify-between text-xs text-gray-500 uppercase font-bold tracking-widest">
                <span>Subtotal (Neto)</span>
                <span>${calculateTax(currentSale.total).base.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 uppercase font-bold tracking-widest">
                <span>Impuesto (IVA 19%)</span>
                <span>${calculateTax(currentSale.total).iva.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-lg font-black text-slate-800 uppercase">Total</span>
                <span className="text-3xl font-black text-blue-600">${Number(currentSale.total).toLocaleString()}</span>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button onClick={handlePrint} className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
                  <Printer size={20} /> Imprimir
                </button>
                <button onClick={closeModal} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-colors">Entendido</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FACTURA IMPRESA (Real) */}
      {currentSale && (
        <div className="hidden print:block p-12 bg-white text-black font-serif leading-tight">
          <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black mb-1">ALESTEB STORE</h1>
              <p className="text-xs uppercase font-sans font-bold">Régimen Común - IVA 19%</p>
              <p className="text-sm">Nit: 123.456.789-0</p>
              <p className="text-sm">Medellín, Colombia</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">FACTURA ELECTRÓNICA</h2>
              <p className="text-lg font-mono">N° {currentSale.id.toString().padStart(6, '0')}</p>
              <p className="text-sm">Fecha: {new Date(currentSale.created_at).toLocaleString()}</p>
            </div>
          </div>

          <table className="w-full mb-8 text-sm">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-2">DESCRIPCIÓN</th>
                <th className="py-2 text-center">CANT.</th>
                <th className="py-2 text-right">VALOR UNIT.</th>
                <th className="py-2 text-right">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 font-bold uppercase">{item.name}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">${Number(item.price).toLocaleString()}</td>
                  <td className="py-3 text-right">${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-72 space-y-1.5 border-t-2 border-black pt-4">
              <div className="flex justify-between text-sm">
                <span>SUBTOTAL (Base):</span>
                <span>${calculateTax(currentSale.total).base.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span>IVA (19%):</span>
                <span>${calculateTax(currentSale.total).iva.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-2 border-t">
                <span>TOTAL A PAGAR:</span>
                <span>${Number(currentSale.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-[10px] text-center uppercase font-sans space-y-1">
            <p>Esta factura se asimila en todos sus efectos legales a una letra de cambio</p>
            <p className="font-bold">Gracias por preferir ALESTEB STORE</p>
          </div>
        </div>
      )}

      <div className="print:hidden"><BottomNav /></div>
    </div>
  );
}