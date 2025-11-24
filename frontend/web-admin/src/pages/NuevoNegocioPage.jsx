// src/pages/NuevoNegocioPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function NuevoNegocioPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    email: "",
    phone: "",
    address: "",
    openTime: "09:00",
    closeTime: "17:00",
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    description: "",
  });
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let leafletScript = null;
    
    // Cargar Leaflet dinámicamente
    const loadLeaflet = async () => {
      if (!window.L) {
        // Verificar si el CSS ya está cargado
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        // Verificar si el script ya está cargado
        if (!document.querySelector('script[src*="leaflet"]')) {
          leafletScript = document.createElement("script");
          leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          leafletScript.onload = () => {
            if (isMounted) {
              setTimeout(() => {
                if (isMounted) initializeMap();
              }, 200);
            }
          };
          document.body.appendChild(leafletScript);
        } else {
          // Si el script ya está cargado, esperar a que esté listo
          const checkLeaflet = setInterval(() => {
            if (window.L && isMounted) {
              clearInterval(checkLeaflet);
              setTimeout(() => {
                if (isMounted) initializeMap();
              }, 200);
            }
          }, 100);
        }
      } else {
        // Leaflet ya está cargado
        setTimeout(() => {
          if (isMounted) initializeMap();
        }, 200);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.log("Error al limpiar mapa:", e);
        }
        mapInstanceRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    updateProgress();
  }, [formData, selectedLocation, logoPreview]);

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;
    
    // Verificar si el mapa ya está inicializado
    if (mapInstanceRef.current) {
      return;
    }
    
    // Verificar que el contenedor tenga tamaño
    if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
      setTimeout(initializeMap, 100);
      return;
    }

    try {
      const map = window.L.map(mapRef.current, {
        preferCanvas: false
      }).setView([19.4326, -99.1332], 12);
      
      mapInstanceRef.current = map;

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      map.on("click", function (e) {
        placeMarker(e.latlng);
        updateCoordinates(e.latlng);
      });

      // Invalidar el tamaño del mapa después de cargar
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (mapInstanceRef.current) {
              const userLocation = [position.coords.latitude, position.coords.longitude];
              mapInstanceRef.current.setView(userLocation, 15);
              placeMarker(window.L.latLng(userLocation));
              updateCoordinates(window.L.latLng(userLocation));
            }
          },
          (error) => {
            console.log("Geolocation error:", error);
          }
        );
      }
    } catch (error) {
      console.error("Error inicializando mapa:", error);
    }
  };

  const placeMarker = (latlng) => {
    if (!mapInstanceRef.current || !window.L) return;

    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      const marker = window.L.marker(latlng, {
        icon: window.L.divIcon({
          className: "custom-marker",
          html: '<div style="background-color: #f97316; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
        draggable: true,
      }).addTo(mapInstanceRef.current);

      marker.on("dragend", function () {
        const newLatLng = marker.getLatLng();
        updateCoordinates(newLatLng);
      });

      markerRef.current = marker;
    }

    mapInstanceRef.current.setView(latlng, mapInstanceRef.current.getZoom());
  };

  const updateCoordinates = (latlng) => {
    setSelectedLocation({
      lat: latlng.lat,
      lng: latlng.lng,
    });
  };

  const updateProgress = () => {
    const fields = [
      formData.businessName,
      formData.businessType,
      formData.email,
      formData.phone,
      formData.address,
      selectedLocation,
    ];

    const filledFields = fields.filter((field) => field && field !== "").length;
    const newProgress = Math.round((filledFields / fields.length) * 100);
    setProgress(newProgress);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBusinessTypeSelect = (type) => {
    setFormData({
      ...formData,
      businessType: type,
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    const input = document.getElementById("logoInput");
    if (input) input.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = "#7e22ce";
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = "#cbd5e1";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = "#cbd5e1";
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const searchAddress = () => {
    const addresses = [
      { address: "Avenida Reforma 123, Ciudad de México", coords: [19.4326, -99.1332] },
      { address: "Calle Juárez 456, Guadalajara", coords: [20.6597, -103.3496] },
      { address: "Boulevard Morelos 789, Monterrey", coords: [25.6866, -100.3161] },
    ];

    const random = addresses[Math.floor(Math.random() * addresses.length)];
    setFormData({ ...formData, address: random.address });

    if (mapInstanceRef.current && window.L) {
      mapInstanceRef.current.setView(random.coords, 15);
      placeMarker(window.L.latLng(random.coords));
      updateCoordinates(window.L.latLng(random.coords));
    }

    showNotification("Dirección encontrada", "success");
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [position.coords.latitude, position.coords.longitude];
          if (mapInstanceRef.current && window.L) {
            mapInstanceRef.current.setView(userLocation, 15);
            placeMarker(window.L.latLng(userLocation));
            updateCoordinates(window.L.latLng(userLocation));
            setFormData({ ...formData, address: "Ubicación actual" });
            showNotification("Ubicación actual detectada", "success");
          }
        },
        (error) => {
          showNotification("No se pudo obtener tu ubicación", "error");
        }
      );
    } else {
      showNotification("Tu navegador no soporta geolocalización", "error");
    }
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      showNotification("Ubicación confirmada", "success");
    } else {
      showNotification("Selecciona una ubicación en el mapa", "error");
    }
  };

  const clearLocation = () => {
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    setSelectedLocation(null);
    setFormData({ ...formData, address: "" });
    showNotification("Ubicación eliminada", "info");
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

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.businessType) {
      showNotification("Por favor selecciona un tipo de negocio", "error");
      return;
    }

    const submitData = {
      businessName: formData.businessName,
      businessType: formData.businessType,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      openTime: formData.openTime || null,
      closeTime: formData.closeTime || null,
      website: formData.website || null,
      facebook: formData.facebook || null,
      instagram: formData.instagram || null,
      twitter: formData.twitter || null,
      description: formData.description || null,
      location: selectedLocation || null,
      logo: logoPreview || null,
    };

    try {
      const API_URL = import.meta.env.VITE_API_NEGOCIOS_URL || "http://127.0.0.1:8002/api/negocios";
      
      const response = await fetch(`${API_URL}/crear/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      // Verificar el tipo de contenido antes de parsear
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Respuesta no JSON del servidor:", text.substring(0, 500));
        showNotification("Error del servidor. Revisa la consola para más detalles.", "error");
        return;
      }

      if (!response.ok) {
        let errorMessage = "Error al crear el negocio";
        
        if (data.error) {
          errorMessage = data.error;
          if (data.detail) {
            errorMessage += `: ${data.detail}`;
          }
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (typeof data === 'object') {
          // Si hay errores de validación, mostrarlos
          const errors = Object.values(data).flat();
          if (errors.length > 0) {
            errorMessage = errors[0];
          }
        }
        
        console.error("Error del servidor:", data);
        showNotification(errorMessage, "error");
        return;
      }

      showNotification("¡Negocio creado con éxito! ✨", "success");
      
      // Redirigir al panel después de un breve delay
      setTimeout(() => {
        navigate("/panel", { replace: true });
        // Forzar recarga de la página para actualizar la lista de negocios
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error al crear negocio:", error);
      showNotification("Error de red al contactar el servidor. Asegúrate de que el servidor esté corriendo.", "error");
    }
  };

  const businessTypes = [
    { type: "restaurante", icon: "restaurant", label: "Restaurante" },
    { type: "minorista", icon: "store", label: "Minorista" },
    { type: "servicio", icon: "local_shipping", label: "Servicio" },
    { type: "hosteleria", icon: "hotel", label: "Hostelería" },
    { type: "creativo", icon: "design_services", label: "Creativo" },
    { type: "otro", icon: "more_horiz", label: "Otro" },
  ];

  return (
    <div className="min-h-screen" style={{
      background: "radial-gradient(ellipse at top left, rgba(249, 115, 22, 0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(126, 34, 206, 0.08) 0%, transparent 50%)",
      backgroundColor: "#fafafa"
    }}>
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/panel")}
                className="px-4 py-2 font-medium rounded-xl flex items-center gap-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Regresar
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">AcaClick</span>
                  <p className="text-xs text-gray-500">Registro de Negocio</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">Administrador</span>
                <span className="text-xs text-gray-500">Propietario</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center text-white font-bold cursor-pointer">
                AD
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-16">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Crea tu tienda online</h2>
            <span className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200">
              {progress}% completado
            </span>
          </div>
          <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 md:p-10 space-y-8">
          {/* Nombre del Negocio */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Nombre del Negocio *
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-4 rounded-xl bg-gray-50 text-base border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
              placeholder="Ej: Mi Tienda de Ropa"
            />
            <p className="text-xs text-gray-500 mt-2">Este será el nombre público de tu negocio</p>
          </div>

          {/* Tipo de Negocio */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4">
              Tipo de Negocio *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {businessTypes.map((bt) => (
                <div
                  key={bt.type}
                  onClick={() => handleBusinessTypeSelect(bt.type)}
                  className={`p-5 rounded-xl text-center cursor-pointer transition-all border-2 ${
                    formData.businessType === bt.type
                      ? "border-purple-600 bg-gradient-to-br from-purple-50 to-orange-50"
                      : "border-gray-200 hover:border-purple-400 hover:shadow-lg"
                  }`}
                >
                  <span className={`material-symbols-outlined text-4xl mb-2 block ${
                    formData.businessType === bt.type ? "text-orange-500" : "text-purple-600"
                  }`}>
                    {bt.icon}
                  </span>
                  <p className={`font-medium text-sm ${
                    formData.businessType === bt.type ? "text-purple-600 font-semibold" : "text-gray-900"
                  }`}>
                    {bt.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Logo del Negocio */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4">
              Logo del Negocio
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-600 hover:bg-purple-50/50 transition"
            >
              {!logoPreview ? (
                <div>
                  <span className="material-symbols-outlined text-5xl text-gray-400 mb-3 block">cloud_upload</span>
                  <p className="text-lg font-semibold text-gray-900 mb-1">Sube tu logo</p>
                  <p className="text-sm text-gray-500 mb-4">Arrastra y suelta o haz clic para seleccionar</p>
                  <button
                    type="button"
                    onClick={() => document.getElementById("logoInput")?.click()}
                    className="bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-3 text-white font-medium rounded-xl hover:opacity-90 transition"
                  >
                    Seleccionar Archivo
                  </button>
                  <p className="text-xs text-gray-500 mt-3">PNG, JPG hasta 5MB</p>
                </div>
              ) : (
                <div>
                  <img src={logoPreview} alt="Logo preview" className="w-36 h-36 mx-auto mb-4 rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center gap-1 mx-auto"
                  >
                    <span className="material-symbols-outlined">delete</span>
                    Eliminar logo
                  </button>
                </div>
              )}
            </div>
            <input
              type="file"
              id="logoInput"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          <div className="border-t border-gray-200 pt-8"></div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Correo Electrónico *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-4 rounded-xl bg-gray-50 text-base border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
              placeholder="tu_correo@ejemplo.com"
            />
          </div>

          {/* Número de Teléfono */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Número de Teléfono *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-4 rounded-xl bg-gray-50 text-base border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
              placeholder="+52 123 456 7890"
            />
          </div>

          {/* Dirección Física */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Dirección Física *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-4 rounded-xl bg-gray-50 text-base border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition mb-3"
              placeholder="Calle, Número, Colonia, Ciudad"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={searchAddress}
                className="flex-1 py-3 font-medium rounded-xl flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition"
              >
                <span className="material-symbols-outlined">search</span>
                Buscar Dirección
              </button>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="flex-1 py-3 font-medium rounded-xl flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition"
              >
                <span className="material-symbols-outlined">my_location</span>
                Mi Ubicación
              </button>
            </div>
          </div>

          {/* Mapa */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4">
              Ubicación en el Mapa
            </label>
            <div
              ref={mapRef}
              id="map"
              className="h-96 rounded-xl border-2 border-gray-200 mb-4"
            ></div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3 mb-4">
              <h5 className="font-semibold text-gray-900 mb-2">Coordenadas seleccionadas:</h5>
              <p className="text-gray-700 text-sm">
                {selectedLocation
                  ? `Latitud: ${selectedLocation.lat.toFixed(6)}, Longitud: ${selectedLocation.lng.toFixed(6)}`
                  : "Haz clic en el mapa para seleccionar una ubicación"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Puedes arrastrar el marcador para ajustar la ubicación</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={confirmLocation}
                className="flex-1 py-3 text-white font-medium rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-90 transition"
              >
                Confirmar Ubicación
              </button>
              <button
                type="button"
                onClick={clearLocation}
                className="flex-1 py-3 font-medium rounded-xl border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Horario de Apertura */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Horario de Apertura
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-2">Apertura</label>
                <input
                  type="time"
                  name="openTime"
                  value={formData.openTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">Cierre</label>
                <input
                  type="time"
                  name="closeTime"
                  value={formData.closeTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8"></div>

          {/* Sitio Web */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Sitio Web
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-5 py-4 rounded-xl bg-gray-50 text-base border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
              placeholder="www.tutienda.com"
            />
          </div>

          {/* Redes Sociales */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4">
              Redes Sociales
            </label>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">public</span>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-5 py-4 rounded-xl bg-gray-50 text-base border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                  placeholder="facebook.com/tutienda"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">photo_camera</span>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-5 py-4 rounded-xl bg-gray-50 text-base border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                  placeholder="instagram.com/tutienda"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">flutter_dash</span>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-5 py-4 rounded-xl bg-gray-50 text-base border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
                  placeholder="twitter.com/tutienda"
                />
              </div>
            </div>
          </div>

          {/* Descripción del Negocio */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Descripción del Negocio
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={500}
              className="w-full px-5 py-4 rounded-xl bg-gray-50 text-base min-h-[120px] border-2 border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition"
              placeholder="Describe tu negocio, productos o servicios..."
            />
            <p className="text-xs text-gray-500 mt-2">Máximo 500 caracteres</p>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full py-5 text-white text-lg font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-90 transition"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Completar Registro
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 bg-white/50 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>© 2025 AcaClick. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
