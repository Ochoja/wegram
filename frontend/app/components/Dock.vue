<template>
  <nav
    class="fixed bottom-0 left-0 right-0 flex justify-around bg-[#0F1528] border-t border-[#1C2440] py-2">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="text-xl">
      {{ item.icon }}
    </NuxtLink>
  </nav>
</template>

<script setup>
const items = [
  { to: '/', icon: '🏠' },
  { to: '/explore', icon: '🔍' },
  { to: '/chat', icon: '💬' },
  { to: '/wallet', icon: '👛' },
];
</script>
