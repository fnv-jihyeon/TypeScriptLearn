import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import ScheduleView from '../views/ScheduleView.vue';

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/schedule', name: 'Schedule', component: ScheduleView },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
