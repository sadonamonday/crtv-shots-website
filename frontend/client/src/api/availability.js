import { buildApiUrl, fetchJson } from '../utils/api';

// Fetch available dates as YYYY-MM-DD strings from backend
export async function fetchAvailableDates({ future = true } = {}) {
  const url = buildApiUrl(`/bookings/getAvailability.php${future ? '?future=1' : ''}`);
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load availability');
    const data = await res.json();
    return Array.isArray(data?.dates) ? data.dates : [];
  } catch (e) {
    return [];
  }
}

export default {
  fetchAvailableDates,
};
