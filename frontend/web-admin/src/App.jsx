// src/App.jsx
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import PanelPage from "./pages/PanelPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";   // 👈 combinado
import NuevoNegocioPage from "./pages/NuevoNegocioPage.jsx";
import PersonalizarTiendaPage from "./pages/PersonalizarTiendaPage.jsx";



export default function App() {
  return (
    <Routes>
      {/* Landing: usa TODO el diseño nuevo con su propio header/footer */}
      <Route path="/" element={<HomePage />} />

      {/* Auth combinado: SIN AdminLayout porque ya trae su propio diseño */}
      <Route path="/login" element={<AuthPage initialView="login" />} />
      <Route path="/register" element={<AuthPage initialView="register" />} />

      {/* 🔥 Panel admin A PANTALLA COMPLETA, sin AdminLayout */}
      <Route path="/panel" element={<PanelPage />} />
      
      {/* Negocios */}
      <Route path="/negocios/nuevo" element={<NuevoNegocioPage />} />
      <Route path="/negocios/:idNegocio/personalizar" element={<PersonalizarTiendaPage />} />
    </Routes>
  );
}
