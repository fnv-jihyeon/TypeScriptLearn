/**
 * API 스키마 정의
 * 사용자, 스케줄, 에러 코드 스키마 포함
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *       properties:
 *         username:
 *           type: string
 *           example: user123
 *         email:
 *           type: string
 *           example: user123@example.com
 *
 *     Schedule:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - start
 *         - end
 *         - color
 *         - user
 *       properties:
 *         id:
 *           type: number
 *           example: 1723413523000
 *         title:
 *           type: string
 *           example: 경복 학생 학기 위원회
 *         start:
 *           type: string
 *           format: date-time
 *           example: 2025-08-07T10:00:00.000Z
 *         end:
 *           type: string
 *           format: date-time
 *           example: 2025-08-07T11:00:00.000Z
 *         color:
 *           type: string
 *           example: "#00B894"
 *         user:
 *           type: string
 *           example: user123
 *
 *     ErrorCode:
 *       type: string
 *       description: 에러 코드 정의
 *       enum:
 *         - INVALID_CREDENTIALS
 *         - EMAIL_ALREADY_REGISTERED
 *         - USER_ALREADY_EXISTS
 *         - USER_NOT_FOUND
 *         - UNAUTHORIZED
 *         - SESSION_EXPIRED
 *         - REQUIRED_FIELD_MISSING
 *         - INVALID_EMAIL_FORMAT
 *         - PASSWORD_TOO_SHORT
 *         - SCHEDULE_NOT_FOUND
 *         - SCHEDULE_CONFLICT
 *         - INVALID_SCHEDULE_DATA
 *         - FORBIDDEN
 *         - INTERNAL_SERVER_ERROR
 *         - UNKNOWN_ERROR
 */
