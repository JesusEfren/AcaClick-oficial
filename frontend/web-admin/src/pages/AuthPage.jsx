// src/pages/AuthPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL; // http://127.0.0.1:8001/api

export default function AuthPage({ initialView = "login" }) {
  const navigate = useNavigate();

  // qué panel se muestra
  const [mode, setMode] = useState(initialView); // "login" | "register"

  /* ---------- Estado LOGIN ---------- */
  const [loginCorreo, setLoginCorreo] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  /* ---------- Estado REGISTRO ---------- */
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [errores, setErrores] = useState(null);
  const [cargando, setCargando] = useState(false);

  /* ---------- LOGIN: submit ---------- */
  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const data = await loginUser({ correo: loginCorreo, password: loginPassword });
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      navigate("/panel");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      // Mostrar el mensaje de error específico del servidor si está disponible
      let errorMessage = "No se pudo iniciar sesión. Verifica correo y contraseña.";
      
      if (err?.data) {
        // Intentar diferentes formatos de error
        if (typeof err.data === 'string') {
          errorMessage = err.data;
        } else if (err.data.detail) {
          errorMessage = err.data.detail;
        } else if (err.data.error) {
          errorMessage = err.data.error;
        } else if (err.data.non_field_errors && err.data.non_field_errors.length > 0) {
          errorMessage = err.data.non_field_errors[0];
        } else if (err.data.correo) {
          errorMessage = Array.isArray(err.data.correo) ? err.data.correo[0] : err.data.correo;
        } else if (err.data.password) {
          errorMessage = Array.isArray(err.data.password) ? err.data.password[0] : err.data.password;
        }
      }
      
      setLoginError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  }

  /* ---------- REGISTRO: submit ---------- */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrores(null);
    setCargando(true);

    try {
      const payload = {
        username: username,
        nombre: nombre,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        fecha_nacimiento: fechaNacimiento,
        correo: correo,
        password: password,
        password2: password2,
        id_rol: 2,
      };

      const resp = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      console.log("Respuesta registro:", data);

      if (!resp.ok) {
        setErrores(data);
        return;
      }

      setMensaje("Usuario registrado correctamente 🎉");
      // si quieres, cambiar a modo login:
      setMode("login");
    } catch (err) {
      console.error(err);
      setMensaje("Error de red al contactar el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const renderError = (campo) =>
    errores && errores[campo] ? (
      <p className="text-red-600 text-sm mt-1">
        {Array.isArray(errores[campo]) ? errores[campo].join(" ") : errores[campo]}
      </p>
    ) : null;

  const wrapperClass =
    "forms-wrapper " + (mode === "register" ? "show-register" : "");

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="auth-container">
        <div className={wrapperClass}>
          {/* ---------- PANEL LOGIN ---------- */}
          <div className="form-panel flex">
            {/* Login Form */}
            <div className="w-full lg:w-3/5 flex items-center justify-center p-8 lg:p-12">
              <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center gap-3 mb-6">
                    <Link to="/">
                      <img
                        src="/imagenes/AcaClickHsinfondo.png"
                        alt="AcaClick Logo"
                        className="h-12"
                      />
                    </Link>
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 mb-3">
                    ¡Bienvenido de nuevo!
                  </h2>
                  <p className="text-gray-600">
                    Inicia sesión para acceder a tu panel
                  </p>
                </div>

                {loginError && (
                  <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-800 px-4 py-2 text-sm">
                    {loginError}
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleLoginSubmit}>
                  <div className="input-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="tucorreo@ejemplo.com"
                        className="form-input w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                        value={loginCorreo}
                        onChange={(e) => setLoginCorreo(e.target.value)}
                        required
                      />
                      <span className="material-symbols-outlined input-icon">
                        mail
                      </span>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="form-input w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <span className="material-symbols-outlined input-icon">
                        lock
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-600">Recordarme</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="btn-gradient w-full h-14 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center disabled:opacity-60"
                  >
                    {loginLoading ? "Ingresando..." : "Iniciar Sesión"}
                  </button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      O continúa con
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="social-btn h-12 rounded-xl bg-white flex items-center justify-center gap-2 font-semibold text-gray-700"
                  >
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    Google
                  </button>
                  <button
                    type="button"
                    className="social-btn h-12 rounded-xl bg-white flex items-center justify-center gap-2 font-semibold text-gray-700"
                  >
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                </div>

                <p className="text-center mt-8 text-gray-600">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="font-bold text-orange-500 hover:text-orange-600 transition"
                  >
                    Regístrate gratis
                  </button>
                </p>
              </div>
            </div>

            {/* Login Side Panel */}
            <div className="hidden lg:flex lg:w-2/5 gradient-bg items-center justify-center p-12 text-white side-panel">
              <div className="floating-shapes">
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
              </div>
              <div className="text-center relative z-10">
                <h2 className="text-5xl font-black mb-6 leading-tight">
                  ¿Nuevo en AcaClick?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Crea tu tienda online en minutos. ¡Es gratis y fácil!
                </p>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-opacity-90 transition transform hover:scale-105 shadow-2xl"
                >
                  Crear Cuenta Gratis
                </button>
              </div>
            </div>
          </div>

          {/* ---------- PANEL REGISTRO ---------- */}
          <div className="form-panel flex">
            {/* Register Side Panel */}
            <div className="hidden lg:flex lg:w-2/5 gradient-bg items-center justify-center p-12 text-white side-panel">
              <div className="floating-shapes">
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
              </div>
              <div className="text-center relative z-10">
                <h2 className="text-5xl font-black mb-6 leading-tight">
                  ¿Ya tienes cuenta?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Inicia sesión y continúa administrando tu negocio
                </p>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="px-8 py-4 bg-white text-orange-500 rounded-full font-bold text-lg hover:bg-opacity-90 transition transform hover:scale-105 shadow-2xl inline-block"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>

            {/* Register Form */}
            <div className="w-full lg:w-3/5 flex items-center justify-center p-8 lg:p-12">
              <div className="w-full max-w-2xl scroll-container">
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center gap-3 mb-6">
                    <Link to="/">
                      <img
                        src="/imagenes/AcaClickHsinfondo.png"
                        alt="AcaClick Logo"
                        className="h-12"
                      />
                    </Link>
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 mb-3">
                    Crea tu cuenta
                  </h2>
                  <p className="text-gray-600">
                    Únete a miles de emprendedores exitosos
                  </p>
                </div>

                {mensaje && (
                  <div className="mb-4 rounded-md bg-green-50 border border-green-200 text-green-800 px-4 py-2 text-sm">
                    {mensaje}
                  </div>
                )}

                {errores && typeof errores.detail === "string" && (
                  <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-800 px-4 py-2 text-sm">
                    {errores.detail}
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="input-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Usuario (username)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="juan123"
                          className="form-input w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                        <span className="material-symbols-outlined input-icon text-sm">
                          account_circle
                        </span>
                      </div>
                      {renderError("username")}
                    </div>

                    <div className="input-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Juan"
                          className="form-input w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          required
                        />
                        <span className="material-symbols-outlined input-icon text-sm">
                          person
                        </span>
                      </div>
                      {renderError("nombre")}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="input-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Apellido paterno
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Pérez"
                          className="form-input w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                          value={apellidoPaterno}
                          onChange={(e) => setApellidoPaterno(e.target.value)}
                          required
                        />
                        <span className="material-symbols-outlined input-icon text-sm">
                          badge
                        </span>
                      </div>
                      {renderError("apellido_paterno")}
                    </div>

                    <div className="input-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Apellido materno
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="García"
                          className="form-input w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                          value={apellidoMaterno}
                          onChange={(e) => setApellidoMaterno(e.target.value)}
                        />
                        <span className="material-symbols-outlined input-icon text-sm">
                          badge
                        </span>
                      </div>
                      {renderError("apellido_materno")}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="input-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha de nacimiento
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          className="form-input w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                          value={fechaNacimiento}
                          onChange={(e) => setFechaNacimiento(e.target.value)}
                          required
                        />
                        <span className="material-symbols-outlined input-icon text-sm">
                          calendar_today
                        </span>
                      </div>
                      {renderError("fecha_nacimiento")}
                    </div>

                    {/* Teléfono opcional: aún no lo envías al backend */}
                    <div className="input-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="555-123-4567"
                          className="form-input w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                        />
                        <span className="material-symbols-outlined input-icon text-sm">
                          phone
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="tucorreo@ejemplo.com"
                        className="form-input w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                      />
                      <span className="material-symbols-outlined input-icon text-sm">
                        mail
                      </span>
                    </div>
                    {renderError("correo")}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="input-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="form-input w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <span className="material-symbols-outlined input-icon text-sm">
                          lock
                        </span>
                      </div>
                      {renderError("password")}
                    </div>

                    <div className="input-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirmar contraseña
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="form-input w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                          value={password2}
                          onChange={(e) => setPassword2(e.target.value)}
                          required
                        />
                        <span className="material-symbols-outlined input-icon text-sm">
                          lock
                        </span>
                      </div>
                      {renderError("password2")}
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      className="w-5 h-5 mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      required
                    />
                    <span className="text-sm text-gray-600">
                      Acepto los{" "}
                      <span className="text-purple-600 font-semibold hover:underline">
                        Términos y Condiciones
                      </span>{" "}
                      y la{" "}
                      <span className="text-purple-600 font-semibold hover:underline">
                        Política de Privacidad
                      </span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={cargando}
                    className="btn-gradient w-full h-14 rounded-xl text-white font-bold text-lg shadow-lg mt-6 flex items-center justify-center disabled:opacity-60"
                  >
                    {cargando ? "Creando cuenta..." : "Crear Cuenta"}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      O regístrate con
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="social-btn h-12 rounded-xl bg-white flex items-center justify-center gap-2 font-semibold text-gray-700"
                  >
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    Google
                  </button>
                  <button
                    type="button"
                    className="social-btn h-12 rounded-xl bg-white flex items-center justify-center gap-2 font-semibold text-gray-700"
                  >
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                </div>

                <p className="text-center mt-6 text-gray-600">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="font-bold text-orange-500 hover:text-orange-600 transition"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
