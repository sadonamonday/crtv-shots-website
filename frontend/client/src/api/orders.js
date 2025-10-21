import { fetchJson, buildApiUrl } from '../utils/api';

export async function listOrders(params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
  }
  return fetchJson(`/orders/getOrders.php${q.toString() ? `?${q.toString()}` : ''}`);
}

export async function getOrder(id) {
  return fetchJson(`/orders/getOrder.php?id=${encodeURIComponent(id)}`);
}

export async function createOrder(payload) {
  return fetchJson('/orders/createOrder.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
}

export async function updateOrder(id, updates) {
  const body = { ...(updates || {}), id };
  return fetchJson('/orders/updateOrder.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function deleteOrder(id) {
  // Use POST + _method=DELETE for broader compatibility
  return fetchJson(`/orders/deleteOrder.php?_method=DELETE&id=${encodeURIComponent(id)}`, {
    method: 'POST',
  });
}

export default {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
};
