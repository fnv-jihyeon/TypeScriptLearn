import express from "express";
import {
  getSchedule,
  saveSchedule,
  updateSchedule,
  deleteSchedule,
} from "./schedule.controller";

const router = express.Router();

/**
 * @route GET /api/schedules
 * @desc 로그인된 사용자의 전체 일정 조회
 */
router.get("/", getSchedule);

/**
 * @route POST /api/schedules
 * @desc 새 일정 추가
 */
router.post("/", saveSchedule);

/**
 * @route PATCH /api/schedules
 * @desc 기존 일정 수정
 */
router.put("/:id", updateSchedule);

/**
 * @route DELETE /api/schedules/:id
 * @desc 특정 일정 삭제
 */
router.delete("/:id", deleteSchedule);

export default router;
