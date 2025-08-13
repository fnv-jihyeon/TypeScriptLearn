import type { ApiResult } from "@shared/types/api";

export interface schedule {
  id: string; // UUID or short ID
  userId: string; // 로그인한 사용자 식별자
  title: string; // 일정 제목
  description?: string; // 일정 설명 (선택)
  start: string; // 시작 시간
  end: string; // 종료 시간
  color: string; // 일정 색상 (예: #FF5733)
  createAt?: string; // 생성 시간 (옵션)
  updateAt?: string; // 수정 시간 (옵션)
}

// 생성 시 필요한 필드만 (id, userId, createdAt 등은 서버가 생성)
export interface scheduleCreateInput {
  title: string;
  description?: string;
  start: string;
  end: string;
  color?: string;
}

// 수정 시 일부 필드만 들어올 수 있음
export type scheduleUpdateInput = Partial<scheduleCreateInput>;

// 삭제 시 필요한 필드
export interface scheduleDeleteInput {
  id: string | number;
}

export type scheduleListResponse = ApiResult<{ schedules: schedule[] }>;
export type scheduleCreateResponse = ApiResult<{ schedule: schedule }>;
export type scheduleUpdateResponse = ApiResult<{ schedule: schedule }>;
export type scheduleDeleteResponse = ApiResult<{}>;
export type scheduleByIdResponse = ApiResult<{ schedule: schedule }>;
