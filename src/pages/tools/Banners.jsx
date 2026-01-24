import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  Upload
} from "lucide-react";
import api from "../../services/api";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { useAuth } from "../../context/AuthContext"; 

// --- COMPONENTE MODAL ---
function BannerModal({ open, onClose, banner, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    button_text: "Ver más",
    button_link: "/productos",
    is_active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
      } else {
        if (!imageFile) return alert("Debes seleccionar una imagen");
        await api.post("/banners", formData, config);
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-lg">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-6">{banner ? "Editar banner" : "Nuevo banner"}</h2>
        <div className="space-y-4">
          <input
            placeholder="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border resize-none h-24 focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative group border-2 border-dashed border-gray-200 rounded-xl p-4">
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Upload size={24} className="mb-2" />
              <span className="text-sm">Subir imagen</span>
            </div>
          </div>
          {previewUrl && <img src={previewUrl} className="w-full h-40 object-cover rounded-xl border" />}
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Botón texto" value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} className="px-4 py-3 rounded-xl border" />
            <input placeholder="Botón link" value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })} className="px-4 py-3 rounded-xl border" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-5 h-5" />
            Banner activo
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-6 py-2 border rounded-xl">Cancelar</button>
          <button onClick={saveBanner} className="px-6 py-2 bg-blue-600 text-white rounded-xl">Guardar</button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function Banners() {
  const { user } = useAuth(); 
  const permissions = user?.permissions || [];  // Obtener permisos del usuario

  const [banners, setBanners] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    try {
      const res = await api.get("/banners");
      setBanners(res.data);
    } catch (error) { 
      console.error(error);
    }
  };

  const toggleActive = async (banner) => {
    try {
      await api.put(`/banners/${banner.id}`, { ...banner, is_active: !banner.is_active });
      loadBanners();
    } catch (error) { 
      console.error(error); 
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm("¿Eliminar banner?")) return;
    try {
      await api.delete(`/banners/${id}`);
      loadBanners();
    } catch (error) { 
      console.error(error); 
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

        {/* Verificar permiso de creación de banner */}
        {permissions.includes('banner.create') && (
          <button onClick={() => { setSelectedBanner(null); setOpenModal(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex gap-2">
            <Plus size={18} /> Nuevo banner
          </button>
        )}
      </header>

      <section className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-2xl border p-4 flex gap-4 items-center">
            <img src={banner.image_url} className="w-40 h-24 object-cover rounded-xl border" />
            <div className="flex-1">
              <h3 className="font-bold">{banner.title}</h3>
              <p className="text-sm text-gray-500">{banner.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Verificar permiso de edición y activación */}
              {permissions.includes('banner.update') && (
                <>
                  <button onClick={() => toggleActive(banner)} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${banner.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {banner.is_active ? "Activo" : "Inactivo"}
                  </button>
                  <button onClick={() => { setSelectedBanner(banner); setOpenModal(true); }} className="p-2 hover:bg-gray-100 rounded-lg">
                    <Pencil size={18} />
                  </button>
                </>
              )}
              {/* Verificar permiso de eliminación */}
              {permissions.includes('banner.delete') && (
                <button onClick={() => deleteBanner(banner.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Modal de creación y edición */}
      <BannerModal open={openModal} onClose={() => setOpenModal(false)} banner={selectedBanner} onSaved={loadBanners} />
      <BottomNav />
    </div>
  );
}
