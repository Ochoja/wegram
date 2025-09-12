<template>
  <div class="flex min-h-screen bg-[#0A0F1D] text-[#E6ECFF]">
    <Sidebar class="hidden md:block" />
    <main class="flex-1 p-4">
      <NuxtPage />
    </main>
    <Dock class="md:hidden" />
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import Dock from '@/components/Dock.vue';
</script>
