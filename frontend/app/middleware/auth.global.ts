import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const {user} = storeToRefs(auth)

  // pages that don’t need auth
  const publicPages = ['/auth/login', '/auth/signup'];

  if (!publicPages.includes(to.path) && !user.value?.isLogedIn) {
    return navigateTo('/auth/login');
  }
});
