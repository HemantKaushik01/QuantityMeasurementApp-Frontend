
// ================= BASE URL =================

// Automatically detect if we are running in local development (localhost) or in production
const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// If local, use localhost backend. If deployed, use Render backend (or environment variables)
const BASE_URL = isDevelopment 
  ? "http://localhost:8080/api/v1" 
  : (process.env.REACT_APP_API_URL || "https://quantitymeasurementapp-jczi.onrender.com/api/v1");

const BACKEND_URL = isDevelopment 
  ? "http://localhost:8080" 
  : (process.env.REACT_APP_BACKEND_URL || "https://quantitymeasurementapp-jczi.onrender.com");

// ================= AUTH HEADER =================
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};



// ================= RESPONSE HANDLER =================
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    let errorMsg = "Something went wrong";

    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } else {
      errorMsg = await response.text() || errorMsg;
    }

    throw new Error(errorMsg);
  }

  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

// ========================================
// AUTH API
// ========================================

export const authAPI = {
  // ================= LOGIN =================
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    return handleResponse(response);
  },

  // ================= SIGNUP =================
  signup: async (username, email, password) => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    return handleResponse(response);
  },

  // ================= GOOGLE LOGIN =================
  loginWithGoogle: () => {
    // 🔥 MUST BE REDIRECT (NOT fetch/axios)
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  },

  // ================= LOGOUT =================
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },
};

// ========================================
// QUANTITY API
// ========================================

export const quantityAPI = {
  convert: async (fromValue, fromUnit, toUnit, type) => {
    const body = {
      thisQuantityDTO: {
        value: parseFloat(fromValue),
        unit: fromUnit,
        type,
        targetUnit: toUnit,
      },
      thatQuantityDTO: null,
    };

    const response = await fetch(`${BASE_URL}/quantities/convert`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  compare: async (fromValue, fromUnit, toValue, toUnit, type) => {
    const body = {
      thisQuantityDTO: { value: parseFloat(fromValue), unit: fromUnit, type },
      thatQuantityDTO: { value: parseFloat(toValue), unit: toUnit, type },
    };

    const response = await fetch(`${BASE_URL}/quantities/compare`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  add: async (fromValue, fromUnit, toValue, toUnit, type) => {
    const body = {
      thisQuantityDTO: { value: parseFloat(fromValue), unit: fromUnit, type },
      thatQuantityDTO: { value: parseFloat(toValue), unit: toUnit, type },
    };

    const response = await fetch(`${BASE_URL}/quantities/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  subtract: async (fromValue, fromUnit, toValue, toUnit, type) => {
    const body = {
      thisQuantityDTO: { value: parseFloat(fromValue), unit: fromUnit, type },
      thatQuantityDTO: { value: parseFloat(toValue), unit: toUnit, type },
    };

    const response = await fetch(`${BASE_URL}/quantities/subtract`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  multiply: async (fromValue, fromUnit, toValue, toUnit, type) => {
    const body = {
      thisQuantityDTO: { value: parseFloat(fromValue), unit: fromUnit, type },
      thatQuantityDTO: { value: parseFloat(toValue), unit: toUnit, type },
    };

    const response = await fetch(`${BASE_URL}/quantities/multiply`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  divide: async (fromValue, fromUnit, toValue, toUnit, type) => {
    const body = {
      thisQuantityDTO: { value: parseFloat(fromValue), unit: fromUnit, type },
      thatQuantityDTO: { value: parseFloat(toValue), unit: toUnit, type },
    };

    const response = await fetch(`${BASE_URL}/quantities/divide`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  // ================= HISTORY =================
  getHistoryByOperation: async (operation) => {
    const response = await fetch(
      `${BASE_URL}/quantities/user/history/operation/${operation}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  getHistoryByType: async (type) => {
    const response = await fetch(
      `${BASE_URL}/quantities/user/history/type/${type}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  getErroredHistory: async () => {
    const response = await fetch(
      `${BASE_URL}/quantities/user/history/errored`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  getOperationCount: async (operation) => {
    const response = await fetch(
      `${BASE_URL}/quantities/count/${operation}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },
};

