import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  // The auth token lives in an httpOnly cookie, not JS-readable storage —
  // this is what makes the browser actually send/receive it.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
