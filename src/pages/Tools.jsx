import { Link } from "react-router-dom";
import { 
  Image,
  Tags,
  Sliders,
  Settings,
  Wallet,
  Truck // Icono ideal para Proveedores
} from "lucide-react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function Tools() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      {/* HEADER */}
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 italic tracking-tight">
          Herramientas
        </h1>
        <p className="text-gray-500 mt-1 text-sm font-medium">
          Administra contenido y la logística del sistema
        </p>
      </header>

      {/* GRID DE HERRAMIENTAS */}
      <main className="px-6 grid grid-cols-2 md:grid-cols-3 gap-4">

        <ToolCard
          to="/tools/finance"
          icon={<Wallet className="text-emerald-500" />}
          title="Finanzas"
          desc="Gastos, compras y flujo"
        />

        <ToolCard
          to="/tools/providers"
          icon={<Truck className="text-blue-600" />}
          title="Proveedores"
          desc="Contacto, deudas y logística"
        />

        <ToolCard
          to="/tools/discounts"
          icon={<Sliders className="text-purple-500" />}
          title="Promociones"
          desc="Destacados y ofertas"
        />

        <ToolCard
          to="/tools/banners"
          icon={<Image className="text-amber-500" />}
          title="Banners"
          desc="Carrusel principal"
        />

        <ToolCard
          to="/tools/categories"
          icon={<Tags className="text-rose-500" />}
          title="Categorías"
          desc="Organiza productos"
        />

        <ToolCard
          to="/tools/settings"
          icon={<Settings className="text-slate-600" />}
          title="Configuración"
          desc="Sistema general"
        />

      </main>
      <BottomNav />
    </div>
  );
}
/* =========================
   COMPONENTE CARD
========================= */

function ToolCard({ to, icon, title, desc }) {
  return (
    <Link
      to={to}
      className="
        group bg-white rounded-2xl p-5 border border-gray-200
        hover:border-blue-500 hover:shadow-lg transition
        flex flex-col justify-between min-h-[140px]
      "
    >
      <div className="text-blue-600 mb-4 group-hover:scale-105 transition">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-500">
          {desc}
        </p>
      </div>
    </Link>
  );
}
