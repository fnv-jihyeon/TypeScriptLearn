import { Request, Response } from "express";
import { scheduleDB } from "@/data/fakeScheduleDB";
import { ScheduleErrorCode } from "@shared/constants/errorCodes";

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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 schedules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *                 errorCode:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: 인증되지 않음
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
 *                   example: UNAUTHORIZED
 */
export const getSchedule = (req: Request, res: Response) => {
  const user = req.session.user?.username;

  if (!user) {
    return res.status(401).json({
      success: false,
      errorCode: ScheduleErrorCode.UNAUTHORIZED,
    });
  }

  const result = scheduleDB.filter((item) => item.user === user);
  res.json({ success: true, schedules: result });
};

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: 일정 추가
 *     description: 새로운 일정을 등록합니다.
 *     tags: [Schedule]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - start
 *               - end
 *               - color
 *             properties:
 *               title:
 *                 type: string
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: 일정 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 schedule:
 *                   $ref: '#/components/schemas/Schedule'
 *                 errorCode:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: 인증되지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errorCode:
 *                   type: string
 *                   example: UNAUTHORIZED
 */
export const saveSchedule = (req: Request, res: Response) => {
  const user = req.session.user?.username;

  if (!user) {
    return res.status(401).json({
      success: false,
      errorCode: ScheduleErrorCode.UNAUTHORIZED,
    });
  }

  const item = { ...req.body, id: Date.now(), user };
  scheduleDB.push(item);
  res.json({ success: true, schedule: item });
};

/**
 * @swagger
 * /api/schedules:
 *   patch:
 *     summary: 일정 수정
 *     description: 기존 일정을 수정합니다.
 *     tags: [Schedule]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - title
 *               - start
 *               - end
 *               - color
 *             properties:
 *               id:
 *                 type: number
 *               title:
 *                 type: string
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: 일정 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 schedule:
 *                   $ref: '#/components/schemas/Schedule'
 *                 errorCode:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: 인증되지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errorCode:
 *                   type: string
 *                   example: UNAUTHORIZED
 *       404:
 *         description: 일정이 존재하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errorCode:
 *                   type: string
 *                   example: SCHEDULE_NOT_FOUND
 */
export const updateSchedule = (req: Request, res: Response) => {
  const user = req.session.user?.username;

  if (!user) {
    return res.status(401).json({
      success: false,
      errorCode: ScheduleErrorCode.UNAUTHORIZED,
    });
  }

  const { id, title, start, end, color } = req.body;
  const index = scheduleDB.findIndex(
    (item) => item.id === id && item.user === user
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      errorCode: ScheduleErrorCode.SCHEDULE_NOT_FOUND,
    });
  }

  scheduleDB[index] = { id, user, title, start, end, color };
  res.json({ success: true, schedule: scheduleDB[index] });
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
 *         schema:
 *           type: number
 *         required: true
 *         description: 삭제할 일정의 ID
 *     responses:
 *       200:
 *         description: 일정 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errorCode:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: 인증되지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errorCode:
 *                   type: string
 *                   example: UNAUTHORIZED
 *       404:
 *         description: 일정이 존재하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errorCode:
 *                   type: string
 *                   example: SCHEDULE_NOT_FOUND
 */
export const deleteSchedule = (req: Request, res: Response) => {
  const user = req.session.user?.username;

  if (!user) {
    return res.status(401).json({
      success: false,
      errorCode: ScheduleErrorCode.UNAUTHORIZED,
    });
  }

  const id = Number(req.params.id);
  const index = scheduleDB.findIndex(
    (item) => item.id === id && item.user === user
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      errorCode: ScheduleErrorCode.SCHEDULE_NOT_FOUND,
    });
  }

  scheduleDB.splice(index, 1);
  res.json({ success: true });
};
