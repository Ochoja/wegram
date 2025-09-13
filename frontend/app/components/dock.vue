<template>
  <nav
    class="fixed bottom-0 left-0 right-0 flex justify-around bg-[#0F1528] border-t border-[#1C2440] py-2">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center">
      <div><Icon :name="item.icon" /></div>
      <div>{{ item.label }}</div>
    </NuxtLink>
  </nav>
</template>

<script setup>
const items = [
  { to: '/', label: 'Home', icon: 'ion:home-outline' },
  { to: '/explore', label: 'Search', icon: 'ion:search' },
  { to: '/chat', label: 'Messages', icon: 'ion:chatbox-ellipses-outline' },
  { to: '/games', label: 'Games', icon: 'ion:ios-game-controller-a-outline' },
  { to: '/wallet', label: 'Wallet', icon: 'ion:wallet-outline' },
];
</script>
