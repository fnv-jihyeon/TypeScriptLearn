import { Router } from 'express';
import { signup, login, logout, checkSession } from './auth.controller';

const router = Router();

/**
 * @route POST api/auth/signup
 * @desc 사용자 회원가입
 */
router.post('/signup', signup);

/**
 * @route POST api/auth/login
 * @desc 사용자 로그인
 */
router.post('/login', login);

/**
 * @route POST api/auth/logout
 * @desc 사용자 로그아웃
 */
router.post('/logout', logout);

/**
 * @route GET api/auth/check-session
 * @desc 사용자 세션 확인
 */
router.get('/session', checkSession);

export default router;
