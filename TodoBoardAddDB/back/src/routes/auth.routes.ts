import { Router } from "express";
import { signup, login, logout, checkSession, changePassword } from "./auth.controller";
import { loginRateLimit } from "../middleware/rateLimit";

const router = Router();

/**
 * @route POST api/auth/signup
 * @desc 사용자 회원가입
 */
router.post("/signup", signup);

/**
 * @route POST api/auth/login
 * @desc 사용자 로그인
 */
router.post("/login", loginRateLimit, login);

/**
 * @route POST api/auth/logout
 * @desc 사용자 로그아웃
 */
router.post("/logout", logout);

/**
 * @route GET api/auth/check-session
 * @desc 사용자 세션 확인
 */
router.get("/session", checkSession);

/**
 * @route POST api/auth/change-password
 * @desc 사용자 비밀번호 변경
 */
router.post("/change-password", changePassword);

export default router;
