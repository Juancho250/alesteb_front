import { BrowserRouter, Routes, Route } from "react-router-dom";

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

import PrivateRoute from "./routes/PrivateRoute";
import MainLayout from "./components/MainLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />

        {/* PRIVATE CON LAYOUT */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductCreate />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/history" element={<SalesHistory />} />
          <Route path="/users" element={<Users />} />

          {/* TOOLS */}
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/banners" element={<Banners />} />
          <Route path="/tools/finance" element={<Finance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
