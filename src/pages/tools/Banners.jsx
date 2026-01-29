import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload
} from "lucide-react";
import api from "../../services/api";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { useLoading } from "../../context/LoadingContext";
import { useNotice } from "../../context/NoticeContext";

// --- COMPONENTE MODAL ---
function BannerModal({ open, onClose, banner, onSaved, showNotice }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    button_text: "Ver más",
    button_link: "/productos",
    is_active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (banner) {
      setForm({
        title: banner.title || "",
        description: banner.description || "",
        button_text: banner.button_text || "Ver más",
        button_link: banner.button_link || "/productos",
        is_active: banner.is_active === undefined ? true : !!banner.is_active,
      });
      setPreviewUrl(banner.image_url || "");
      setImageFile(null);
    } else {
      setForm({
        title: "",
        description: "",
        button_text: "Ver más",
        button_link: "/productos",
        is_active: true,
      });
      setPreviewUrl("");
      setImageFile(null);
    }
  }, [banner, open]);

  if (!open) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const saveBanner = async () => {
    if (!banner && !imageFile) {
      return showNotice("Debes seleccionar una imagen", "warning");
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("button_text", form.button_text);
      formData.append("button_link", form.button_link);
      formData.append("is_active", form.is_active ? "1" : "0");

      if (imageFile) formData.append("image", imageFile);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (banner?.id) {
        await api.put(`/banners/${banner.id}`, formData, config);
        showNotice("Banner actualizado", "success");
      } else {
        await api.post("/banners", formData, config);
        showNotice("Banner creado con éxito", "success");
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      showNotice("Error al guardar el banner", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-6">{banner ? "Editar banner" : "Nuevo banner"}</h2>
        <div className="space-y-4">
          <input
            placeholder="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <textarea
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border resize-none h-24 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="relative group border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-blue-400 transition-colors">
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
              <Upload size={24} className="mb-2" />
              <span className="text-sm font-medium">Subir imagen</span>
            </div>
          </div>
          {previewUrl && <img src={previewUrl} className="w-full h-40 object-cover rounded-xl border" alt="Preview" />}
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Botón texto" value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} className="px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Botón link" value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })} className="px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-5 h-5 cursor-pointer" />
            <span className="font-medium">Banner activo</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-6 py-2 border rounded-xl hover:bg-gray-50 transition-colors font-medium">Cancelar</button>
          <button onClick={saveBanner} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function Banners() {
  const { startLoading, stopLoading } = useLoading();
  const { showNotice, askConfirmation } = useNotice();

  const [banners, setBanners] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    setLoading(true);
    startLoading();
    try {
      const res = await api.get("/banners");
      setBanners(res.data || []);
    } catch (error) { 
      console.error("Error cargando banners:", error);
      showNotice("Error al cargar banners", "error");
    } finally {
      setLoading(false);
      setTimeout(stopLoading, 600);
    }
  };

  const toggleActive = async (banner) => {
    startLoading();
    try {
      await api.put(`/banners/${banner.id}`, { 
        ...banner, 
        is_active: !banner.is_active 
      });
      showNotice(`Banner ${!banner.is_active ? 'activado' : 'desactivado'}`, "success");
      loadBanners();
    } catch (error) { 
      console.error("Error al cambiar estado:", error);
      showNotice("Error al cambiar estado del banner", "error");
    } finally {
      stopLoading();
    }
  };

  const deleteBanner = async (id) => {
    const confirmed = await askConfirmation(
      "¿Eliminar banner?",
      "Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    startLoading();
    try {
      await api.delete(`/banners/${id}`);
      showNotice("Banner eliminado con éxito", "success");
      loadBanners();
    } catch (error) { 
      console.error("Error al eliminar:", error);
      showNotice("Error al eliminar el banner", "error");
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 px-6">
      <Header />
      <header className="pt-8 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-gray-500">Administración de publicidad</p>
        </div>

        <button 
          onClick={() => { 
            setSelectedBanner(null); 
            setOpenModal(true); 
          }} 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex gap-2 hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
        >
          <Plus size={18} /> Nuevo banner
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No hay banners</h3>
          <p className="text-gray-500">Crea tu primer banner publicitario</p>
        </div>
      ) : (
        <section className="space-y-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-2xl border p-4 flex gap-4 items-center hover:shadow-lg transition-shadow">
              <img src={banner.image_url} className="w-40 h-24 object-cover rounded-xl border" alt={banner.title} />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{banner.title}</h3>
                <p className="text-sm text-gray-500">{banner.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleActive(banner)} 
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${banner.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {banner.is_active ? "Activo" : "Inactivo"}
                </button>
                <button 
                  onClick={() => { 
                    setSelectedBanner(banner); 
                    setOpenModal(true); 
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => deleteBanner(banner.id)} 
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Modal de creación y edición */}
      <BannerModal 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        banner={selectedBanner} 
        onSaved={loadBanners}
        showNotice={showNotice}
      />
      <BottomNav />
    </div>
  );
}