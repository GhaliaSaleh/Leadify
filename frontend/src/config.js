const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const BASE_URL = API_URL.replace(/\/$/, "");