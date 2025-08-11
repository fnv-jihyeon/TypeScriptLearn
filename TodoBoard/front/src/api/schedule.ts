import axios from "axios";
import type {
  schedule,
  scheduleCreateInput,
  scheduleUpdateInput,
  scheduleListResponse,
  scheduleCreateResponse,
  scheduleUpdateResponse,
  scheduleDeleteResponse,
  scheduleByIdResponse,
} from "@shared/types/schedule";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // 쿠키를 포함한 요청을 위해 설정
});

export const scheduleAPI = {
  // 전체 일정 리스트 조회
  getList() {
    return api.get<scheduleListResponse>("/schedule");
  },
  create(data: scheduleCreateInput) {
    return api.post<scheduleCreateResponse>("/schedule", data);
  },
  update(id: string | number, data: scheduleUpdateInput) {
    return api.put<scheduleUpdateResponse>(`/schedule/${id}`, data);
  },
  remove(id: string | number) {
    return api.delete<scheduleDeleteResponse>(`/schedule/${id}`);
  },
  getById(id: string | number) {
    return api.get<scheduleByIdResponse>(`/schedule/${id}`);
  },
};
