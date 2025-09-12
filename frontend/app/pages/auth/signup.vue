<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl font-bold mb-6">Sign Up</h1>
    <form @submit.prevent="submit" class="space-y-4 w-72">
      <input
        v-model="name"
        type="text"
        placeholder="Name"
        class="w-full p-2 rounded-lg bg-card border border-border" />
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
        class="w-full py-2 rounded-lg bg-green-600 text-white">
        Sign Up
      </button>
    </form>
    <p class="mt-4 text-sub">
      Already have an account?
      <NuxtLink to="/auth/login" class="text-blue-400">Login</NuxtLink>
    </p>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';

const name = ref('');
const email = ref('');
const password = ref('');
const auth = useAuthStore();

function submit() {
  // Fake signup, replace with backend later
  auth.login('fake-jwt-token', { id: Date.now(), name });
  navigateTo('/');
}
</script>
