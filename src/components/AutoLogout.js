import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AutoLogout = ({ children }) => {
  const navigate = useNavigate();
  
  // Configura aquí el tiempo de inactividad (ejemplo: 30 minutos)
  const INACTIVITY_LIMIT = 30 * 60 * 1000; 

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login"; // Forzamos recarga para limpiar estados de memoria
  };

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(logout, INACTIVITY_LIMIT);
    };

    // Eventos que se consideran "actividad"
    const events = [
      "mousedown", "mousemove", "keypress", 
      "scroll", "touchstart", "click"
    ];

    // Verificar si el token ya expiró por fecha al volver a la pestaña
    const checkExpiration = () => {
      const expirationTime = localStorage.getItem("expirationTime");
      if (expirationTime && new Date().getTime() > parseInt(expirationTime)) {
        logout();
      }
    };

    // Configurar listeners
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    // Revisar cada 10 segundos si el token ya caducó por tiempo absoluto
    const interval = setInterval(checkExpiration, 10000);

    resetTimer();

    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimer));
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);

  return children;
};

export default AutoLogout;