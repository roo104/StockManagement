/**
 * Format large currency values with B (billions), M (millions), and T (trillions) suffixes
 */
export const formatCurrency = (value: number | undefined, currency: string = 'USD'): string => {
  if (value === undefined || value === null) return 'N/A';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  // Format with suffixes for large numbers
  if (absValue >= 1e12) {
    return `${sign}$${(absValue / 1e12).toFixed(2)}T`;
  } else if (absValue >= 1e9) {
    return `${sign}$${(absValue / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}$${(absValue / 1e6).toFixed(2)}M`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format numeric values with specified decimal places
 */
export const formatNumber = (value: number | undefined, decimals: number = 2): string => {
  if (value === undefined || value === null) return 'N/A';
  return value.toFixed(decimals);
};

/**
 * Format percentage values
 */
export const formatPercent = (value: number | undefined): string => {
  if (value === undefined || value === null) return 'N/A';
  return `${(value * 100).toFixed(2)}%`;
};

/**
 * Format date strings
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
