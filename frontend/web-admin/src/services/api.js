// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

// 🔐 Login: devuelve { access, refresh }
export async function loginUser({ correo, password }) {
  const response = await fetch(`${API_URL}/auth/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ correo, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}

// 👤 Traer información del usuario logueado
export async function getCurrentUser(accessToken) {
  const response = await fetch(`${API_URL}/auth/me/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data; // aquí viene id_usuario, correo, nombre, rol, etc.
}

// ================== NEGOCIOS ==================

const API_NEGOCIOS_URL =
  import.meta.env.VITE_API_NEGOCIOS_URL ||
  "http://127.0.0.1:8002/api/negocios";

// 📌 (opcional) Listar TODOS los negocios
export async function listarNegocios() {
  const response = await fetch(`${API_NEGOCIOS_URL}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Error listando negocios:", data);
    throw data;
  }

  return data;
}

// 🏪 Listar negocios de un usuario específico
export async function listarNegociosUsuario(idUsuario) {
  const response = await fetch(`${API_NEGOCIOS_URL}/usuario/${idUsuario}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // si luego quieres protegerlo:
      // Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Error listando negocios del usuario:", data);
    throw data;
  }

  return data; // array de negocios
}
