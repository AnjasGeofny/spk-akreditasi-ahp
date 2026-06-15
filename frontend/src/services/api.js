const API_BASE = import.meta.env.VITE_API_URL || '/api';


async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    }
    throw error;
  }
}

const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// Criteria
export const criteriaApi = {
  getAll: () => api.get('/criteria'),
  getById: (id) => api.get(`/criteria/${id}`),
  create: (data) => api.post('/criteria', data),
  update: (id, data) => api.put(`/criteria/${id}`, data),
  delete: (id) => api.delete(`/criteria/${id}`),
};

// Sub Criteria
export const subCriteriaApi = {
  getAll: (criteriaId) => api.get(criteriaId ? `/sub-criteria?criteria_id=${criteriaId}` : '/sub-criteria'),
  getById: (id) => api.get(`/sub-criteria/${id}`),
  create: (data) => api.post('/sub-criteria', data),
  update: (id, data) => api.put(`/sub-criteria/${id}`, data),
  delete: (id) => api.delete(`/sub-criteria/${id}`),
};

// Alternatives
export const alternativesApi = {
  getAll: () => api.get('/alternatives'),
  getById: (id) => api.get(`/alternatives/${id}`),
  create: (data) => api.post('/alternatives', data),
  update: (id, data) => api.put(`/alternatives/${id}`, data),
  delete: (id) => api.delete(`/alternatives/${id}`),
};

// Pairwise Comparisons
export const pairwiseApi = {
  getAll: () => api.get('/pairwise-comparisons'),
  save: (comparisons) => api.post('/pairwise-comparisons', { comparisons }),
  deleteAll: () => api.delete('/pairwise-comparisons'),
};

// Sub Criteria Comparisons
export const subCriteriaComparisonApi = {
  getByCriteria: (criteriaId) => api.get(`/sub-criteria-comparisons/${criteriaId}`),
  save: (criteriaId, comparisons) => api.post(`/sub-criteria-comparisons/${criteriaId}`, { comparisons }),
  deleteByCriteria: (criteriaId) => api.delete(`/sub-criteria-comparisons/${criteriaId}`),
};

// Alternative Comparisons (per Sub-Criteria)
export const altComparisonApi = {
  getBySubCriteria: (subCriteriaId) => api.get(`/alternative-comparisons/${subCriteriaId}`),
  save: (subCriteriaId, comparisons) => api.post(`/alternative-comparisons/${subCriteriaId}`, { comparisons }),
  deleteBySubCriteria: (subCriteriaId) => api.delete(`/alternative-comparisons/${subCriteriaId}`),
};

// Assessment Scores
export const assessmentApi = {
  getAll: () => api.get('/assessment-scores'),
  save: (scores) => api.post('/assessment-scores', { scores }),
};

// AHP
export const ahpApi = {
  calculateCriteria: () => api.post('/ahp/calculate-criteria', {}),
  calculateSubCriteria: (criteriaId) => api.post(`/ahp/calculate-sub-criteria/${criteriaId}`, {}),
  calculateAlternatives: () => api.post('/ahp/calculate-alternatives', {}),
  getReadiness: () => api.get('/ahp/readiness'),
  getResults: () => api.get('/ahp/results'),
  getResultById: (id) => api.get(`/ahp/results/${id}`),
};

// Accreditation
export const accreditationApi = {
  calculate: (mode) => api.post('/accreditation/calculate', { mode }),
  getResults: () => api.get('/accreditation/results'),
  getLatest: () => api.get('/accreditation/results/latest'),
};

// Dashboard
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
};

export default api;
