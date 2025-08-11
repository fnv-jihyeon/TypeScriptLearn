import { Request, Response } from "express";
import { userDB, User } from "@/data/fakeUserDB";
import {
  AuthErrorCode,
  GeneralErrorCode,
  ValidationErrorCode,
} from "@shared/constants/errorCodes";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 관련 API
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: 사용자 회원가입
 *     description: 새로운 사용자를 등록합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: user123
 *               email:
 *                 type: string
 *                 example: user123@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: 회원가입 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 errorCode:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: 필수 입력 누락
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorCode:
 *                   type: string
 *                   example: REQUIRED_FIELD_MISSING
 */
export const signup = (req: Request, res: Response) => {
  console.log("req.body:", req.body);

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      errorCode: ValidationErrorCode.REQUIRED_FIELD_MISSING,
    });
  }

  const isUsernameExists = [...userDB.values()].some(
    (user) => user.username === username
  );
  const isEmailExists = [...userDB.values()].some(
    (user) => user.email === email
  );

  if (isUsernameExists) {
    return res.status(200).json({
      success: false,
      errorCode: AuthErrorCode.USER_ALREADY_EXISTS,
    });
  }

  if (isEmailExists) {
    return res.status(200).json({
      success: false,
      errorCode: AuthErrorCode.EMAIL_ALREADY_REGISTERED,
    });
  }

  const newUser: User = { username, email, password };
  userDB.set(username, newUser);

  const { password: _, ...safeUser } = newUser; // 비밀번호 제외
  console.log("새로운 사용자 등록:", safeUser);

  return res.status(200).json({
    success: true,
    user: safeUser,
  });
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     description: 사용자 입력정보로 인증합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: user123
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공 또는 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 errorCode:
 *                   type: string
 *                   nullable: true
 *                   example: INVALID_CREDENTIALS
 *       400:
 *         description: 필수 입력 누락
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorCode:
 *                   type: string
 *                   example: INVALID_CREDENTIALS
 */
export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      errorCode: AuthErrorCode.INVALID_CREDENTIALS,
    });
  }

  const user = [...userDB.values()].find((user) => user.username === username);

  if (!user || user.password !== password) {
    return res.status(200).json({
      success: false,
      errorCode: AuthErrorCode.INVALID_CREDENTIALS,
    });
  }

  req.session.user = {
    username: user.username,
    email: user.email,
  };

  return res.status(200).json({
    success: true,
    user: req.session.user,
  });
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: 현재 세션을 삭제합니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: 서버 오류로 인한 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorCode:
 *                   type: string
 *                   example: INTERNAL_SERVER_ERROR
 */
export const logout = (req: Request, res: Response) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        success: false,
        errorCode: GeneralErrorCode.INTERNAL_SERVER_ERROR,
      });
    }

    res.clearCookie("connect.sid"); // 세션 쿠키 삭제
    return res.status(200).json({
      success: true,
    });
  });
};

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: 세션 검사
 *     description: 현재 사용자 정보가 유지되는지 확인합니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 세션 유효 여부 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 errorCode:
 *                   type: string
 *                   nullable: true
 *                   example: SESSION_EXPIRED
 */
export const checkSession = (req: Request, res: Response) => {
  if (req.session.user) {
    return res.status(200).json({
      success: true,
      user: req.session.user,
    });
  }

  return res.status(200).json({
    success: false,
    errorCode: AuthErrorCode.SESSION_EXPIRED,
  });
};
