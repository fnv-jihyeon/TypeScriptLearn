import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // 쿠키를 포함한 요청을 위해 설정
});
