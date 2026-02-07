
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";


export function getAuthHeaders(token) {
  const t = token ?? localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (t) headers.Authorization = `Bearer ${t}`;
  return headers;
}


export async function apiRequest(path, options = {}) {
  const { token, ...fetchOptions } = options;
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = {
    ...getAuthHeaders(token),
    ...(fetchOptions.headers || {}),
  };
  return fetch(url, { ...fetchOptions, headers });
}

export async function apiGet(path, options = {}) {
  const res = await apiRequest(path, { ...options, method: "GET" });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost(path, body, options = {}) {
  const res = await apiRequest(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPut(path, body = null, options = {}) {
  const fetchOptions = { ...options, method: "PUT" };
  if (body != null) fetchOptions.body = JSON.stringify(body);
  const res = await apiRequest(path, fetchOptions);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Request failed: ${res.status}`);
  }
  return res.json();
}
