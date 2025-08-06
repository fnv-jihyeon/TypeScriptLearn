import { Request, Response } from "express";
import {
  AuthErrorCode,
  GeneralErrorCode,
  ValidationErrorCode,
} from "@shared/constants/errorCodes";

interface User {
  username: string;
  email: string;
  password: string;
}

const fakeDB = new Map<string, User>();

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
 *         description: 성공 또는 실패 여부
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   required:
 *                     - username
 *                     - email
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: user123
 *                     email:
 *                       type: string
 *                       example: user123@example.com
 *                 errorCode:
 *                   type: string
 *                   nullable: true
 *                   example: USER_ALREADY_EXISTS
 * @param req
 * @param res
 * @returns
 */
export const signup = (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      errorCode: ValidationErrorCode.REQUIRED_FIELD_MISSING,
    });
  }

  for (const user of fakeDB.values()) {
    if (user.username === username) {
      return res.status(200).json({
        success: false,
        errorCode: AuthErrorCode.USER_ALREADY_EXISTS,
      });
    }

    if (user.email === email) {
      return res.status(200).json({
        success: false,
        errorCode: AuthErrorCode.EMAIL_ALREADY_REGISTERED,
      });
    }
  }

  const newUser: User = { username, email, password };
  fakeDB.set(username, newUser);

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
 *         description: 성공 또는 실패 여부
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                 errorCode:
 *                   type: string
 *                   nullable: true
 *                   example: INVALID_CREDENTIALS
 *
 * @param req
 * @param res
 * @returns
 */
export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      errorCode: AuthErrorCode.INVALID_CREDENTIALS,
    });
  }

  const user = [...fakeDB.values()].find((user) => user.username === username);

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
 *         description: 성공 또는 실패 여부
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 errorCode:
 *                   type: string
 *                   nullable: true
 *                   example: INTERNAL_SERVER_ERROR
 * @param req
 * @param res
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
 *         description: 성공 또는 실패 여부
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                 errorCode:
 *                   type: string
 *                   nullable: true
 *                   example: SESSION_EXPIRED
 *
 * @param req
 * @param res
 * @returns
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
