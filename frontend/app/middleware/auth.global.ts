import { useAuthStore } from '@/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();

  // pages that don’t need auth
  const publicPages = ['/auth/login', '/auth/signup'];

  if (!publicPages.includes(to.path) && !auth.isLoggedIn()) {
    return navigateTo('/auth/login');
  }
});
