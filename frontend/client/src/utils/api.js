// Centralized API URL builder to target the local PHP API host
// Base host for the PHP API
const API_BASE = 'http://crtvshots-api.local';

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
  const res = await fetch(url, { credentials: 'include', ...options });
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

export default buildApiUrl;
