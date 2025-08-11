<script setup lang="ts">
import { schedule } from "@shared/types/schedule";
import { useMessage } from "naive-ui";
import { ref, watch, onMounted } from "vue";

const props = defineProps<{
  modelValue: boolean;
  defaultTime: string;
  editData?: schedule | null;
}>();

const message = useMessage();
const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "submit", payload: { title: string; start: string; end: string; color: string }): void;
  (e: "delete", id: string | number): void;
}>();
const show = ref(props.modelValue);

const form = ref({
  title: "",
  start: props.defaultTime || "00:00",
  end: "00:30",
  color: "#18a058",
});

function submit() {
  if (!form.value.title || !form.value.start || !form.value.end) return;

  const [sh, sm] = form.value.start.split(":").map(Number);
  const [eh, em] = form.value.end.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (endMinutes <= startMinutes) {
    message.error("종료 시간은 시작 시간보다 늦어야 합니다.");
    return;
  }

  emit("submit", { ...form.value });
  show.value = false;
}

function deleteItem() {
  if (props.editData) {
    emit("delete", props.editData.id);
    show.value = false;
  }
}

watch(
  () => props.modelValue,
  (val) => (show.value = val)
);

watch(show, (val) => emit("update:modelValue", val));

watch(
  () => props.defaultTime,
  (newTime) => {
    if (/^\d{2}:\d{2}$/.test(newTime)) {
      form.value.start = newTime;

      //종료 시간을 30분 뒤로 자동 설정
      const [h, m] = newTime.split(":").map(Number);
      let endH = h;
      let endM = m + 30;
      if (endM >= 60) {
        endH += 1;
        endM -= 60;
      }
      form.value.end = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    }
  },
  { immediate: true }
);

watch(
  () => props.editData,
  (item) => {
    if (item) {
      form.value = { ...item };
    } else {
      form.value = {
        title: "",
        start: props.defaultTime || "00:00",
        end: "00:30",
        color: "#18a058",
      };
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.defaultTime) {
    form.value.start = props.defaultTime;
  }
});
</script>

<template>
  <n-modal v-model:show="show" preset="dialog" title="일정 추가" style="width: 400px">
    <n-form label-placement="left" label-width="80px">
      <n-form-item label="제목">
        <n-input v-model:value="form.title" placeholder="할 일 제목 입력" />
      </n-form-item>
      <n-form-item label="시간">
        <n-time-picker v-model:formatted-value="form.start" format="HH:mm" :hours="[...Array(24).keys()]" :minutes="[0, 30]" placeholder="시작" />
        <span style="margin: 0 8px">~</span>
        <n-time-picker v-model:formatted-value="form.end" format="HH:mm" :hours="[...Array(24).keys()]" :minutes="[0, 30]" placeholder="종료" />
      </n-form-item>
      <n-form-item label="색상">
        <n-color-picker v-model:value="form.color" />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="show = false">취소</n-button>
      <n-button type="error" v-if="props.editData" @click="deleteItem">삭제</n-button>
      <n-button type="primary" @click="submit">저장</n-button>
    </template>
  </n-modal>
</template>
