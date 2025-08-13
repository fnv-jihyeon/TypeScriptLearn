import { createRouter, createWebHistory } from "vue-router";
import { useSessionStore } from "@/stores/useSessionStore";

import ScheduleView from "@/views/ScheduleView.vue";
import LoginView from "@/views/auth/LoginView.vue";
import SignupView from "@/views/auth/SignupView.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "login", component: LoginView },
  { path: "/schedule", name: "schedule", component: ScheduleView },
  { path: "/signup", name: "signup", component: SignupView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

//전역 네이게이션 가드
router.beforeEach(async (to, from, next) => {
  const session = useSessionStore();
  if (!session.isLoaded) {
    try {
      await session.checkSession();
    } catch {}
  }
  next();
});

export default router;
