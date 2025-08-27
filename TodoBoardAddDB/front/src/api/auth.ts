import { api } from "@/lib/api";
import { userLoginInput, userSignupInput, signupResponse, loginResponse, logoutResponse, sessionResponse } from "@shared/types/user";

export const authApi = {
  signup(input: userSignupInput) {
    return api.post<signupResponse>("/auth/signup", input);
  },
  login(input: userLoginInput) {
    return api.post<loginResponse>("/auth/login", input);
  },
  logout() {
    return api.post<logoutResponse>("/auth/logout");
  },
  checkSession() {
    return api.get<sessionResponse>("/auth/session");
  },
};
