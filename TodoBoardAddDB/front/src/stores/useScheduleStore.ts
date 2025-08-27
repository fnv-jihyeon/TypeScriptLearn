import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { scheduleAPI } from "@/api/schedule";
import { toMinutes } from "@/utils/time";
import type { ERROR_CODES } from "@shared/constants/errorCodes";
import type { schedule, scheduleCreateInput, scheduleUpdateInput } from "@shared/types/schedule";

function errorCodeFrom(e: any, fallback: ERROR_CODES): ERROR_CODES {
  return (e?.response?.data?.errorCode || e?.data?.errorCode || fallback) as ERROR_CODES;
}

export const useScheduleStore = defineStore("schedule", () => {
  const schedules = ref<schedule[]>([]);
  const isLoading = ref(false);
  const isLoaded = ref(false);

  const sortedSchedules = computed(() => {
    return [...schedules.value].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  });

  // 전체 일정 조회
  async function getSchedules() {
    isLoading.value = true;
    try {
      const { data } = await scheduleAPI.getList();

      if (!data.success) {
        throw new Error(data.errorCode as ERROR_CODES);
      }

      schedules.value = data.schedules.slice().sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
      isLoaded.value = true;
      return schedules.value;
    } catch (error: any) {
      throw new Error(errorCodeFrom(error, "SCHEDULE_LIST_NOT_FOUND" as ERROR_CODES));
    } finally {
      isLoading.value = false;
    }
  }

  // 단일 일정 조회(Store  내 캐시)
  function getSchedulesById(id: string | number): schedule | undefined {
    return schedules.value.find((schedule) => schedule.id === id);
  }

  // 일정 등록
  async function createSchedule(input: scheduleCreateInput): Promise<schedule | null> {
    isLoading.value = true;
    try {
      const { data } = await scheduleAPI.create(input);

      if (!data.success) {
        throw new Error(data.errorCode as ERROR_CODES);
      }

      const created = data.schedule;
      schedules.value = [...schedules.value, created].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
      isLoaded.value = true;
      return created;
    } catch (error: any) {
      throw new Error(errorCodeFrom(error, "SCHEDULE_CREATE_FAILED" as ERROR_CODES));
    } finally {
      isLoading.value = false;
    }
  }

  // 일정 수정
  async function updateSchedule(id: string | number, updates: scheduleUpdateInput): Promise<schedule | null> {
    isLoading.value = true;
    try {
      const { data } = await scheduleAPI.update(id, updates);
      if (!data.success) {
        throw new Error(data.errorCode as ERROR_CODES);
      }

      const updated = data.schedule;
      const index = schedules.value.findIndex((schedule) => schedule.id === id);

      if (index !== -1) {
        const next = schedules.value.slice();
        next[index] = updated;
        schedules.value = next.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
      } else {
        schedules.value = [...schedules.value, updated].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
      }
      isLoaded.value = true;
      return updated;
    } catch (error: any) {
      throw new Error(errorCodeFrom(error, "SCHEDULE_UPDATE_FAILED" as ERROR_CODES));
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteSchedule(id: string | number): Promise<void> {
    isLoading.value = true;
    try {
      const { data } = await scheduleAPI.remove(id);
      if (!data.success) {
        throw new Error(data.errorCode as ERROR_CODES);
      }

      schedules.value = schedules.value.filter((schedule) => schedule.id !== id);
      isLoaded.value = true;
    } catch (error: any) {
      console.error("Failed to delete schedule:", error);
      throw new Error(errorCodeFrom(error, "SCHEDULE_DELETION_FAILED" as ERROR_CODES));
    } finally {
      isLoading.value = false;
    }
  }

  function reset() {
    schedules.value = [];
    isLoading.value = false;
    isLoaded.value = false;
  }

  return {
    schedules,
    isLoading,
    isLoaded,
    sortedSchedules,
    getSchedules,
    getSchedulesById,
    getScheduleByIdFromServer,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    reset,
  };
});
