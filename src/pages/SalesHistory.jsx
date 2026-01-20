import { useEffect, useState } from "react";
import { 
  Receipt, Eye, X, Package, Calendar, Printer, User, 
  Globe, Store, Search, Filter, ArrowUpDown, ChevronRight,
  Loader2 // <--- AGREGA ESTO
} from "lucide-react";
import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

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
      const data = res.data.map(s => ({
        ...s,
        total: s.total || s.total_amount || 0
      }));
      setSales(data);
      setFilteredSales(data);
      localStorage.setItem("sales_cache", JSON.stringify(data));
    } catch (err) {
      const cached = localStorage.getItem("sales_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        setSales(parsed);
        setFilteredSales(parsed);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSales(); }, []);

  // Lógica de Filtrado
  useEffect(() => {
    let result = sales;

    // Filtro por texto (Nombre cliente o ID factura)
    if (searchTerm) {
      result = result.filter(s => 
        s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toString().includes(searchTerm)
      );
    }

    // Filtro por tipo
    if (filterType !== "all") {
      result = result.filter(s => s.sale_type === filterType);
    }

    // Filtro por fecha
    if (dateFilter.start) {
      result = result.filter(s => new Date(s.created_at) >= new Date(dateFilter.start));
    }
    if (dateFilter.end) {
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59);
      result = result.filter(s => new Date(s.created_at) <= endDate);
    }

    setFilteredSales(result);
  }, [searchTerm, filterType, dateFilter, sales]);

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

  return (
    <div className="pb-24 bg-slate-50 min-h-screen font-sans">
      <div className="print:hidden"><Header /></div>

      <main className="p-4 max-w-4xl mx-auto print:hidden">
        {/* Cabecera y Filtros */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Receipt className="text-blue-600" size={24} /> Historial de Caja
            </h2>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total:</span>
               <span className="text-sm font-black text-blue-600">${filteredSales.reduce((acc, s) => acc + Number(s.total), 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Barra de Búsqueda y Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por cliente o factura..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos los canales</option>
              <option value="fisica">Venta Local</option>
              <option value="web">Venta Online</option>
            </select>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1">
              <Calendar size={14} className="text-slate-400 ml-1" />
              <input 
                type="date" 
                className="text-xs font-bold text-slate-600 outline-none bg-transparent w-full"
                value={dateFilter.start}
                onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-2" />
            <p className="text-sm italic font-medium">Sincronizando registros...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-bold">No se encontraron ventas con esos filtros</p>
            <button onClick={() => {setSearchTerm(""); setFilterType("all"); setDateFilter({start:"", end:""})}} className="text-blue-500 text-xs mt-2 underline">Limpiar filtros</button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => viewDetail(sale)}
                className="bg-white rounded-2xl border border-slate-100 p-4 flex justify-between items-center hover:border-blue-300 hover:shadow-lg hover:shadow-slate-100 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sale.sale_type === 'web' ? 'bg-indigo-50 text-indigo-500' : 'bg-blue-50 text-blue-500'}`}>
                    {sale.sale_type === 'web' ? <Globe size={20} /> : <Store size={20} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm truncate">Fac. #{sale.id}</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-black uppercase tracking-tighter">
                        {sale.sale_type === 'web' ? 'ONLINE' : 'LOCAL'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 truncate font-medium">
                      {sale.customer_name || "Consumidor Final"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(sale.created_at).toLocaleDateString()} · {new Date(sale.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-base text-slate-900 leading-none">${Number(sale.total).toLocaleString()}</p>
                    <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Éxito</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DETALLE (Igual pero ajustando un poco los paddings) */}
      {open && currentSale && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X size={18} /></button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Receipt size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Detalle de Venta</h3>
              <p className="text-slate-400 text-xs font-bold">Ticket #{currentSale.id}</p>
            </div>

            <div className="space-y-3 max-h-[30vh] overflow-y-auto mb-5 px-1 border-y border-slate-50 py-4 custom-scrollbar">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-xs">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-slate-700 leading-tight uppercase">{item.name}</p>
                    <p className="text-slate-400 font-medium">x{item.quantity} - ${Number(item.unit_price).toLocaleString()}</p>
                  </div>
                  <span className="font-black text-slate-800">${(item.unit_price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                <span>Base IVA</span>
                <span>${calculateTax(currentSale.total).base.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-800 uppercase">Total Cobrado</span>
                <span className="text-2xl font-black text-blue-600">${Number(currentSale.total).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                <Printer size={16} /> Ticket
              </button>
              <button onClick={closeModal} className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs shadow-lg transition-all">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Mantenemos tu componente de Factura Impresa igual */}
      <div className="print:hidden"><BottomNav /></div>
    </div>
  );
}