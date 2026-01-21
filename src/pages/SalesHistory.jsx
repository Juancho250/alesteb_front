import { useEffect, useState } from "react";
import { 
  Receipt, Eye, X, Package, Calendar, Printer, User, 
  Globe, Store, Search, Filter, ArrowUpDown, ChevronRight,
  Loader2, DollarSign, MapPin, Phone
} from "lucide-react";
import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [items, setItems] = useState([]); // Items de la venta seleccionada
  const [open, setOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  const IVA_RATE = 0.19;

  // Calculos auxiliares
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

  // Lógica de Filtrado (Sin cambios, funciona bien)
  useEffect(() => {
    let result = sales;
    if (searchTerm) {
      result = result.filter(s => 
        s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toString().includes(searchTerm)
      );
    }
    if (filterType !== "all") {
      result = result.filter(s => s.sale_type === filterType);
    }
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
    setCurrentSale(sale); // Seteamos la venta actual inmediatamente
    setItems([]); // Limpiamos items previos
    setOpen(true); // Abrimos modal
    
    try {
      const res = await api.get(`/sales/${sale.id}`);
      setItems(res.data);
    } catch (err) {
      console.error("Error cargando items", err);
      // Opcional: Mostrar error en UI
    }
  };

  const closeModal = () => {
    setOpen(false);
    setTimeout(() => {
        setItems([]);
        setCurrentSale(null);
    }, 200); // Pequeño delay para la animación
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pb-24 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      {/* Ocultamos Header/Nav al imprimir */}
      <div className="print:hidden"><Header /></div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="max-w-5xl mx-auto px-4 pt-6 print:hidden">
        
        {/* Título y Stats */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Ventas</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Gestiona tu historial de transacciones</p>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ingresos Totales</span>
                <span className="text-2xl font-black text-[#0071e3] tracking-tight">
                    ${filteredSales.reduce((acc, s) => acc + Number(s.total), 0).toLocaleString()}
                </span>
            </div>
        </div>

        {/* Filtros Premium */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6 space-y-4 md:space-y-0 md:flex gap-4">
             <div className="flex-1 relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                    type="text" 
                    placeholder="Buscar cliente, ID..." 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all outline-none border-none placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
             </div>
             
             <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                 <select 
                    className="bg-slate-50 hover:bg-white border-none py-3 px-4 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                 >
                    <option value="all">Todo</option>
                    <option value="fisica">Local</option>
                    <option value="web">Web</option>
                 </select>

                 <div className="flex items-center bg-slate-50 rounded-xl px-4 py-3 gap-2 min-w-[140px]">
                    <Calendar size={16} className="text-slate-400" />
                    <input 
                        type="date" 
                        className="bg-transparent text-xs font-bold text-slate-600 outline-none w-full"
                        value={dateFilter.start}
                        onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                    />
                 </div>
             </div>
        </div>

        {/* Lista de Ventas */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-[#0071e3] mb-4" size={32} />
            <p className="text-slate-400 text-sm font-medium">Sincronizando...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Search size={24} />
            </div>
            <p className="text-slate-500 font-bold">Sin resultados</p>
            <button onClick={() => {setSearchTerm(""); setFilterType("all"); setDateFilter({start:"", end:""})}} className="text-[#0071e3] text-sm font-semibold mt-2 hover:underline">
                Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => viewDetail(sale)}
                className="group relative bg-white rounded-2xl p-4 flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-[#0071e3]/10"
              >
                <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                        sale.sale_type === 'web' 
                        ? 'bg-violet-50 text-violet-600 group-hover:bg-violet-100' 
                        : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                    }`}>
                        {sale.sale_type === 'web' ? <Globe size={22} /> : <Store size={22} />}
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="font-bold text-slate-800 text-base">#{sale.id}</h3>
                            <span className="text-xs font-medium text-slate-400 truncate max-w-[150px]">
                                {sale.customer_name || "Cliente General"}
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                            {new Date(sale.created_at).toLocaleDateString()}
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            {new Date(sale.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-black text-lg text-slate-900 tracking-tight">${Number(sale.total).toLocaleString()}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            sale.sale_type === 'web' ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                            {sale.sale_type === 'web' ? 'Online' : 'Local'}
                        </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                        <ChevronRight size={16} />
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- MODAL DETALLE (EN PANTALLA) --- */}
      {open && currentSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 print:hidden">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
            
            {/* Header del Ticket */}
            <div className="bg-slate-50 p-6 text-center border-b border-slate-100 relative">
                <button onClick={closeModal} className="absolute top-5 right-5 p-2 bg-white hover:bg-slate-200 rounded-full text-slate-500 transition-colors shadow-sm">
                    <X size={18} />
                </button>
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-[#0071e3]">
                    <Receipt size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">Recibo de Venta</h2>
                <p className="text-slate-400 font-medium text-sm">Transacción #{currentSale.id}</p>
            </div>

            {/* Lista de Items */}
            <div className="p-6 max-h-[40vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    {items.length === 0 ? (
                         <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-300" /></div>
                    ) : (
                        items.map((item, i) => (
                            <div key={i} className="flex justify-between items-start group">
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                                        {item.quantity}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 leading-tight">{item.name}</p>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">${Number(item.unit_price).toLocaleString()} c/u</p>
                                    </div>
                                </div>
                                <span className="text-sm font-black text-slate-900">
                                    ${(item.unit_price * item.quantity).toLocaleString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Total y Acciones */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Subtotal</span>
                        <span>${calculateTax(currentSale.total).base.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>IVA (19%)</span>
                        <span>${calculateTax(currentSale.total).iva.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-slate-200/50 mt-2">
                        <span className="text-sm font-bold text-slate-800">Total Pagado</span>
                        <span className="text-3xl font-black text-[#0071e3] tracking-tighter">
                            ${Number(currentSale.total).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={closeModal} 
                        className="py-3.5 rounded-xl font-bold text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cerrar
                    </button>
                    <button 
                        onClick={handlePrint} 
                        className="py-3.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Printer size={18} />
                        Imprimir
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FACTURA PARA IMPRIMIR (INVISIBLE EN PANTALLA) --- */}
      <div className="hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:bg-white print:p-0 print:m-0 z-[9999]">
         {currentSale && (
             <div className="w-[80mm] mx-auto font-mono text-black p-4">
                 {/* Cabecera Ticket */}
                 <div className="text-center mb-6 border-b border-black/10 pb-4">
                     <h1 className="text-xl font-black uppercase mb-1">ALESTEB S.A.S</h1>
                     <p className="text-[10px] uppercase">NIT: 900.123.456-7</p>
                     <p className="text-[10px] mb-2">Calle 123 #45-67, Ciudad</p>
                     <div className="flex flex-col items-center text-[10px] mt-2">
                        <span>Tel: (604) 123 4567</span>
                        <span>Fecha: {new Date().toLocaleString()}</span>
                     </div>
                 </div>

                 {/* Info Factura */}
                 <div className="flex justify-between text-[10px] font-bold uppercase mb-4">
                     <span>Factura: #{currentSale.id}</span>
                     <span>Tipo: {currentSale.sale_type}</span>
                 </div>
                 <div className="text-[10px] font-bold uppercase mb-4 border-b border-black pb-2">
                     Cliente: {currentSale.customer_name || "Consumidor Final"}
                 </div>

                 {/* Tabla Items */}
                 <div className="mb-4">
                     <div className="flex text-[9px] font-bold border-b border-black pb-1 mb-2">
                         <span className="w-8">CANT</span>
                         <span className="flex-1">DESC</span>
                         <span className="w-16 text-right">TOTAL</span>
                     </div>
                     {items.map((item, i) => (
                         <div key={i} className="flex text-[10px] mb-1">
                             <span className="w-8">{item.quantity}</span>
                             <span className="flex-1 truncate">{item.name}</span>
                             <span className="w-16 text-right">${(item.unit_price * item.quantity).toLocaleString()}</span>
                         </div>
                     ))}
                 </div>

                 {/* Totales */}
                 <div className="border-t border-black pt-2 space-y-1 mb-6">
                     <div className="flex justify-between text-[10px]">
                         <span>Base:</span>
                         <span>${calculateTax(currentSale.total).base.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                     </div>
                     <div className="flex justify-between text-[10px]">
                         <span>IVA:</span>
                         <span>${calculateTax(currentSale.total).iva.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                     </div>
                     <div className="flex justify-between text-sm font-black mt-2">
                         <span>TOTAL:</span>
                         <span>${Number(currentSale.total).toLocaleString()}</span>
                     </div>
                 </div>

                 {/* Footer */}
                 <div className="text-center text-[9px] uppercase mt-8">
                     <p>*** Gracias por su compra ***</p>
                     <p className="mt-1">Sistema POS v2.0</p>
                     <div className="mt-4 border-t border-dashed border-black pt-2">
                        Representación gráfica de factura
                     </div>
                 </div>
             </div>
         )}
      </div>

      <div className="print:hidden"><BottomNav /></div>
    </div>
  );
}