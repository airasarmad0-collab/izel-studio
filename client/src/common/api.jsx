import axios from "axios";

const apiBase = axios.create({
  baseURL: import.meta.env.API_LINK,
  headers: { "Content-Type": "application/json" },
});

// ✅ Request interceptor – attach token
apiBase.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ Response interceptor – handle 401 (Unauthorized)
apiBase.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      localStorage.removeItem("isAdminLoggedIn");

      // Redirect to login page (if not already there)
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiBase;
