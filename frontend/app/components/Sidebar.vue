<template>
  <aside class="w-52 border-r border-[#1C2440] p-4 space-y-4">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="block px-2 py-2 rounded-lg hover:bg-[#1C2440] transition">
      {{ item.label }}
    </NuxtLink>
  </aside>
</template>

<script setup>
const items = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/games', label: 'Games' },
  { to: '/chat', label: 'Chats' },
  { to: '/wallet', label: 'Wallet' },
];
</script>
