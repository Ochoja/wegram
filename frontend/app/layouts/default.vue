<template>
  <div class="flex">
    <!-- Sidebar (desktop) -->
    <sidebar class="hidden md:block" />

    <!-- Main content -->
    <main class="flex-1">
      <!-- Top Menu mobile -->
      <div class="md:hidden flex justify-between px-3 text-3xl mt-2">
        <div><Icon name="mdi-light:menu" @click="handleShowMenu" /></div>
        <div><Icon name="iconamoon:profile-circle-light" /></div>
        <div
          v-if="showMenu"
          class="flex flex-col gap-2 absolute bg-white rounded-2xl p-4 text-black text-sm top-12">
          <NuxtLink
            v-for="(item, index) in menuItems"
            :to="item.to"
            :key="index"
            class="flex items-center gap-2">
            <Icon :name="item.icon" class="text-xl" />
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
      <slot />
    </main>

    <!-- Dock (mobile only) -->
    <dock class="md:hidden" />
  </div>
</template>

<script setup>
const route = useRoute();
const menuItems = [
  { label: 'AI', to: '/ai', icon: 'ion:sparkles-outline' },
  {
    label: 'Livestream',
    to: '/livestream',
    icon: 'fluent:live-24-regular',
  },
  { label: 'Games', to: '/games', icon: 'ion:ios-game-controller-a-outline' },
  { label: 'Whitepaper', to: '/whitepaper', icon: 'ion:document-text-outline' },
];

const showMenu = ref(false);

const handleShowMenu = () => {
  showMenu.value = !showMenu.value;
};

// Hide menu when route changes
watch(route, () => {
  showMenu.value = false;
});
</script>
