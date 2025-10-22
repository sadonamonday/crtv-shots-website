// Utility to format amounts in South African Rand (ZAR)
// Usage: formatZAR(1234.5) => "R 1,234.50"
export function formatZAR(amount) {
  const num = Number(amount);
  if (!isFinite(num)) return String(amount ?? '');
  // Intl will format with symbol R for en-ZA locale
  try {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', currencyDisplay: 'symbol' }).format(num);
  } catch (e) {
    // Fallback simple formatting
    return `R ${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}

export default formatZAR;
