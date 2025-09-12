<template>
  <div class="flex min-h-screen">
    <!-- Sidebar (desktop) -->
    <Sidebar class="hidden md:block" />

    <!-- Main content -->
    <main class="flex-1 p-4">
      <slot />
    </main>

    <!-- Dock (mobile only) -->
    <Dock class="md:hidden" />
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import Dock from '@/components/Dock.vue';
</script>
