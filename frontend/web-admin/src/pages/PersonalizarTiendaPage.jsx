// src/pages/PersonalizarTiendaPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PersonalizarTiendaPage() {
  const navigate = useNavigate();
  const { idNegocio } = useParams();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [activeTab, setActiveTab] = useState("branding");
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado de personalización
  const [customization, setCustomization] = useState({
    // Branding
    storeName: "Mi Tienda Online",
    storeLogo: null,
    storeSlogan: "",
    
    // Colors
    primaryColor: "#f97316",
    bgColor: "#ffffff",
    customColor: "#f97316",
    
    // Typography
    fontFamily: "Inter",
    textSize: "medium",
    
    // Content
    heroTitle: "Bienvenido a Nuestra Tienda",
    heroSubtitle: "Descubre los mejores productos con calidad garantizada",
    heroBtn: "Explorar Productos",
    featuredTitle: "Producto Destacado",
    featuredDesc: "Descripción del producto destacado. Este producto es ideal para tu día a día con calidad premium.",
    
    // Media
    featuredImage: null,
    productImage1: null,
    productImage2: null,
    mapAddress: "",
  });

  useEffect(() => {
    // Cargar datos del negocio si hay ID
    if (idNegocio) {
      loadNegocio();
    } else {
      setLoading(false);
    }
  }, [idNegocio]);

  useEffect(() => {
    // Cargar Leaflet para el mapa
    loadLeaflet();
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.log("Error al limpiar mapa:", e);
        }
      }
    };
  }, []);

  const loadNegocio = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_NEGOCIOS_URL || "http://127.0.0.1:8002/api/negocios";
      const response = await fetch(`${API_URL}/${idNegocio}/`);
      if (response.ok) {
        const data = await response.json();
        setNegocio(data);
        // Cargar datos de personalización si existen
        if (data.personalizacion) {
          setCustomization({ ...customization, ...data.personalizacion });
        }
        // Cargar datos básicos
        setCustomization(prev => ({
          ...prev,
          storeName: data.nombre || prev.storeName,
          storeLogo: data.logo_url || prev.storeLogo,
          mapAddress: data.direccion || prev.mapAddress,
        }));
      }
    } catch (error) {
      console.error("Error cargando negocio:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaflet = async () => {
    if (!window.L) {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!document.querySelector('script[src*="leaflet"]')) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => {
          setTimeout(() => initMap(), 200);
        };
        document.body.appendChild(script);
      }
    } else {
      setTimeout(() => initMap(), 200);
    }
  };

  const initMap = () => {
    if (!mapRef.current || !window.L) return;
    if (mapInstanceRef.current) return;

    const map = window.L.map(mapRef.current).setView([19.4326, -99.1332], 13);
    mapInstanceRef.current = map;

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    markerRef.current = window.L.marker([19.4326, -99.1332])
      .addTo(map)
      .bindPopup("Tu tienda está ubicada aquí")
      .openPopup();

    setTimeout(() => map.invalidateSize(), 200);
  };

  const updateMapLocation = () => {
    if (customization.mapAddress) {
      showNotification("Ubicación actualizada en el mapa", "success");
    } else {
      showNotification("Por favor ingresa una dirección", "error");
    }
  };

  const handleInputChange = (field, value) => {
    setCustomization(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomization(prev => ({ ...prev, [field]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const selectFont = (fontFamily) => {
    setCustomization(prev => ({ ...prev, fontFamily }));
  };

  const saveChanges = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_NEGOCIOS_URL || "http://127.0.0.1:8002/api/negocios";
      
      if (idNegocio) {
        // Actualizar personalización existente
        const response = await fetch(`${API_URL}/${idNegocio}/personalizar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customization),
        });

        if (response.ok) {
          showNotification("¡Cambios guardados exitosamente!", "success");
        } else {
          showNotification("Error al guardar los cambios", "error");
        }
      } else {
        showNotification("¡Cambios guardados exitosamente! (demo)", "success");
      }
    } catch (error) {
      console.error("Error guardando:", error);
      showNotification("Error al guardar los cambios", "error");
    }
  };

  const resetToDefault = () => {
    if (confirm("¿Estás seguro de que deseas restablecer todos los cambios?")) {
      window.location.reload();
    }
  };

  const publishStore = () => {
    showNotification("¡Tu tienda ha sido publicada! 🎉", "success");
  };

  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-xl shadow-2xl z-50 ${
      type === "success"
        ? "bg-green-500 text-white"
        : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white"
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customization Panel */}
      <div className="fixed right-0 top-0 w-96 h-screen bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                  <button onClick={() => navigate("/panel")}>AcaClick</button>
                </h1>
                <p className="text-xs text-gray-500">Personalizar Tienda</p>
              </div>
            </div>
            <button
              onClick={saveChanges}
              className="bg-gradient-to-r from-orange-500 to-purple-600 px-4 py-2 text-white font-semibold rounded-xl flex items-center gap-2 text-sm hover:opacity-90 transition"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              Guardar
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: "branding", icon: "store", label: "Marca" },
              { id: "colors", icon: "palette", label: "Colores" },
              { id: "typography", icon: "text_fields", label: "Tipografía" },
              { id: "content", icon: "edit", label: "Contenido" },
              { id: "media", icon: "image", label: "Multimedia" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 font-semibold text-xs whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600"
                }`}
              >
                <span className="material-symbols-outlined align-middle text-sm mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6 pb-32">
          {/* Branding Tab */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Nombre de la Tienda</label>
                <input
                  type="text"
                  value={customization.storeName}
                  onChange={(e) => handleInputChange("storeName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Logo de la Tienda</label>
                <div
                  onClick={() => document.getElementById("logoUpload").click()}
                  className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:border-purple-600 hover:bg-purple-50/50 transition"
                >
                  {customization.storeLogo ? (
                    <img src={customization.storeLogo} alt="Logo" className="w-24 h-24 mx-auto rounded-lg object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-gray-400 mb-2 block">add_photo_alternate</span>
                      <p className="text-gray-500">Haz clic para subir tu logo</p>
                    </>
                  )}
                  <input
                    type="file"
                    id="logoUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("storeLogo", e.target.files[0])}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Eslogan</label>
                <input
                  type="text"
                  value={customization.storeSlogan}
                  onChange={(e) => handleInputChange("storeSlogan", e.target.value)}
                  placeholder="Tu eslogan aquí"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                />
              </div>
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === "colors" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-4">Color Principal</label>
                <div className="flex flex-wrap gap-3">
                  {["#f97316", "#7e22ce", "#3b82f6", "#10b981", "#ef4444", "#f59e0b"].map((color) => (
                    <label key={color} className="cursor-pointer">
                      <input
                        type="radio"
                        name="primaryColor"
                        value={color}
                        checked={customization.primaryColor === color}
                        onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                        className="hidden"
                      />
                      <div
                        className={`w-10 h-10 rounded-full ${
                          customization.primaryColor === color ? "ring-4 ring-purple-500 ring-offset-2" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Color de Fondo</label>
                <div className="flex flex-wrap gap-3">
                  {["#ffffff", "#f9fafb", "#fef3c7", "#e0e7ff"].map((color) => (
                    <label key={color} className="cursor-pointer">
                      <input
                        type="radio"
                        name="bgColor"
                        value={color}
                        checked={customization.bgColor === color}
                        onChange={(e) => handleInputChange("bgColor", e.target.value)}
                        className="hidden"
                      />
                      <div
                        className={`w-10 h-10 rounded-full border-2 border-gray-300 ${
                          customization.bgColor === color ? "ring-4 ring-purple-500 ring-offset-2" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Color Personalizado</label>
                <input
                  type="color"
                  value={customization.customColor}
                  onChange={(e) => handleInputChange("customColor", e.target.value)}
                  className="w-full h-12 rounded-xl cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === "typography" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Fuente Principal</label>
                <div className="space-y-3">
                  {[
                    { font: "Inter", label: "Inter (Moderna)" },
                    { font: "Poppins", label: "Poppins (Redondeada)" },
                    { font: "Roboto", label: "Roboto (Clásica)" },
                    { font: "Montserrat", label: "Montserrat (Elegante)" },
                  ].map(({ font, label }) => (
                    <div
                      key={font}
                      onClick={() => selectFont(font)}
                      className={`p-3 rounded-lg cursor-pointer border-2 transition ${
                        customization.fontFamily === font
                          ? "border-purple-600 bg-purple-50"
                          : "border-transparent hover:border-gray-200"
                      }`}
                    >
                      <p className="font-semibold">{label}</p>
                      <p className="text-sm text-gray-600" style={{ fontFamily: font }}>
                        Ejemplo de texto con la fuente {font}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Tamaño de Texto</label>
                <select
                  value={customization.textSize}
                  onChange={(e) => handleInputChange("textSize", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Título del Hero</label>
                <input
                  type="text"
                  value={customization.heroTitle}
                  onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Subtítulo del Hero</label>
                <input
                  type="text"
                  value={customization.heroSubtitle}
                  onChange={(e) => handleInputChange("heroSubtitle", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Texto del Botón Hero</label>
                <input
                  type="text"
                  value={customization.heroBtn}
                  onChange={(e) => handleInputChange("heroBtn", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Título Destacado</label>
                <input
                  type="text"
                  value={customization.featuredTitle}
                  onChange={(e) => handleInputChange("featuredTitle", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Descripción Destacada</label>
                <textarea
                  value={customization.featuredDesc}
                  onChange={(e) => handleInputChange("featuredDesc", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Imagen Destacada</label>
                <div
                  onClick={() => document.getElementById("featuredImageUpload").click()}
                  className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:border-purple-600 hover:bg-purple-50/50 transition"
                >
                  <span className="material-symbols-outlined text-4xl text-gray-400 mb-2 block">add_photo_alternate</span>
                  <p className="text-gray-500">Haz clic para subir imagen destacada</p>
                  <input
                    type="file"
                    id="featuredImageUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("featuredImage", e.target.files[0])}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Imágenes de Productos</label>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((num) => (
                    <div
                      key={num}
                      onClick={() => document.getElementById(`productImage${num}Upload`).click()}
                      className="border-2 border-dashed border-gray-300 p-4 rounded-xl text-center cursor-pointer hover:border-purple-600 hover:bg-purple-50/50 transition"
                    >
                      <span className="material-symbols-outlined text-2xl text-gray-400 mb-1 block">add_photo_alternate</span>
                      <p className="text-xs text-gray-500">Producto {num}</p>
                      <input
                        type="file"
                        id={`productImage${num}Upload`}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(`productImage${num}`, e.target.files[0])}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Ubicación en el Mapa</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customization.mapAddress}
                    onChange={(e) => handleInputChange("mapAddress", e.target.value)}
                    placeholder="Dirección de la tienda"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                  />
                  <button
                    onClick={updateMapLocation}
                    className="w-full px-4 py-3 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition"
                  >
                    Actualizar Ubicación
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
          <div className="space-y-3">
            <button
              onClick={resetToDefault}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
            >
              Restablecer
            </button>
            <button
              onClick={publishStore}
              className="bg-gradient-to-r from-orange-500 to-purple-600 w-full px-6 py-4 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <span className="material-symbols-outlined">rocket_launch</span>
              Publicar Tienda
            </button>
          </div>
        </div>
      </div>

      {/* Store Preview */}
      <div className="mr-96">
        {/* Store Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-4">
                <img
                  src={customization.storeLogo || "https://via.placeholder.com/40x40/7e22ce/ffffff?text=LOGO"}
                  alt="Logo"
                  className="w-10 h-10 rounded-lg"
                />
                <h1 className="text-2xl font-bold" style={{ fontFamily: customization.fontFamily }}>
                  {customization.storeName}
                </h1>
              </div>
              <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-6">
                  <a href="#" className="font-medium hover:text-purple-600 transition">Inicio</a>
                  <a href="#" className="font-medium hover:text-purple-600 transition">Productos</a>
                  <a href="#" className="font-medium hover:text-purple-600 transition">Categorías</a>
                  <a href="#" className="font-medium hover:text-purple-600 transition">Contacto</a>
                </nav>
                <div className="flex items-center gap-4">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition">
                    <span className="material-symbols-outlined">search</span>
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition relative">
                    <span className="material-symbols-outlined">shopping_cart</span>
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition">
                    <span className="material-symbols-outlined">person</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div
          className="relative text-white py-20 px-8"
          style={{
            background: `linear-gradient(to right, ${customization.primaryColor}, #f97316)`,
          }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: customization.fontFamily }}>
              {customization.heroTitle}
            </h2>
            <p className="text-xl mb-8">{customization.heroSubtitle}</p>
            <button
              className="bg-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition"
              style={{ color: customization.primaryColor }}
            >
              {customization.heroBtn}
            </button>
          </div>
        </div>

        {/* Featured Product */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-purple-50 border-2 border-purple-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <img
                src={customization.featuredImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop"}
                alt="Producto Destacado"
                className="w-full h-64 object-cover rounded-xl"
              />
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: customization.fontFamily }}>
                  {customization.featuredTitle}
                </h3>
                <p className="text-gray-600 mb-6">{customization.featuredDesc}</p>
                <button
                  className="w-fit px-6 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition"
                  style={{ background: customization.primaryColor }}
                >
                  Ver Producto
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* New Products Section */}
        <div className="max-w-7xl mx-auto px-6 py-16 bg-gray-50">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: customization.fontFamily }}>
              Nuevos Productos
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">Descubre nuestra última colección de productos exclusivos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { img: customization.productImage1, title: "Auriculares Premium", price: "$29.99" },
              { img: customization.productImage2, title: "Smart Watch", price: "$49.99" },
              { img: null, title: "Zapatillas Deportivas", price: "$39.99" },
            ].map((product, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                <img
                  src={product.img || `https://images.unsplash.com/photo-${idx === 0 ? "1505740420928-5e560c06d30e" : idx === 1 ? "1572635196237-14b3f281503f" : "1560769629-975ec94e6a86"}?w=300&h=300&fit=crop`}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-1">{product.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">Descripción del producto</p>
                  <p className="text-purple-600 font-bold text-xl">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: customization.fontFamily }}>
              Nuestra Ubicación
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">Visítanos en nuestra tienda física</p>
          </div>
          <div ref={mapRef} id="map" className="w-full h-96 rounded-2xl overflow-hidden"></div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">{customization.storeName}</h4>
              <p className="text-gray-400">La mejor selección de productos con calidad garantizada.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Inicio</a></li>
                <li><a href="#" className="hover:text-white transition">Productos</a></li>
                <li><a href="#" className="hover:text-white transition">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@mitienda.com</li>
                <li>Teléfono: +1 234 567 890</li>
                <li>Dirección: {customization.mapAddress || "Calle Principal 123"}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Síguenos</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition">FB</a>
                <a href="#" className="text-gray-400 hover:text-white transition">IG</a>
                <a href="#" className="text-gray-400 hover:text-white transition">TW</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

