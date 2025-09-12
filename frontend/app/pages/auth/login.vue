<template>
  <div class="w-80">
    <h1 class="text-2xl font-bold mb-6">Login</h1>
    <form @submit.prevent="submit" class="space-y-4">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full p-2 rounded-lg bg-card border border-border" />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full p-2 rounded-lg bg-card border border-border" />
      <button
        type="submit"
        class="w-full py-2 rounded-lg bg-blue-600 text-white">
        Login
      </button>
    </form>
    <p class="mt-4 text-sub">
      Don’t have an account?
      <NuxtLink to="/auth/signup" class="text-blue-400">Sign up</NuxtLink>
    </p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth',
});

import { useAuthStore } from '@/stores/auth';
const email = ref('');
const password = ref('');
const auth = useAuthStore();

function submit() {
  auth.login('fake-jwt-token', { id: 1, name: 'Demo User' });
  navigateTo('/');
}
</script>
