<script setup lang="ts">
import { ref, computed } from "vue";
import {
  ScheduleItem,
  useScheduleStore,
} from "@/stores/schedule/useScheduleStore";
import ScheduleModal from "@/components/ScheduleModal.vue";

const scheduleStore = useScheduleStore();
const schedules = computed(() => scheduleStore.schedules);

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

const showModal = ref(false);
const selectedTime = ref("");
const editData = ref<ScheduleItem | null>(null);

function openModal(time: string) {
  selectedTime.value = time;
  editData.value = null; // Reset edit data
  showModal.value = true;
}

function openEditModal(item: ScheduleItem) {
  editData.value = item;
  showModal.value = true;
}

function handleSubmit(item: ScheduleItem) {
  const idx = scheduleStore.schedules.findIndex((s) => s.id === item.id);

  if (idx !== -1) {
    scheduleStore.schedules[idx] = item;
  } else {
    scheduleStore.addSchedule(item);
  }
}

function handleDelete(id: number) {
  scheduleStore.removeSchedule(id);
}

function getTop(start: string) {
  const [h, m] = start.split(":").map(Number);
  return `${h * 60 + m}px`;
}

function getHeight(item: any) {
  const [sh, sm] = item.start.split(":").map(Number);
  const [eh, em] = item.end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}
</script>

<template>
  <div class="board">
    <div
      v-for="(time, i) in timeSlots"
      :key="time"
      class="time-slot"
      @click="openModal(time)"
    >
      {{ time }}
    </div>

    <div
      v-for="item in schedules"
      :key="item.id"
      class="schedule-item"
      :style="{
        top: getTop(item.start),
        height: getHeight(item) + 'px',
        backgroundColor: item.color,
      }"
      @click.stop="openEditModal(item)"
    >
      {{ item.title }}
    </div>

    <ScheduleModal
      v-model="showModal"
      :defaultTime="selectedTime"
      :editData="editData"
      @submit="handleSubmit"
      @delete="handleDelete"
    />
  </div>
</template>

<style scoped>
.board {
  position: relative;
  height: 1440px;
  border: 1px solid #ccc;
  overflow-y: auto;
}
.time-slot {
  height: 30px;
  line-height: 30px;
  padding-left: 8px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.schedule-item {
  position: absolute;
  left: 100px;
  width: 200px;
  color: #fff;
  padding: 4px;
  border-radius: 4px;
}
</style>
