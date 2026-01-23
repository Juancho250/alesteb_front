import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al recargar la página, recuperamos la sesión si existe
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Configurar el token en axios para futuras peticiones
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    
    // Asumimos que el backend devuelve: { token, user: { id, roles, permissions: [...] } }
    const { token, user: userData } = res.data;

    // 1. Guardar en LocalStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    // 2. Configurar Axios globalmente
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // 3. Actualizar estado
    setUser(userData);
    
    return userData; // Retornamos para que el Login sepa que tuvo éxito
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    window.location.href = "/login"; // Redirección forzada
  };

  // Función poderosa para verificar permisos en cualquier parte de la App
  // Uso: can('users.create') -> true/false
  const can = (permissionSlug) => {
    if (!user) return false;
    // Si es super admin, tiene acceso a todo
    if (user.roles?.includes("super_admin")) return true;
    // Verificar si tiene el permiso específico
    return user.permissions?.includes(permissionSlug);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, can, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);