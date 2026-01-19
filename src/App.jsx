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
/* import Categories from "./pages/tools/Categories"; */
/* import ProductImages from "./pages/tools/ProductImages"; */
/* import Promotions from "./pages/tools/Promotions"; */
/* import Settings from "./pages/tools/Settings"; */
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />

        {/* PRIVATE */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/products"
          element={
            <PrivateRoute>
              <Products />
            </PrivateRoute>
          }
        />

        <Route
          path="/products/new"
          element={
            <PrivateRoute>
              <ProductCreate />
            </PrivateRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <Sales />
            </PrivateRoute>
          }
        />

        <Route
          path="/history"
          element={
            <PrivateRoute>
              <SalesHistory />
            </PrivateRoute>
          }
        />

        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />

        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/banners" element={<Banners />} />{/* 
        <Route path="/tools/categories" element={<Categories />} />
        <Route path="/tools/images" element={<ProductImages />} />
        <Route path="/tools/promotions" element={<Promotions />} />
        <Route path="/tools/settings" element={<Settings />} /> */}

      </Routes>
    </BrowserRouter>
  );
}
