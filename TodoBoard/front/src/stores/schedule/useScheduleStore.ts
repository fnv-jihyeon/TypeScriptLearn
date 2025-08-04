import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ScheduleItem {
  id: number
  title: string
  start: string
  end: string
  color: string
}

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref<ScheduleItem[]>([])

  function addSchedule(item: Omit<ScheduleItem, 'id'>) {
    const id = Date.now()
    schedules.value.push({ id, ...item })
  }

  function removeSchedule(id: number) {
    schedules.value = schedules.value.filter(s => s.id !== id)
  }

  function clearAll() {
    schedules.value = []
  }

  return { schedules, addSchedule, removeSchedule, clearAll }
})