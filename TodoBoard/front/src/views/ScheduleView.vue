<template>
  <div class="schedule-page">
    <TopBar />
    <ScheduleBoard />
  </div>
</template>

<script setup lang="ts">
import TopBar from "@/components/TopBar.vue";
import ScheduleBoard from "@/components/ScheduleBoard.vue";
</script>

<style scoped>
.schedule-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
