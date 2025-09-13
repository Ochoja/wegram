import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
// import { useRoute } from 'vue-router';

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  // const route = useRoute()
  const { user } = storeToRefs(auth);
  // console.log(route);
  // if (route.hash) {
  //   console.log(route.hash)
  //   const params = new URLSearchParams(route.hash.replace('#', ''));
  //   const accessToken = params.get('access_token');
  //   const refreshToken = params.get('refresh_token');

  //   console.log(accessToken)
  //   console.log(refreshToken);

  //   if (accessToken && refreshToken) {
  //     const success = await auth.setSession(accessToken, refreshToken);
  //     if (success) {
  //       // Redirect to clean URL
  //       navigateTo(route.path);
  //     } else {
  //       navigateTo('/auth/login');
  //     }
  //   }
  // }

  // pages that don’t need auth
  const publicPages = ['/auth/login', '/auth/signup'];

  if (!publicPages.includes(to.path) && !user.value?.isLogedIn) {
    return navigateTo('/auth/login');
  }
});
