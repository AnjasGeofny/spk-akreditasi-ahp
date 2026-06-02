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
