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

  // Verificar el tipo de contenido antes de parsear
  const contentType = response.headers.get("content-type");
  let data;
  
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    // Si no es JSON, probablemente es HTML (página de error)
    const text = await response.text();
    console.error("Respuesta no JSON del servidor:", text.substring(0, 200));
    throw { 
      status: response.status, 
      data: { 
        error: "Error del servidor. Revisa la consola para más detalles.",
        detail: "El servidor devolvió una respuesta HTML en lugar de JSON."
      } 
    };
  }

  if (!response.ok) {
    // lanzamos un error con info útil
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

// 🏪 Negocios
const API_NEGOCIOS_URL = import.meta.env.VITE_API_NEGOCIOS_URL || "http://127.0.0.1:8002/api/negocios";

export async function crearNegocio(negocioData) {
  const response = await fetch(`${API_NEGOCIOS_URL}/crear/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(negocioData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}

export async function listarNegocios() {
  const response = await fetch(`${API_NEGOCIOS_URL}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}

export async function obtenerNegocio(idNegocio) {
  const response = await fetch(`${API_NEGOCIOS_URL}/${idNegocio}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}
