import { AuthErrorCode, ValidationErrorCode, GeneralErrorCode, ScheduleErrorCode, ERROR_CODES } from "@shared/constants/errorCodes";

export const ERROR_MESSAGES: Record<ERROR_CODES, string> = {
  // 인증 관련
  [AuthErrorCode.INVALID_CREDENTIALS]: "아이디 또는 비밀번호가 올바르지 않습니다.",
  [AuthErrorCode.EMAIL_ALREADY_REGISTERED]: "이미 존재하는 계정입니다.",
  [AuthErrorCode.UNAUTHORIZED]: "로그인이 필요합니다.",
  [AuthErrorCode.USER_NOT_FOUND]: "존재하지 않는 사용자입니다.",
  [AuthErrorCode.SESSION_EXPIRED]: "세션이 만료되었습니다. 다시 로그인해주세요.",
  [AuthErrorCode.USER_ALREADY_EXISTS]: "이미 존재하는 사용자입니다.",

  // 유효성 검사 관련
  [ValidationErrorCode.REQUIRED_FIELD_MISSING]: "필수 입력값이 누락되었습니다.",
  [ValidationErrorCode.INVALID_EMAIL_FORMAT]: "이메일 형식이 올바르지 않습니다.",
  [ValidationErrorCode.PASSWORD_TOO_SHORT]: "비밀번호는 최소 8자 이상이어야 합니다.",

  // 일정 관련
  [ScheduleErrorCode.SCHEDULE_LIST_NOT_FOUND]: "일정 목록을 찾을 수 없습니다.",
  [ScheduleErrorCode.SCHEDULE_CREATION_FAILED]: "일정 등록에 실패했습니다.",
  [ScheduleErrorCode.SCHEDULE_UPDATE_FAILED]: "일정 수정에 실패했습니다.",
  [ScheduleErrorCode.SCHEDULE_DELETION_FAILED]: "일정 삭제에 실패했습니다.",
  [ScheduleErrorCode.SCHEDULE_NOT_FOUND]: "해당 일정을 찾을 수 없습니다.",
  [ScheduleErrorCode.SCHEDULE_INVALID_DATA]: "일정 데이터가 유효하지 않습니다.",
  [ScheduleErrorCode.INVALID_RESPONSE]: "서버 응답이 유효하지 않습니다.",

  // 기타
  [GeneralErrorCode.INTERNAL_SERVER_ERROR]: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  [GeneralErrorCode.UNKNOWN_ERROR]: "알 수 없는 오류가 발생했습니다.",
};
