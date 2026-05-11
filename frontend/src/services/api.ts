import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: object) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
};

// Products
export const productApi = {
  getAll: (params: object) => api.get('/products', { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  addReview: (id: string, data: { rating: number; comment: string }) =>
    api.post(`/products/${id}/reviews`, data),
};

// Cart
export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId: string, quantity?: number) => api.post('/cart', { productId, quantity }),
  update: (productId: string, quantity: number) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId: string) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart/clear'),
};

// Orders
export const orderApi = {
  create: (data: { shippingAddress: object }) => api.post('/orders', data),
  getMyOrders: (page?: number) => api.get('/orders', { params: { page } }),
  getOne: (id: string) => api.get(`/orders/${id}`),
};

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  createProduct: (form: FormData) => api.post('/admin/products', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id: string, form: FormData) => api.put(`/admin/products/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  getAllOrders: (params: object) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, status: string) => api.put(`/admin/orders/${id}/status`, { status }),
};
