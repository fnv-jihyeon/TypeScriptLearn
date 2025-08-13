import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "@/api/auth";
import type { ERROR_CODES } from "@shared/constants/errorCodes";
import type { userSession, userLoginInput, userSignupInput } from "@shared/types/user";

function errorCodeFrom(e: any, fallback: ERROR_CODES): ERROR_CODES {
  return (e?.response?.data?.errorCode || e?.data?.errorCode || fallback) as ERROR_CODES;
}

export const useSessionStore = defineStore("session", () => {
  const user = ref<userSession | null>(null);
  const isLoading = ref(false);
  const isLoaded = ref(false);
  const isLoggedIn = computed(() => !!user.value);

  async function signup(username: string, email: string, password: string) {
    isLoading.value = true;
    try {
      const { data } = await authApi.signup({ username, email, password } as userSignupInput);
      if (!data.success) {
        throw new Error(data.errorCode as ERROR_CODES);
      }
      user.value = data.user;
      isLoaded.value = true;
      return data;
    } catch (error: any) {
      throw new Error(errorCodeFrom(error, "UNKNOWN_ERROR" as ERROR_CODES));
    } finally {
      isLoading.value = false;
    }
  }

  async function login(username: string, password: string) {
    isLoading.value = true;
    try {
      const { data } = await authApi.login({ username, password } as userLoginInput);

      if (!data.success) {
        throw new Error(data.errorCode as ERROR_CODES);
      }
      user.value = data.user;
      isLoaded.value = true;
      return data;
    } catch (error: any) {
      throw new Error(errorCodeFrom(error, "UNKNOWN_ERROR" as ERROR_CODES));
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    try {
      const { data } = await authApi.logout();
      if (!data.success) {
        throw new Error(data.errorCode as ERROR_CODES);
      }
      user.value = null;
      isLoaded.value = false;
      return data;
    } catch (error: any) {
      throw new Error(errorCodeFrom(error, "UNKNOWN_ERROR" as ERROR_CODES));
    } finally {
      isLoading.value = false;
    }
  }

  async function checkSession() {
    isLoading.value = true;
    try {
      const { data } = await authApi.checkSession();
      if (!data.success) {
        throw new Error(data.errorCode as ERROR_CODES);
      }

      user.value = data.user ?? null;
      isLoaded.value = true;
      return !!user.value;
    } catch (error: any) {
      user.value = null;
      isLoaded.value = false;

      throw new Error(errorCodeFrom(error, "UNKNOWN_ERROR" as ERROR_CODES));
    } finally {
      isLoading.value = false;
    }
  }

  function reset() {
    user.value = null;
    isLoading.value = false;
    isLoaded.value = false;
  }

  return { user, signup, login, logout, checkSession, reset, isLoading, isLoaded, isLoggedIn };
});
