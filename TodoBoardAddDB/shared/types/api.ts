export type ApiSuccess<T> = { success: true } & T;
export type ApiError<E = string> = { success: false; errorCode: string; message?: string };
export type ApiResult<T, E = string> = ApiSuccess<T> | ApiError<E>;
