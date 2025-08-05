<script setup lang="ts">
import { ScheduleItem } from "@/stores/schedule/useScheduleStore";
import { ref, watch, onMounted } from "vue";

const props = defineProps<{
  modelValue: boolean;
  defaultTime: string;
  editData?: ScheduleItem | null;
}>();

const emit = defineEmits(["update:modelValue", "submit", "delete"]);

const show = ref(props.modelValue);

const form = ref({
  title: "",
  start: props.defaultTime || "00:00",
  end: "00:30",
  color: "#18a058",
});

function submit() {
  if (!form.value.title || !form.value.start || !form.value.end) return;
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
    }
    form.value.start = newTime;
  }
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
  <n-modal
    v-model:show="show"
    preset="dialog"
    title="일정 추가"
    style="width: 400px"
  >
    <n-form label-placement="left" label-width="80px">
      <n-form-item label="제목">
        <n-input v-model:value="form.title" placeholder="할 일 제목 입력" />
      </n-form-item>
      <n-form-item label="시간">
        <n-time-picker
          v-model:formatted-value="form.start"
          format="HH:mm"
          :hours="[...Array(24).keys()]"
          :minutes="[0, 30]"
          placeholder="시작"
        />
        <span style="margin: 0 8px">~</span>
        <n-time-picker
          v-model:formatted-value="form.end"
          format="HH:mm"
          :hours="[...Array(24).keys()]"
          :minutes="[0, 30]"
          placeholder="종료"
        />
      </n-form-item>
      <n-form-item label="색상">
        <n-color-picker v-model:value="form.color" />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="show = false">취소</n-button>
      <n-button type="error" v-if="props.editData" @click="deleteItem"
        >삭제</n-button
      >
      <n-button type="primary" @click="submit">저장</n-button>
    </template>
  </n-modal>
</template>
