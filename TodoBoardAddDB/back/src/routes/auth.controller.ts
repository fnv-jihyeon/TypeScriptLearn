import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AuthErrorCode, GeneralErrorCode, ValidationErrorCode } from "@shared/constants/errorCodes";

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
export const signup = async (req: Request, res: Response) => {
  console.log("req.body:", req.body);

  const { username, email, password } = req.body as { username?: string; email?: string; password?: string };

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      errorCode: ValidationErrorCode.REQUIRED_FIELD_MISSING,
    });
  }

  try {
    // 중복 체크(선제)
    const [byUsername, byEmail] = await Promise.all([prisma.user.findUnique({ where: { username } }), prisma.user.findUnique({ where: { email } })]);
    if (byUsername) {
      return res.status(200).json({ success: false, errorCode: AuthErrorCode.USER_ALREADY_EXISTS });
    }
    if (byEmail) {
      return res.status(200).json({ success: false, errorCode: AuthErrorCode.EMAIL_ALREADY_REGISTERED });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    console.log("새로운 사용자 등록:", user);

    req.session.regenerate((err) => {
      if (err) {
        console.error("세션 초기화 실패:", err);
        return res.status(500).json({
          success: false,
          errorCode: GeneralErrorCode.INTERNAL_SERVER_ERROR,
        });
      }

      req.session.user = { id: user.id, username: user.username, email: user.email };
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("세션 저장 실패:", saveErr);
          return res.status(500).json({
            success: false,
            errorCode: GeneralErrorCode.INTERNAL_SERVER_ERROR,
          });
        }
        return res.status(200).json({ success: true, user });
      });
    });
  } catch (e: any) {
    // Prisma unique 오류 방어(P2002)
    if (e?.code === "P2002") {
      const target: string = Array.isArray(e?.meta?.target) ? e.meta.target.join(",") : String(e?.meta?.target ?? "");
      if (target.includes("username")) {
        return res.status(200).json({ success: false, errorCode: AuthErrorCode.USER_ALREADY_EXISTS });
      }
      if (target.includes("email")) {
        return res.status(200).json({ success: false, errorCode: AuthErrorCode.EMAIL_ALREADY_REGISTERED });
      }
      return res.status(200).json({ success: false, errorCode: AuthErrorCode.USER_ALREADY_EXISTS });
    }
    console.error(e);
    return res.status(500).json({ success: false, errorCode: GeneralErrorCode.INTERNAL_SERVER_ERROR });
  }
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
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      errorCode: ValidationErrorCode.REQUIRED_FIELD_MISSING,
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(200).json({ success: false, errorCode: AuthErrorCode.INVALID_CREDENTIALS });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(200).json({ success: false, errorCode: AuthErrorCode.INVALID_CREDENTIALS });
    }

    const sessionUser = { id: user.id, username: user.username, email: user.email };

    req.session.regenerate((err) => {
      if (err) {
        console.error("session regenerate error:", err);
        return res.status(500).json({ success: false, errorCode: GeneralErrorCode.INTERNAL_SERVER_ERROR });
      }
      req.session.user = sessionUser;
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("session save error:", saveErr);
          return res.status(500).json({ success: false, errorCode: GeneralErrorCode.INTERNAL_SERVER_ERROR });
        }
        return res.status(200).json({ success: true, user: sessionUser });
      });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, errorCode: GeneralErrorCode.INTERNAL_SERVER_ERROR });
  }
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
      return res.status(500).json({ success: false, errorCode: GeneralErrorCode.INTERNAL_SERVER_ERROR });
    }
    res.clearCookie("sid"); // 쿠키 이름이 다르면 맞춰 변경
    return res.status(200).json({ success: true });
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
    return res.status(200).json({ success: true, user: req.session.user });
  }
  return res.status(200).json({ success: false, errorCode: AuthErrorCode.SESSION_EXPIRED });
};

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: 비밀번호 변경
 *     description: 로그인된 사용자의 비밀번호를 변경합니다. (세션 쿠키 필요)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: secret12
 *               newPassword:
 *                 type: string
 *                 example: newSecret34
 *     responses:
 *       200:
 *         description: 변경 성공 또는 비밀번호 불일치
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
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
 *                 message:
 *                   type: string
 *                   example: REQUIRED_FIELD_MISSING
 *       401:
 *         description: 인증되지 않음(세션 없음)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: 서버 오류
 */
export const changePassword = async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, errorCode: AuthErrorCode.UNAUTHORIZED });
  }

  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      errorCode: ValidationErrorCode.REQUIRED_FIELD_MISSING,
    });
  }

  /**
   * 현재 비밀번호와 새 비밀번호를 확인합니다.
   */
  const user = await prisma.user.findUnique({ where: { id: req.session.user.id } });

  if (!user) {
    return res.status(404).json({ success: false, errorCode: AuthErrorCode.USER_NOT_FOUND });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, errorCode: AuthErrorCode.INVALID_CREDENTIALS });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  return res.status(200).json({ success: true });
};
