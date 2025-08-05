export const ERROR_MESSAGE_MAP: Record<string, string> = {
  // 인증 관련
  AUTH_INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다.',
  AUTH_USER_ALREADY_EXISTS: '이미 존재하는 계정입니다.',
  AUTH_UNAUTHORIZED: '로그인이 필요합니다.',
  AUTH_USER_NOT_FOUND: '존재하지 않는 사용자입니다.',
  AUTH_SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',

  // 유효성 검사 관련
  VALIDATION_REQUIRED_FIELD_MISSING: '필수 입력값이 누락되었습니다.',
  VALIDATION_INVALID_EMAIL_FORMAT: '이메일 형식이 올바르지 않습니다.',
  VALIDATION_PASSWORD_TOO_SHORT: '비밀번호는 최소 8자 이상이어야 합니다.',

  // 기타
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};