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

const SLOT_PX = 30;

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

function onSlotClick(halfIdx: number) {
  // halfIdx: 0=00:00, 1=00:30, 2=01:00 ...
  const h = Math.floor(halfIdx / 2);
  const m = halfIdx % 2 ? 30 : 0;
  const time = `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`;
  openModal(time);
}

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

function onInnerClick(e: MouseEvent) {
  const inner = e.currentTarget as HTMLElement; // .board-inner
  const rect = inner.getBoundingClientRect();

  // 스크롤/보더 상관없이 '보드 안에서의 절대 Y' 픽셀
  const y = e.clientY - rect.top;

  // 안전 클램프
  const clamped = Math.max(0, Math.min(1439.999, y));

  // 해당 슬롯(30분 단위) 시작시간으로 스냅: 내림
  const halfIdx = Math.floor(clamped / SLOT_PX); // 0..47
  const h = Math.floor(halfIdx / 2);
  const m = halfIdx % 2 ? 30 : 0;

  openModal(`${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`);
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
    <div class="board-inner" @click="onInnerClick">
      <div class="time-col">
        <div v-for="t in timeSlots" :key="t" class="time-row">{{ t }}</div>
      </div>

      <div class="canvas">
        <div
          v-for="item in schedulesSorted"
          :key="item.id"
          class="schedule-item"
          :style="{ top: getTop(item.start), height: getHeight(item) + 'px', backgroundColor: item.color }"
          @click.stop="openEditModal(item)"
        >
          {{ item.title }}
        </div>
      </div>
    </div>

    <ScheduleModal v-model="showModal" :defaultTime="selectedTime" :editData="editData" @submit="handleSubmit" @delete="handleDelete" />
  </div>
</template>

<style scoped>
.board {
  position: relative;
  height: calc(100vh - 120px);
  overflow-y: auto; /* 여기만 스크롤 */
  border: 1px solid #ccc;
  box-sizing: border-box;
}
.board-inner {
  position: relative;
  height: 1440px; /* 24h * 60min (1px/min) */
  padding: 0;
  margin: 0; /*패딩/보더 금지 */
}
.time-col {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 80px;
  pointer-events: none; /*클릭 안 가로채게 */
}
.time-row {
  height: 30px;
  line-height: 30px;
  padding-left: 8px;
  /* border-bottom 제거 권장 (누적오차 방지). 쓰면 SLOT_PX=31로 */
}
.canvas {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 80px;
  right: 0;
  background-image: repeating-linear-gradient(to bottom, #e9e9e9 0, #e9e9e9 1px, transparent 1px, transparent 30px);
}
.schedule-item {
  position: absolute;
  left: 8px;
  right: 8px;
  color: #fff;
  padding: 4px 6px;
  border-radius: 4px;
}
</style>
