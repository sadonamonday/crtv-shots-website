// Convert backend YYYY-MM-DD strings into Date objects (local midnight)
export function mapDateStringsToDates(dateStrings = []) {
  const today = startOfDay(new Date());
  return dateStrings
    .map((s) => parseYyyyMmDd(s))
    .filter((d) => d && d >= today);
}

export function parseYyyyMmDd(s) {
  if (typeof s !== 'string') return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const monthIndex = Number(m[2]) - 1; // 0-based
  const day = Number(m[3]);
  const d = new Date(year, monthIndex, day, 0, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
}

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isSameDay(a, b) {
  return (
    a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatYyyyMmDd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
