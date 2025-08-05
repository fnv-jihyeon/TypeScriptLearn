import type { ScheduleItem } from "@/stores/schedule/useScheduleStore";

const STORAGE_KEY = 'schedules'

export function fetchSchedules(): ScheduleItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveSchedules(schedules: ScheduleItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
}