<template>
  <aside
    class="w-[300px] h-screen border-r border-[#35358f] px-4 py-8 space-y-4 border">
    <div class="logo">
      <p
        class="lg:text-4xl md:text-3xl text-2xl font-[righteous] font-semibold">
        WeGram
      </p>
    </div>

    <div class="sidebar-links mt-10">
      <ul class="flex flex-col gap-4">
        <li v-for="item in items" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="p-4 rounded-[16px] hover:bg-border transition flex items-center gap-3 lg:text-[18px]"
            active-class="bg-[#11119D] font-semibold">
            <Icon :name="item.icon" class="text-[24px]" />
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- <button @click="logout" class="mt-6 block w-full text-left px-2 py-2 rounded-lg bg-red-600 text-white">
      Logout
    </button> -->
  </aside>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
const items = [
  { to: '/', label: 'Feed', icon: 'ion:home-outline' },
  { to: '/explore', label: 'Explore', icon: 'ion:search' },
  { to: '/wallet', label: 'Wallet', icon: 'ion:wallet-outline' },
  { to: '/chat', label: 'Messages', icon: 'ion:chatbox-ellipses-outline' },
  { to: '/whitepaper', label: 'Whitepaper', icon: 'ion:document-text-outline' },
  { to: '/ai', label: 'AI', icon: 'ion:sparkles-outline' },
  { to: '/games', label: 'Games', icon: 'ion:ios-game-controller-a-outline' },
  {
    to: '/livestream',
    label: 'Livestream',
    icon: 'fluent:live-24-regular',
  },
];

function logout() {
  auth.logout();
  navigateTo('/auth/login');
}
</script>
