const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  me: (token) => request("/auth/me", { token }),

  getStats: (token) => request("/admin/stats", { token }),

  listOrders: (token, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });
    const qs = query.toString();
    return request(`/admin/orders${qs ? `?${qs}` : ""}`, { token });
  },

  getOrder: (token, orderId) =>
    request(`/admin/orders/${orderId}`, { token }),

  updateOrderStatus: (token, orderId, status) =>
    request(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      token,
      body: { status },
    }),

  assignWriter: (token, orderId, writerId) =>
    request(`/admin/orders/${orderId}/assign-writer`, {
      method: "PATCH",
      token,
      body: { writerId },
    }),

  updatePrice: (token, orderId, body) =>
    request(`/orders/${orderId}/price`, {
      method: "PATCH",
      token,
      body,
    }),

  generatePaymentLink: (token, orderId) =>
    request(`/payments/orders/${orderId}/payment-link`, {
      method: "POST",
      token,
    }),

  listStaff: (token, params = {}) => {
    const query = new URLSearchParams(params);
    const qs = query.toString();
    return request(`/admin/staff${qs ? `?${qs}` : ""}`, { token });
  },

  createStaff: (token, body) =>
    request("/admin/staff", {
      method: "POST",
      token,
      body,
    }),

  updateStaffStatus: (token, userId, isActive) =>
    request(`/admin/staff/${userId}/status`, {
      method: "PATCH",
      token,
      body: { isActive },
    }),

  updateStaffRole: (token, userId, role) =>
    request(`/admin/staff/${userId}/role`, {
      method: "PATCH",
      token,
      body: { role },
    }),

  listWriters: (token) => request("/admin/writers", { token }),

  listStudents: (token, params = {}) => {
    const query = new URLSearchParams(params);
    const qs = query.toString();
    return request(`/admin/students${qs ? `?${qs}` : ""}`, { token });
  },

  createStudent: (token, body) =>
    request("/admin/students", {
      method: "POST",
      token,
      body,
    }),

  getStudent: (token, userId) =>
    request(`/admin/students/${userId}`, { token }),

  updateStudent: (token, userId, body) =>
    request(`/admin/students/${userId}`, {
      method: "PATCH",
      token,
      body,
    }),

  updateStudentStatus: (token, userId, isActive) =>
    request(`/admin/students/${userId}/status`, {
      method: "PATCH",
      token,
      body: { isActive },
    }),
};
