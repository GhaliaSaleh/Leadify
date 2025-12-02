// هذا الكود يختار الرابط تلقائياً بناءً على البيئة
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// نقوم بإزالة العلامة المائلة / من النهاية إذا وجدت لتجنب الأخطاء
export const BASE_URL = API_URL.replace(/\/$/, "");