<template>
  <div class="flex">
    <!-- Sidebar (desktop) -->
    <sidebar class="hidden md:block" />

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Dock (mobile only) -->
    <dock class="md:hidden" />
  </div>
</template>

<script setup>
</script>
