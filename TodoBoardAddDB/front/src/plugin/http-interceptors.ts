import { api } from "@/lib/api";
import router from "@/router";

export function installHttpIntercedptors() {
  api.interceptors.response.use(
    (r) => r,
    (err) => {
      const s = err?.response?.status;
      const code = err?.response?.data?.errorCode;

      if (!err.response) {
        return Promise.reject(err);
      }

      if (s === 401) {
        router.push({ name: "login" });
        return Promise.reject(err);
      }

      return Promise.reject(err);
    }
  );
}
