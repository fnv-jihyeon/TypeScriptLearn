import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ScheduleErrorCode, GeneralErrorCode, ValidationErrorCode } from "@shared/constants/errorCodes";

const hhmmRe = /^\d{2}:\d{2}$/;
function toMinFlexible(v: string): number {
  if (hhmmRe.test(v)) {
    const [h, m] = v.split(":").map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) throw new Error("Invalid time format");
    return h * 60 + m;
  }
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date format");
  return d.getHours() * 60 + d.getMinutes();
}

function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

async function isOverlap(userId: string, startMin: number, endMin: number, excludeId?: string) {
  const where: any = {
    userId,
    startMin: { lt: endMin },
    endMin: { gt: startMin },
  };

  if (excludeId) where.id = { not: excludeId };

  return (await prisma.schedule.count({ where })) > 0;
}

/**
 * @swagger
 * tags:
 *   name: Schedule
 *   description: 사용자 스케줄 API
 */

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: 사용자 일정 목록 조회
 *     description: 로그인한 사용자의 일정을 조회합니다.
 *     tags: [Schedule]
 *     responses:
 *       200:
 *         description: 일정 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 schedules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       401:
 *         description: 인증되지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 errorCode: { type: string, example: UNAUTHORIZED }
 */
export const getSchedule = async (req: Request, res: Response) => {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.status(401).json({
      success: false,
      errorCode: ScheduleErrorCode.UNAUTHORIZED,
    });
  }

  const rows = await prisma.schedule.findMany({
    where: { userId: sessionUser.id },
    orderBy: [{ startMin: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, color: true, startMin: true, endMin: true, createdAt: true, updatedAt: true },
  });

  const schedules = rows.map((r) => ({
    id: r.id,
    user: sessionUser.username,
    title: r.title,
    start: toHHMM(r.startMin),
    end: toHHMM(r.endMin),
    color: r.color,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  res.json({ success: true, schedules: rows });
};

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: 일정 추가
 *     description: 새로운 일정을 등록합니다. 시간은 HH:mm 문자열로 전송하세요.
 *     tags: [Schedule]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, start, end, color]
 *             properties:
 *               title: { type: string, example: standup }
 *               start:
 *                 type: string
 *                 description: 시작 시간 (HH:mm)
 *                 pattern: '^\d{2}:\d{2}$'
 *                 example: '09:00'
 *               end:
 *                 type: string
 *                 description: 종료 시간 (HH:mm)
 *                 pattern: '^\d{2}:\d{2}$'
 *                 example: '09:30'
 *               color: { type: string, example: '#0af' }
 *     responses:
 *       200:
 *         description: 일정 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 schedule:
 *                   $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: 유효하지 않은 입력(형식/시간 순서)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 errorCode: { type: string, example: INVALID_TIME_ORDER }
 *       401:
 *         description: 인증되지 않음
 *       409:
 *         description: 기존 일정과 시간이 겹침
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 errorCode: { type: string, example: SCHEDULE_OVERLAP }
 */
export const saveSchedule = async (req: Request, res: Response) => {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.status(401).json({
      success: false,
      errorCode: ScheduleErrorCode.UNAUTHORIZED,
    });
  }

  try {
    const bodySchema = z.object({
      title: z.string().min(1),
      start: z.string().min(1),
      end: z.string().min(1),
      color: z.string().min(1),
    });

    const dto = bodySchema.parse(req.body);

    const startMin = toMinFlexible(dto.start);
    const endMin = toMinFlexible(dto.end);

    if (startMin >= endMin) return res.status(400).json({ success: false, errorCode: ScheduleErrorCode.INVALID_TIME_ORDER });
    if (await isOverlap(sessionUser.id, startMin, endMin)) {
      return res.status(400).json({ success: false, errorCode: ScheduleErrorCode.OVERLAP });
    }

    const created = await prisma.schedule.create({
      data: { title: dto.title, color: dto.color, startMin, endMin, userId: sessionUser.id },
      select: { id: true, title: true, startMin: true, endMin: true, color: true, createdAt: true, updatedAt: true },
    });

    const schedule = {
      id: created.id,
      user: sessionUser.username,
      title: created.title,
      start: toHHMM(created.startMin),
      end: toHHMM(created.endMin),
      color: created.color,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    res.json({ success: true, schedule });
  } catch (error: any) {
    if (error?.name === "ZodError") return res.status(400).json({ success: false, errorCode: GeneralErrorCode.INVALID_INPUT });
    if (error?.message === "INVALID_TIME") return res.status(400).json({ success: false, errorCode: ScheduleErrorCode.INVALID_TIME_ORDER });

    console.error(error);
    return res.status(500).json({ success: false, errorCode: GeneralErrorCode.INTERNAL_SERVER_ERROR });
  }
};

/**
 * @swagger
 * /api/schedules/{id}:
 *   patch:
 *     summary: 일정 수정
 *     description: 기존 일정을 수정합니다. 시간은 HH:mm 문자열로 전송하세요.
 *     tags: [Schedule]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: 수정할 일정의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, start, end, color]
 *             properties:
 *               title: { type: string, example: standup }
 *               start:
 *                 type: string
 *                 description: 시작 시간 (HH:mm)
 *                 pattern: '^\d{2}:\d{2}$'
 *                 example: '10:00'
 *               end:
 *                 type: string
 *                 description: 종료 시간 (HH:mm)
 *                 pattern: '^\d{2}:\d{2}$'
 *                 example: '11:00'
 *               color: { type: string, example: '#f50' }
 *     responses:
 *       200:
 *         description: 일정 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 schedule:
 *                   $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: 유효하지 않은 입력(형식/시간 순서)
 *       401:
 *         description: 인증되지 않음
 *       404:
 *         description: 일정이 존재하지 않음
 *       409:
 *         description: 기존 일정과 시간이 겹침
 */
export const updateSchedule = async (req: Request, res: Response) => {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.status(401).json({
      success: false,
      errorCode: ScheduleErrorCode.UNAUTHORIZED,
    });
  }

  try {
    const id = (req.params.id as string) ?? (req.body?.id as string);
    if (!id) return res.status(400).json({ success: false, errorCode: ValidationErrorCode.REQUIRED_FIELD_MISSING });

    const bodySchema = z.object({
      title: z.string().min(1),
      start: z.string().min(1),
      end: z.string().min(1),
      color: z.string().min(1),
    });

    const dto = bodySchema.parse(req.body);

    const found = await prisma.schedule.findUnique({
      where: { id },
      select: { userId: true, startMin: true, endMin: true },
    });

    if (!found || found.userId !== sessionUser.id) {
      return res.status(404).json({ success: false, errorCode: ScheduleErrorCode.NOT_FOUND });
    }

    const startMin = toMinFlexible(dto.start);
    const endMin = toMinFlexible(dto.end);

    if (startMin >= endMin) return res.status(400).json({ success: false, errorCode: ScheduleErrorCode.INVALID_TIME_ORDER });
    if (await isOverlap(sessionUser.id, startMin, endMin, id)) {
      return res.status(400).json({ success: false, errorCode: ScheduleErrorCode.OVERLAP });
    }

    const updated = await prisma.schedule.update({
      where: { id },
      data: { title: dto.title, color: dto.color, startMin, endMin },
      select: { id: true, title: true, startMin: true, endMin: true, color: true, createdAt: true, updatedAt: true },
    });

    const schedule = {
      id: updated.id,
      user: sessionUser.username,
      title: updated.title,
      start: toHHMM(updated.startMin),
      end: toHHMM(updated.endMin),
      color: updated.color,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    return res.json({ success: true, schedule });
  } catch (error: any) {
    if (error?.name === "ZodError") return res.status(400).json({ success: false, errorCode: GeneralErrorCode.INVALID_INPUT });
    if (error?.message === "INVALID_TIME") return res.status(400).json({ success: false, errorCode: ScheduleErrorCode.INVALID_TIME_ORDER });
    console.error(error);
    return res.status(500).json({ success: false, errorCode: GeneralErrorCode.INTERNAL_SERVER_ERROR });
  }
};

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: 일정 삭제
 *     description: 특정 일정을 삭제합니다.
 *     tags: [Schedule]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: 삭제할 일정의 ID
 *     responses:
 *       200:
 *         description: 일정 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *       401:
 *         description: 인증되지 않음
 *       404:
 *         description: 일정이 존재하지 않음
 */
export const deleteSchedule = async (req: Request, res: Response) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    return res.status(401).json({ success: false, errorCode: ScheduleErrorCode.UNAUTHORIZED });
  }

  const id = String(req.params.id);
  const found = await prisma.schedule.findUnique({ where: { id, userId: sessionUser.id } });

  if (!found || found.userId !== sessionUser.id) {
    return res.status(404).json({ success: false, errorCode: ScheduleErrorCode.NOT_FOUND });
  }

  await prisma.schedule.delete({ where: { id } });
  return res.json({ success: true });
};
