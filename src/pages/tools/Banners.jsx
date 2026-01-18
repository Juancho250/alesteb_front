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

// --- COMPONENTE MODAL CON SUBIDA A CLOUDINARY ---
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
      setPreviewUrl(URL.createObjectURL(file)); // Vista previa local inmediata
    }
  };

  // Dentro de BannerModal en Banners.jsx
    const saveBanner = async () => {
    try {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("button_text", form.button_text);
        formData.append("button_link", form.button_link);
        
        // Aseguramos que se envíe como 1 o 0 para evitar confusiones de tipos en la DB
        formData.append("is_active", form.is_active ? "1" : "0");

        if (imageFile) {
        formData.append("image", imageFile);
        }

        const config = {
        headers: { "Content-Type": "multipart/form-data" },
        };

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
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {banner ? "Editar banner" : "Nuevo banner"}
        </h2>

        <div className="space-y-4">
          <input
            placeholder="Título del banner"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* SELECTOR DE ARCHIVO */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Imagen del Banner</label>
            <div className="relative group border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-400 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500">
                <Upload size={24} className="mb-2" />
                <span className="text-sm">Click para subir o arrastrar imagen</span>
              </div>
            </div>
          </div>

          {previewUrl && (
            <div className="relative">
              <p className="text-xs text-gray-400 mb-1">Vista previa:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-40 object-cover rounded-xl border"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Texto del botón"
              value={form.button_text}
              onChange={(e) => setForm({ ...form, button_text: e.target.value })}
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Link del botón"
              value={form.button_link}
              onChange={(e) => setForm({ ...form, button_link: e.target.value })}
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Banner activo
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={saveBanner}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const res = await api.get("/banners");
      setBanners(res.data);
    } catch (error) {
      console.error("Error cargando banners:", error);
    }
  };

  const toggleActive = async (banner) => {
    try {
      // Usamos JSON simple aquí ya que no hay cambio de imagen
      await api.put(`/banners/${banner.id}`, {
        ...banner,
        is_active: !banner.is_active,
      });
      loadBanners();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm("¿Eliminar este banner permanentemente?")) return;
    try {
      await api.delete(`/banners/${id}`);
      loadBanners();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setOpenModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 px-6">
      <Header />

      <header className="pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-500">Administra el carrusel publicitario de la App</p>
        </div>

        <button
          onClick={() => {
            setSelectedBanner(null);
            setOpenModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={18} />
          Nuevo banner
        </button>
      </header>

      <section className="space-y-4 w-full">
        {banners.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No hay banners configurados en la base de datos.</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col md:flex-row gap-4 items-center group transition hover:shadow-md"
            >
              <div className="relative">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full md:w-40 h-24 object-cover rounded-xl border bg-gray-50"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150x100?text=Error+Imagen"; }}
                />
                {!banner.is_active && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-gray-600 bg-gray-100 px-2 py-1 rounded shadow-sm">Inactivo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">
                  {banner.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                  {banner.description || "Sin descripción"}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold text-xs">
                    Botón: {banner.button_text}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400 italic">
                    <ExternalLink size={14} />
                    <span className="truncate max-w-[120px]">{banner.button_link}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-center">
                <button
                  onClick={() => toggleActive(banner)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition
                    ${banner.is_active
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                  {banner.is_active ? "Activo" : "Inactivo"}
                </button>

                <button 
                  onClick={() => handleEdit(banner)}
                  className="p-2.5 hover:bg-gray-100 text-gray-600 rounded-xl transition"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => deleteBanner(banner.id)}
                  className="p-2.5 hover:bg-red-50 text-red-600 rounded-xl transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <BannerModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        banner={selectedBanner}
        onSaved={loadBanners}
      />

      <BottomNav />
    </div>
  );
}