import { Link } from "react-router-dom";
import { 
  Image,
  Layers,
  Tags,
  Sliders,
  Settings,
  Wallet
} from "lucide-react";
import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";


export default function Tools() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      {/* HEADER */}
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Herramientas
        </h1>
        <p className="text-gray-500 mt-1">
          Administra contenido y configuraciones del sistema
        </p>
      </header>

      {/* GRID DE HERRAMIENTAS */}
      <main className="px-6 grid grid-cols-2 md:grid-cols-3 gap-4">

        <ToolCard
          to="/tools/finance"
          icon={<Wallet />}
          title="Finanzas"
          desc="Gastos, compras y rentabilidad"
        />

        <ToolCard
          to="/tools/discounts"
          icon={<Sliders />}
          title="Promociones"
          desc="Destacados y ofertas"
        />
        <ToolCard
          to="/tools/banners"
          icon={<Image />}
          title="Banners"
          desc="Carrusel principal"
        />

        <ToolCard
          to="/tools/categories"
          icon={<Tags />}
          title="Categorías"
          desc="Organiza productos"
        />

        <ToolCard
          to="/tools/images"
          icon={<Layers />}
          title="Imágenes"
          desc="Múltiples por producto"
        />

        <ToolCard
          to="/tools/settings"
          icon={<Settings />}
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
