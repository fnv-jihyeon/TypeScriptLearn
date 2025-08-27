import { api } from "@/lib/api";
import type {
  schedule,
  scheduleCreateInput,
  scheduleUpdateInput,
  scheduleListResponse,
  scheduleCreateResponse,
  scheduleUpdateResponse,
  scheduleDeleteResponse,
  //scheduleByIdResponse,
} from "@shared/types/schedule";

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
  // getById(id: string | number) {
  //   return api.get<scheduleByIdResponse>(`/schedule/${id}`);
  // },
};
