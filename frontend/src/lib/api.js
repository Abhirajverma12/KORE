const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('kore_token');
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('kore_token', token);
}

export function removeAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('kore_token');
  localStorage.removeItem('kore_user');
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}: ${response.statusText}`);
  }

  return data;
}
