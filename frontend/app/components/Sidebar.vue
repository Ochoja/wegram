<template>
  <aside class="w-52 border-r border-border p-4 space-y-4">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="block px-2 py-2 rounded-lg hover:bg-border transition">
      {{ item.label }}
    </NuxtLink>

    <button
      @click="logout"
      class="mt-6 block w-full text-left px-2 py-2 rounded-lg bg-red-600 text-white">
      Logout
    </button>
  </aside>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();

const items = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/games', label: 'Games' },
  { to: '/chat', label: 'Chats' },
  { to: '/wallet', label: 'Wallet' },
];

function logout() {
  auth.logout();
  navigateTo('/auth/login');
}
</script>
