import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as { id: number; name: string } | null,
  }),
  actions: {
    login(token: string, user: { id: number; name: string }) {
      this.token = token;
      this.user = user;
    },
    logout() {
      this.token = null;
      this.user = null;
    },
    isLoggedIn() {
      return !!this.token;
    },
  },
});
