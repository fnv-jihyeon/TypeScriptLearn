import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as authApi from '@/api/auth';

export const useSessionStore = defineStore('session', () => {
  const user = ref<{ username: string } | null>(null);

  async function login(username: string, password: string) {
    const res = await authApi.login(username, password);
    user.value = res.data.user;
  }

  async function logout() {
    await authApi.logout();
    user.value = null;
  }

  async function checkSession() {
    try {
      const res = await authApi.checkSession();
      user.value = res.data.user;
    } catch (error) {
      user.value = null;
    }
  }

  async function signup(username: string, email: string, password: string) {
    const res = await authApi.signup(username, email, password);
  }

  async function withdraw() {
    await authApi.withdraw();
    user.value = null;
  }

  return { user, login, logout, checkSession, signup, withdraw };
});