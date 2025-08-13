import type { ApiResult } from "@shared/types/api";

export interface user {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export type userSession = Pick<user, "id" | "username" | "email">;

export interface userSignupInput {
  username: string;
  email: string;
  password: string;
}

export interface userLoginInput {
  username: string;
  password: string;
}

export interface successResponse {
  message: string;
}

export interface failResponse {
  success: false;
  errorCode: string;
}

export type signupResponse = ApiResult<{ user: userSession }>;
export type loginResponse = ApiResult<{ user: userSession }>;
export type logoutResponse = ApiResult<{}>;
export type sessionResponse = ApiResult<{ user: userSession | null }>;
