import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // 1. Importa el Provider
import { Toaster } from 'react-hot-toast';
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
import PrivateRoute from "./routes/PrivateRoute";
import MainLayout from "./components/MainLayout";
import AutoLogout from "./components/AutoLogout";
import { LoadingProvider } from "./context/LoadingContext"; // Vite resolverá .jsx automáticamente
export default function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        
        <AutoLogout>
          <Routes>
            {/* RUTA PÚBLICA (Sin animación de carga o puedes ponérsela) */}
            <Route path="/login" element={<Login />} />

            {/* RUTAS PRIVADAS */}
            <Route
              element={
                <PrivateRoute>
                  {/* Envolvemos el Layout para que la carga sea global al navegar */}
                    <MainLayout />
                </PrivateRoute>
              }
            >
              {/* Todas las rutas hijas heredan la animación al montarse */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductCreate />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/history" element={<SalesHistory />} />
              <Route path="/users" element={<Users />} />

              <Route path="/tools">
                <Route index element={<Tools />} />
                <Route path="banners" element={<Banners />} />
                <Route path="finance" element={<Finance />} />
                <Route path="discounts" element={<Discounts />} />
                <Route path="categories" element={<Categories />} />
              </Route>
            </Route>

            <Route path="*" element={<div className="p-10 text-center font-bold">404</div>} />
          </Routes>
        </AutoLogout>
      </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  );
}