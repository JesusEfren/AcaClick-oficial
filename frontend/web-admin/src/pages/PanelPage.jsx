// src/pages/PanelPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, listarNegociosUsuario } from "../services/api";

export default function PanelPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [negocios, setNegocios] = useState([]);
  const [loadingNegocios, setLoadingNegocios] = useState(true);

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);

  // 1️⃣ Cargar usuario logeado
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
      return;
    }

    async function cargarUsuario() {
      try {
        const data = await getCurrentUser(token);
        setUsuario(data);
      } catch (err) {
        console.error("Error obteniendo usuario:", err);
        setError("No se pudo cargar la información del usuario.");

        if (err.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    cargarUsuario();
  }, [navigate]);

  // 2️⃣ Cargar negocios del usuario logeado
  useEffect(() => {
    if (!usuario || !usuario.id_usuario) return;

    async function cargarNegocios() {
      try {
        setLoadingNegocios(true);
        const data = await listarNegociosUsuario(usuario.id_usuario);
        setNegocios(data || []);
      } catch (err) {
        console.error("Error obteniendo negocios del usuario:", err);
        setNegocios([]);
      } finally {
        setLoadingNegocios(false);
      }
    }

    cargarNegocios();
  }, [usuario]);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Cargando panel...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="mb-4 text-red-600">{error}</p>
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

  if (!usuario) return null;

  const {
    id_usuario,
    correo,
    username,
    nombre,
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento,
    rol,
    tenant_id,
  } = usuario;

  const nombreCompleto = `${nombre || ""} ${apellido_paterno || ""} ${
    apellido_materno || ""
  }`.trim();

  const iniciales =
    (nombre?.[0] || "").toUpperCase() +
    (apellido_paterno?.[0] || "").toUpperCase();

  const rolTexto = rol?.nombre_rol || rol?.role || "Sin rol asignado";

  return (
    <div className="bg-gradient-to-br from-gray-50 via-orange-50/30 to-purple-50/30 min-h-screen">
      {/* Header móvil */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <div className="inline-flex items-center justify-center text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
              A
            </span>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              AcaClick
            </span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <div className="inline-flex items-center justify-center text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
          </button>
        </div>
      </header>

      <div className="flex min-h-screen pt-14 lg:pt-0">
        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`fixed lg:sticky top-14 lg:top-0 left-0 h-[calc(100vh-3.5rem)] lg:h-screen w-72 z-40 flex flex-col shadow-2xl lg:shadow-none border-r border-gray-200 bg-white ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } transition-transform duration-300`}
        >
          {/* Logo desktop */}
          <div className="hidden lg:flex items-center gap-3 px-6 py-6 border-b border-gray-200">
            <img
              src="/imagenes/AcaClickLogo.png"
              alt="AcaClick Logo"
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                AcaClick
              </h1>
              <p className="text-xs text-gray-500">Panel Principal</p>
            </div>
          </div>

          {/* Buscador */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="relative">
              <div className="inline-flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar negocio..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
              />
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-50 to-purple-50 text-purple-700 font-semibold">
                <div className="inline-flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <span className="text-sm">Panel Principal</span>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                <div className="inline-flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <span className="text-sm">Mis Negocios</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-semibold">
                  {negocios.length}
                </span>
              </div>

              <div className="pt-4 pb-2 px-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Gestión
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPerfilOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <div className="inline-flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span className="text-sm">Mi Perfil</span>
              </button>

              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                <div className="inline-flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M8 12h8" />
                    <path d="M8 16h8" />
                    <path d="M6 20h12" />
                  </svg>
                </div>
                <span className="text-sm">Facturación</span>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                <div className="inline-flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="text-sm">Equipo</span>
              </div>

              <div className="pt-4 pb-2 px-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Configuración
                </p>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                <div className="inline-flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <span className="text-sm">Ajustes</span>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                <div className="inline-flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <span className="text-sm">Ayuda</span>
              </div>
            </div>
          </nav>

          {/* Perfil usuario abajo */}
          <div className="border-t border-gray-200 p-4 relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-purple-50 cursor-pointer hover:shadow-md transition"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {iniciales || "AC"}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {nombreCompleto || username}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {rolTexto} • {tenant_id || "Sin empresa"}
                </p>
              </div>
              <div className="inline-flex items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-20 left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPerfilOpen(true);
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer text-left"
                  >
                    <div className="inline-flex items-center justify-center text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Ver perfil
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 cursor-pointer text-left border-t border-gray-100 mt-1"
                  >
                    <div className="inline-flex items-center justify-center text-red-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      Cerrar sesión
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto">
          {/* Top bar desktop */}
          <div className="hidden lg:block bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/imagenes/AcaClickLogo.png"
                    alt="AcaClick Logo"
                    className="w-10 h-10"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Panel Principal
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Gestiona todos tus negocios desde un solo lugar
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2.5 hover:bg-gray-100 rounded-lg transition relative">
                    <span className="inline-flex items-center justify-center text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
                  </button>
                  <button 
                    onClick={() => navigate("/negocios/nuevo")}
                    className="bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-2.5 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-lg hover:opacity-90 transition"
                  >
                    <span className="inline-flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                    Nuevo Negocio
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="stat-card glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg">
                    <div className="icon-container text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                  </div>
                  <span className="badge bg-green-100 text-green-700">+1</span>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Negocios Activos
                </p>
                <p className="text-3xl font-bold text-gray-900">{negocios.length}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {negocios.filter(n => n.activo).length} activos
                  {negocios.filter(n => !n.activo).length > 0 && `, ${negocios.filter(n => !n.activo).length} pausados`}
                </p>
              </div>

              <div className="stat-card glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg">
                    <div className="icon-container text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                  </div>
                  <span className="badge bg-green-100 text-green-700">
                    +12.5%
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Ventas Totales
                </p>
                <p className="text-3xl font-bold text-gray-900">$3,456</p>
                <p className="text-xs text-gray-500 mt-2">
                  Últimas 24 horas (demo)
                </p>
              </div>

              <div className="stat-card glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl shadow-lg">
                    <div className="icon-container text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                  </div>
                  <span className="badge bg-red-100 text-red-700">4</span>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Alertas de Stock
                </p>
                <p className="text-3xl font-bold text-gray-900">4</p>
                <p className="text-xs text-gray-500 mt-2">
                  Requieren atención (demo)
                </p>
              </div>

              <div className="stat-card glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg">
                    <div className="icon-container text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </div>
                  </div>
                  <span className="badge bg-blue-100 text-blue-700">
                    +8.2%
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Pedidos Activos
                </p>
                <p className="text-3xl font-bold text-gray-900">27</p>
                <p className="text-xs text-gray-500 mt-2">17 pendientes</p>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/negocios/nuevo")}
                  className="quick-action bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                    <div className="icon-container text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Nuevo Negocio
                  </p>
                </button>

                <div className="quick-action bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <div className="icon-container text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                        <path d="M22 12A10 10 0 0 0 12 2v10z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Reportes</p>
                </div>

                <div className="quick-action bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <div className="icon-container text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 8.12 11H9a1.65 1.65 0 0 0 1-1.51V9" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Configuración
                  </p>
                </div>

                <div className="quick-action bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <div className="icon-container text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                        <polyline points="7.5 19.79 7.5 14.6 3 12" />
                        <polyline points="21 12 16.5 14.6 16.5 19.79" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Soporte</p>
                </div>

                <div className="quick-action bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                    <div className="icon-container text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Tutoriales
                  </p>
                </div>
              </div>
            </div>

            {/* Tus Negocios */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tus Negocios</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Gestiona y monitorea todos tus negocios
                </p>
              </div>
            </div>

            {/* Lista de negocios */}
            {loadingNegocios ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Cargando tus negocios...</p>
              </div>
            ) : negocios.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes negocios aún
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Comienza creando tu primer negocio
                </p>
                <button
                  onClick={() => navigate("/negocios/nuevo")}
                  className="bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition"
                >
                  Crear mi primer negocio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {negocios.map((negocio) => (
                  <div
                    key={negocio.id_negocio}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
                    onClick={() => {
                      // Navegar al dashboard del negocio
                      navigate(`/negocios/${negocio.id_negocio}`);
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {negocio.logo_url ? (
                          <img
                            src={negocio.logo_url}
                            alt={negocio.nombre}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center text-white font-bold">
                            {negocio.nombre.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-gray-900">{negocio.nombre}</h3>
                          <p className="text-xs text-gray-500 capitalize">{negocio.tipo}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          negocio.activo
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {negocio.activo ? "Activo" : "Pausado"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {negocio.descripcion || "Sin descripción"}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="truncate">{negocio.direccion}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{negocio.telefono}</span>
                      </div>
                      {negocio.horario_apertura && negocio.horario_cierre && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>
                            {negocio.horario_apertura} - {negocio.horario_cierre}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Creado {new Date(negocio.creado_en).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/negocios/${negocio.id_negocio}/personalizar`);
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                        >
                          Personalizar →
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/negocios/${negocio.id_negocio}`);
                          }}
                          className="text-xs text-gray-600 hover:text-gray-700 font-semibold"
                        >
                          Gestionar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL PERFIL USUARIO */}
      {perfilOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setPerfilOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {iniciales || "AC"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {nombreCompleto || username}
                </h2>
                <p className="text-sm text-gray-500">{correo}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700 mb-1">
                  Datos generales
                </p>
                <ul className="space-y-1 text-gray-600">
                  <li>
                    <strong>ID usuario:</strong> {id_usuario}
                  </li>
                  <li>
                    <strong>Username:</strong> {username}
                  </li>
                  <li>
                    <strong>Nombre completo:</strong> {nombreCompleto}
                  </li>
                  <li>
                    <strong>Fecha nacimiento:</strong> {fecha_nacimiento}
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">
                  Cuenta y rol
                </p>
                <ul className="space-y-1 text-gray-600">
                  <li>
                    <strong>Correo:</strong> {correo}
                  </li>
                  <li>
                    <strong>Rol:</strong> {rolTexto}
                  </li>
                  <li>
                    <strong>Tenant / Empresa:</strong> {tenant_id || "N/A"}
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPerfilOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}