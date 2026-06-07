import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
};

export const recipeApi = {
  getList: (params) => api.get('/recipes', { params }),
  getOne: (id) => api.get(`/recipes/${id}`),
  getMy: (params) => api.get('/recipes/my', { params }),
  create: (data) => api.post('/recipes', data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
  fork: (id) => api.post(`/recipes/${id}/fork`),
  shareToGroup: (recipeId, groupId) => api.post(`/recipes/${recipeId}/share/${groupId}`),
  getAccessible: (params) => api.get('/recipes/accessible', { params }),
};

export const commitApi = {
  getHistory: (recipeId) => api.get(`/recipes/${recipeId}/commits`),
  compare: (commitAId, commitBId) => api.get('/commits/compare', { params: { commitAId, commitBId } }),
  restore: (recipeId, commitId) => api.post(`/recipes/${recipeId}/commits/${commitId}/restore`),
};

export const prApi = {
  create: (data) => api.post('/pull-requests', data),
  getAll: () => api.get('/pull-requests'),
  getMy: () => api.get('/pull-requests/my'),
  getIncoming: (recipeId) => api.get(`/pull-requests/incoming/${recipeId}`),
  approve: (id) => api.post(`/pull-requests/${id}/approve`),
  reject: (id, reason) => api.post(`/pull-requests/${id}/reject`, { reason }),
};

export const bookmarkApi = {
  toggle: (recipeId) => api.post(`/bookmarks/${recipeId}/toggle`),
  status: (recipeId) => api.get(`/bookmarks/${recipeId}/status`),
  getMy: () => api.get('/bookmarks/my'),
};

export const searchApi = {
  autocomplete: (prefix) => api.get('/search/autocomplete', { params: { prefix } }),
};

export default api;

export const rankingApi = {
  getTop: () => api.get('/ranking'),
  getViews: (recipeId) => api.get(`/ranking/${recipeId}/views`),
};

export const groupApi = {
  create: (data) => api.post('/groups', data),
  getMy: () => api.get('/groups/my'),
  getOne: (groupId) => api.get(`/groups/${groupId}`),
  invite: (groupId, email) => api.post(`/groups/${groupId}/invite`, { email }),
  getMembers: (groupId) => api.get(`/groups/${groupId}/members`),
  removeMember: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}`),
  getPendingInvites: () => api.get('/groups/invites/pending'),
  respondInvite: (memberId, accept) => api.post(`/groups/invites/${memberId}/respond?accept=${accept}`),
  getGroupRecipes: (groupId, params) => api.get(`/recipes/group/${groupId}`, { params }),
};
