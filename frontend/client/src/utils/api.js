// Centralized API URL builder to target the local PHP API host
// Base host for the PHP API (can be overridden via Vite env var VITE_API_BASE)
let API_BASE = 'http://crtvshots-api.local';
try {
  if (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) {
    API_BASE = import.meta.env.VITE_API_BASE;
  }
} catch (_) {}

// Normalize legacy paths (e.g., '/backend/api/gallery/list.php' -> '/gallery/list.php')
function normalizePath(path) {
  if (!path) return '/';
  let p = String(path).trim();
  // Ensure leading slash
  if (!p.startsWith('/')) p = '/' + p;

  // Strip legacy prefixes
  if (p.startsWith('/backend/api/')) {
    p = p.replace('/backend/api/', '/');
  } else if (p.startsWith('/api/')) {
    p = p.replace('/api/', '/');
  }
  return p;
}

export function buildApiUrl(path) {
  const p = normalizePath(path);
  return `${API_BASE}${p}`;
}

// Helper to fetch JSON with consistent base and options
export async function fetchJson(path, options = {}) {
  const url = buildApiUrl(path);
  const res = await fetch(url, { credentials: 'include', headers: { 'Accept': 'application/json', ...(options.headers || {}) }, ...options });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  try {
    return await res.json();
  } catch (e) {
    throw new Error('Failed to parse JSON response');
  }
}

// Helper to upload media (file or URL) to the gallery upload endpoint
export async function uploadMedia({ file, url, title = '', visible = true, sort = 0 } = {}) {
  const form = new FormData();
  if (file) form.append('image', file);
  if (url) form.append('url', url);
  form.append('title', title);
  form.append('visible', visible ? '1' : '0');
  form.append('sort', String(sort || 0));

  const res = await fetch(buildApiUrl('/gallery/upload.php'), {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upload failed ${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  return res.json();
}

export default buildApiUrl;
