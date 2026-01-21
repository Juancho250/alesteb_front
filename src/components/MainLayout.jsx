import Header from "./Header";
import BottomNav from "./BottomNav";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main
        style={{
          paddingTop: "var(--header-height)",
          paddingBottom: "7rem",
        }}
        className="w-full max-w-5xl mx-auto px-6"
      >
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
