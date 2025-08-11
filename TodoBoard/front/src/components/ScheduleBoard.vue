<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useMessage } from "naive-ui";
import ScheduleModal from "@/components/ScheduleModal.vue";
import router from "@/router";
import { useSessionStore } from "@/stores/useSessionStore";
import { useScheduleStore } from "@/stores/useScheduleStore";
import type { ERROR_CODES } from "@shared/constants/errorCodes";
import type { schedule, scheduleCreateInput } from "@shared/types/schedule";

const sessionStore = useSessionStore();
const scheduleStore = useScheduleStore();
const message = useMessage();

// const schedules = computed(() => scheduleStore.schedules);
const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

const schedulesSorted = computed(() => scheduleStore.sortedSchedules);

const showModal = ref(false);
const selectedTime = ref("");
const editData = ref<schedule | null>(null);

function openModal(time: string) {
  selectedTime.value = time;
  editData.value = null; // Reset edit data
  showModal.value = true;
}

function openEditModal(item: schedule) {
  editData.value = item;
  showModal.value = true;
}

async function handleSubmit(item: scheduleCreateInput) {
  try {
    if (editData.value && editData.value.id) {
      await scheduleStore.updateSchedule(editData.value.id, item);
      message.success("일정이 수정되었습니다");
    } else {
      await scheduleStore.createSchedule(item);
      message.success("일정이 등록되었습니다");
    }
    showModal.value = false;
  } catch (error: any) {
    const code = (error?.message as ERROR_CODES) ?? "UNKNOWN_ERROR";
    message.error(`실패: ${code}`);
  }
}

async function handleDelete(id: string | number) {
  try {
    await scheduleStore.deleteSchedule(id);
    message.success("일정이 삭제되었습니다");
  } catch (error: any) {
    const code = (error?.message as ERROR_CODES) ?? "UNKNOWN_ERROR";
    message.error(`삭제 실패: ${code}`);
  } finally {
    showModal.value = false;
  }
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

onMounted(async () => {
  if (!sessionStore.user) {
    await sessionStore.checkSession(); // 세션 반영된 사용자 정보 가져오기
  }

  if (sessionStore.user) {
    try {
      await scheduleStore.getSchedules();
    } catch (error: any) {
      message.error(`일정 목록 불러오기 실패: ${error.message}`);
    }
  } else {
    router.push("/login");
  }
});
</script>

<template>
  <div class="board">
    <div v-for="(time, i) in timeSlots" :key="time" class="time-slot" @click="openModal(time)">
      {{ time }}
    </div>

    <div
      v-for="item in schedulesSorted"
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

    <ScheduleModal v-model="showModal" :defaultTime="selectedTime" :editData="editData" @submit="handleSubmit" @delete="handleDelete" />
  </div>
</template>

<style scoped>
.board {
  position: relative;
  height: 1440px;
  border: 1px solid #ccc;
  overflow-y: auto;
  box-sizing: border-box;

  background-image: repeating-linear-gradient(to bottom, #e9e9e9 0, #e9e9e9 1px, transparent 1px, transparent 30px);
}
.time-slot {
  height: 30px;
  line-height: 30px;
  padding-left: 8px;
  /* border-bottom: 1px solid #eee; */
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
