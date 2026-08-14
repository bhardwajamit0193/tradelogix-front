// Centralized currency formatting utility for TradeLogix

export const CURRENCY_SYMBOL = '₹';

/**
 * Formats a numerical price or string into a formatted currency string (e.g., ₹299.99)
 * @param {number|string} amount
 * @returns {string} Formatted currency string
 */
export function formatPrice(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `${CURRENCY_SYMBOL}${num.toFixed(2)}`;
}

/**
 * Formats large sales figures into k notation with currency (e.g., ₹18.2k)
 * @param {number} amount
 * @returns {string} Formatted compact currency string
 */
export function formatCompactPrice(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  if (num >= 1000) {
    return `${CURRENCY_SYMBOL}${(num / 1000).toFixed(1)}k`;
  }
  return `${CURRENCY_SYMBOL}${num.toFixed(2)}`;
}
