export const formatNumber = (num, decimals = 4) => {
  if (num === null || num === undefined) return '-';
  return Number(num).toFixed(decimals);
};

export const formatPercent = (num) => {
  if (num === null || num === undefined) return '-';
  return `${Number(num).toFixed(2)}%`;
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Sangat Siap': return 'badge-success';
    case 'Siap': return 'badge-info';
    case 'Cukup Siap': return 'badge-warning';
    case 'Belum Siap': return 'badge-danger';
    default: return 'badge-info';
  }
};

export const getConsistencyBadge = (isConsistent) => {
  return isConsistent ? 'badge-success' : 'badge-danger';
};

/**
 * Sort array by numeric part of code (e.g. A1, A2, ..., A10, A14)
 */
export const sortByCode = (list) => {
  return [...list].sort((a, b) => {
    const numA = parseInt(a.code.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.code.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });
};
