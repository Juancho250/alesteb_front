import { useEffect, useState } from "react";
import {
  PlusCircle, TrendingDown, TrendingUp, Wallet, X,
  PieChart as PieChartIcon, Activity, Upload
} from "lucide-react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart,
  Bar, CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";

import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'];

export default function Finance() {
  const [products, setProducts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productPreview, setProductPreview] = useState([]);
  const [productImages, setProductImages] = useState([]);

  const [summary, setSummary] = useState({
    totalVentas: 0, totalGastos: 0, totalCompras: 0, rentabilidad: 0
  });

  const [form, setForm] = useState({
    type: "gasto",
    category: "",
    description: "",
    amount: "",
    product_id: "",
    quantity: 1,
    newName: "",
    newPrice: "",
    newCategory: ""
  });

  useEffect(() => {
    loadFinance();
    api.get("/products").then(res => setProducts(res.data)).catch(err => console.error("Error productos", err));
  }, []);

  const loadFinance = async () => {
    try {
      const [expRes, sumRes, salesRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/expenses/summary"),
        api.get("/sales")
      ]);
      const salesArr = salesRes.data || [];
      const expensesArr = expRes.data || [];
      const ventas = salesArr.reduce((sum, s) => sum + Number(s.total || 0), 0);
      const totalGastos = Number(sumRes.data?.totalGastos || 0);
      const totalCompras = Number(sumRes.data?.totalCompras || 0);

      setExpenses(expensesArr);
      setSummary({
        totalVentas: ventas,
        totalGastos,
        totalCompras,
        rentabilidad: ventas - totalGastos
      });

      const catMap = {};
      expensesArr.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
      });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      setComparisonData([
        { name: 'Ingresos', monto: ventas, fill: '#10b981' },
        { name: 'Egresos', monto: totalGastos + totalCompras, fill: '#ef4444' }
      ]);
    } catch (error) {
      console.error("Error cargando finanzas:", error);
    }
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setProductImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setProductPreview((prev) => [...prev, ...previews]);
  };

  const resetForm = () => {
  setIsNewProduct(false);
  setProductPreview([]);
  setProductImages([]);
  setForm({ 
    type: "gasto", 
    category: "", 
    description: "", 
    amount: "", 
    product_id: "", 
    quantity: 1, 
    newName: "", 
    newPrice: "", 
    newCategory: "" 
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    let finalProductId = form.product_id;

    // 1. SI ES UNA COMPRA DE UN PRODUCTO NUEVO
    if (form.type === "compra" && isNewProduct) {
      const formData = new FormData();
      formData.append("name", form.newName);
      formData.append("price", form.newPrice);
      formData.append("stock", form.quantity);
      formData.append("category", form.newCategory || "General");

      // USAR EL NOMBRE CORRECTO: productImages
      if (productImages && productImages.length > 0) {
        productImages.forEach((file) => {
          formData.append("images", file);
        });
      }

      console.log("Enviando producto a:", "/products");
      
      // ✅ SIN HEADERS MANUALES: Axios pondrá el Token y el Content-Type solo
      const prodRes = await api.post("/products", formData);
      finalProductId = prodRes.data.id;
    }

    // 2. REGISTRAR EL MOVIMIENTO FINANCIERO
    const expenseData = {
      type: form.type, 
      category: isNewProduct ? `Compra: ${form.newName}` : (form.category || "Compra"),
      description: form.description || (isNewProduct ? "Stock inicial" : ""),
      amount: Number(form.amount),
      product_id: finalProductId || null,
      quantity: Number(form.quantity) || 1
    };

    await api.post("/expenses", expenseData);

    // 3. ÉXITO Y RECARGA
    alert("¡Registro completado!");
    setOpen(false);
    
    // Recargar datos de la página
    loadFinance(); 
    
    // Recargar lista de productos para el dropdown
    const resP = await api.get("/products");
    setProducts(resP.data);

    resetForm();

  } catch (error) {
    console.error("Error detallado:", error.response);
    const msg = error.response?.data?.message || "Error en el servidor";
    alert(`Error ${error.response?.status}: ${msg}`);
    
    if (error.response?.status === 403) {
      console.warn("⚠️ Revisa si tu token ha expirado o si el backend espera un rol de Admin.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      <Header />

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        
        {/* CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            icon={summary.rentabilidad >= 0 ? <Activity className="text-blue-600" /> : <TrendingDown className="text-red-600" />}
          />
        </div>

        {/* CHARTS - CORRECCIÓN RECHARTS AQUÍ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Gráfico 1 */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-w-0">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" /> Balance General
            </h3>
            {/* Contenedor con w-full y min-h */}
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="monto" radius={[10, 10, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2 */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-w-0">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PieChartIcon size={20} className="text-indigo-500" /> Distribución de Gastos
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '15px', border: 'none'}} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTÓN Y LISTA (Sin cambios mayores, solo la llamada al modal) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <button
              onClick={() => setOpen(true)}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95"
            >
              <PlusCircle /> Registrar Movimiento
            </button>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Últimos Movimientos</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {expenses.length > 0 ? expenses.map((e) => (
                <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${e.type === 'gasto' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{e.category}</p>
                      <p className="text-xs text-slate-400">{e.description}</p>
                    </div>
                  </div>
                  <span className={`font-black ${e.type === "gasto" ? "text-red-500" : "text-amber-600"}`}>
                    -${Number(e.amount).toLocaleString()}
                  </span>
                </div>
              )) : (
                <p className="text-center text-slate-400 py-10">No hay movimientos registrados</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL (Pega aquí el código del modal que te di en la respuesta anterior, no ha cambiado lógica interna) */}
      {open && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
             {/* ... Usa el modal completo de la respuesta anterior ... */}
             <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-8 relative shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                 {/* ... Botón cerrar ... */}
                 <button onClick={() => { setOpen(false); resetForm(); }} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                  <X size={18} />
                </button>
                <h3 className="font-black text-2xl mb-8 text-slate-800">Registrar Movimiento</h3>
                
                {/* INICIO FORMULARIO */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ... (COPIA EL CONTENIDO DEL FORMULARIO DE MI RESPUESTA ANTERIOR) ... */}
                    {/* Solo asegúrate de que los inputs de "Nuevo Producto" usen las variables form.newName, form.newCategory, etc. */}
                    
                    {/* COLUMNA IZQUIERDA: DATOS FINANCIEROS */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Tipo</label>
                            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, product_id: "" })} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium outline-none">
                                <option value="gasto">Gasto Administrativo</option>
                                <option value="compra">Compra de Inventario (+ Stock)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Monto</label>
                            <input type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-emerald-600 outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Notas</label>
                            <textarea placeholder="..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 h-32 resize-none outline-none" />
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: PRODUCTO */}
                    <div className="space-y-5">
                        {form.type === "compra" ? (
                            <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-blue-500 uppercase ml-2">Producto</label>
                                    <button type="button" onClick={() => setIsNewProduct(!isNewProduct)} className="text-xs font-black text-blue-600 underline">
                                        {isNewProduct ? "Ver existentes" : "+ Crear Nuevo"}
                                    </button>
                                </div>
                                {!isNewProduct ? (
                                    <div className="space-y-4">
                                        <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="w-full bg-white border-none rounded-xl p-4 outline-none" required>
                                            <option value="">Seleccionar...</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                                        </select>
                                        <input type="number" placeholder="Cantidad" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full bg-white border-none rounded-xl p-4 outline-none" required />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <input placeholder="Nombre" value={form.newName} onChange={(e) => setForm({...form, newName: e.target.value})} className="w-full bg-white border-none rounded-xl p-3 outline-none" required />
                                        <input placeholder="Categoría" value={form.newCategory} onChange={(e) => setForm({...form, newCategory: e.target.value})} className="w-full bg-white border-none rounded-xl p-3 outline-none" required />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="number" placeholder="Precio" value={form.newPrice} onChange={(e) => setForm({...form, newPrice: e.target.value})} className="w-full bg-white border-none rounded-xl p-3 outline-none" required />
                                            <input type="number" placeholder="Stock" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} className="w-full bg-white border-none rounded-xl p-3 outline-none" required />
                                        </div>
                                        <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 text-center relative">
                                            <input type="file" multiple accept="image/*" onChange={handleImages} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <Upload size={20} className="mx-auto text-blue-400" />
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto">
                                            {productPreview.map((src, i) => <img key={i} src={src} className="w-10 h-10 object-cover rounded-md" />)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Categoría</label>
                                <input placeholder="Ej: Luz, Agua..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none" required />
                            </div>
                        )}
                        <button disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                            {loading ? "Procesando..." : "Guardar"}
                        </button>
                    </div>
                </form>
             </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
      <div className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl">{icon}</div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}