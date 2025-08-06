import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from '@/stores/useSessionStore';

import ScheduleView from '@/views/ScheduleView.vue';
import LoginView from '@/views/auth/LoginView.vue';
import SignupView from '@/views/auth/SignupView.vue';

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/schedule', name: 'Schedule', component: ScheduleView },
  { path: '/signup', name: 'Signup', component: SignupView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

//전역 네이게이션 가드
router.beforeEach(async (to, from, next) => {
  const sessionStore = useSessionStore();
  await sessionStore.checkSession();

  if(to.meta.requiresAuth && !sessionStore.user) {
    next('/login');
  } else {
    next();
  }
});

export default router;
