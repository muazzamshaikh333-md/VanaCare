// Thin fetch wrapper around the VanaCare backend. Change API_BASE if your
// server runs somewhere other than localhost:5000.
const API_BASE = 'http://localhost:5000/api';

function authToken() {
  return localStorage.getItem('vc_token');
}

async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = authToken();
    if (token) headers.Authorization = 'Bearer ' + token;
  }
  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Could not reach the VanaCare server. Is the backend running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

const Api = {
  register: (payload) => api('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => api('/auth/login', { method: 'POST', body: payload }),

  products: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api('/products' + (qs ? '?' + qs : ''));
  },
  stores: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api('/stores' + (qs ? '?' + qs : ''));
  },
  nearestStore: (system) => api('/stores/nearest?system=' + encodeURIComponent(system)),

  createOrder: (payload) => api('/orders', { method: 'POST', body: payload, auth: true }),
  myOrders: () => api('/orders', { auth: true }),
};
