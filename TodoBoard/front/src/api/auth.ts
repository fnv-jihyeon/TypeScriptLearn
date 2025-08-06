import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true, // 쿠키를 포함한 요청을 위해 설정
});

export async function login(username: string, password: string) {
  return await api.post('/auth/login', { username, password });
}

export async function logout() {
  return await api.post('/auth/logout');
}

export async function checkSession() {
  return await api.get('/auth/session');
}

export async function signup(username: string, email: string, password: string) {
  return await api.post('/auth/signup', { username, email, password });
}

export async function withdraw() {
  return await api.delete('/auth/withdraw');
}

export default api;