import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { saveSchedules } from '@/api/schedule'

export interface ScheduleItem {
  id: number
  title: string
  start: string
  end: string
  color: string
}

const STORAGE_KEY = 'schedules'

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

  function loadFromStorage(): ScheduleItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  watch(schedules, (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal)) 
  }, { deep: true })

  return { schedules, addSchedule, removeSchedule, clearAll }
})