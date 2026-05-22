export const API_BASE = import.meta.env.VITE_API_URL || "";

export function getApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE) {
    return `${API_BASE}${normalizedPath}`;
  }
  return normalizedPath.startsWith("/api") ? normalizedPath : `/api${normalizedPath}`;
}
