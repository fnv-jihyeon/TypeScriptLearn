import axios from "axios";
import { userLoginInput, userSignupInput, signupResponse, loginResponse, logoutResponse, sessionResponse } from "@shared/types/user";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // 쿠키를 포함한 요청을 위해 설정
});

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
