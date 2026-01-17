import {
  DollarSign,
  Package,
  ShoppingCart,
  Plus,
} from "lucide-react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import StatCard from "../components/StatCard";
import QuickAction from "../components/QuickAction";

export default function Dashboard() {
  return (
    <div className="pb-16">
      <Header />

      <main className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Ventas hoy"
            value="$0"
            icon={<DollarSign />}
          />
          <StatCard
            title="Productos"
            value="0"
            icon={<Package />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <QuickAction
            icon={<ShoppingCart />}
            label="Nueva venta"
          />
          <QuickAction
            icon={<Plus />}
            label="Nuevo producto"
          />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
