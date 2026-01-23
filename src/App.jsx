import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // 1. Importa el Provider
import { Toaster } from 'react-hot-toast';

// Páginas
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductCreate from "./pages/ProductCreate";
import Sales from "./pages/Sales";
import SalesHistory from "./pages/SalesHistory";
import Tools from "./pages/Tools";
import Banners from "./pages/tools/Banners";
import Users from "./pages/Users";
import Finance from "./pages/Finance";
import Discounts from "./pages/tools/Discounts";
import Categories from "./pages/tools/Categories";

// Componentes de Estructura
import PrivateRoute from "./routes/PrivateRoute";
import MainLayout from "./components/MainLayout";
import AutoLogout from "./components/AutoLogout";

export default function App() {
  return (
    // 2. AuthProvider DEBE envolver a BrowserRouter para que useAuth funcione
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        
        {/* AutoLogout suele ir dentro de las rutas o envolviéndolas */}
        <AutoLogout>
          <Routes>
            {/* RUTA PÚBLICA */}
            <Route path="/login" element={<Login />} />

            {/* RUTAS PRIVADAS (Protegidas por PrivateRoute y dentro de MainLayout) */}
            <Route
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              {/* Todas estas rutas renderizarán dentro del Outlet de MainLayout */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductCreate />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/history" element={<SalesHistory />} />
              <Route path="/users" element={<Users />} />

              {/* TOOLS - Agrupadas */}
              <Route path="/tools">
                <Route index element={<Tools />} />
                <Route path="banners" element={<Banners />} />
                <Route path="finance" element={<Finance />} />
                <Route path="discounts" element={<Discounts />} />
                <Route path="categories" element={<Categories />} />
              </Route>
            </Route>

            {/* 404 - Opcional: Redirigir si la ruta no existe */}
            <Route path="*" element={<div className="p-10 text-center font-bold">404 - Página no encontrada</div>} />
          </Routes>
        </AutoLogout>
      </BrowserRouter>
    </AuthProvider>
  );
}