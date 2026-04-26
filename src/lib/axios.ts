import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for HTTP-only cookies
});

// Optional: Add response interceptors for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message extraction
    const message = error.response?.data?.message || "Something went wrong";
    return Promise.reject({ ...error, message });
  }
);

export default axiosInstance;
