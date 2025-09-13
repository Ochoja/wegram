<template>
  <div class="flex min-h-screen">
    <!-- Sidebar (desktop) -->
    <sidebar class="hidden md:block" />

    <!-- Main content -->
    <main class="flex-1 p-4">
      <slot />
    </main>

    <!-- Dock (mobile only) -->
    <dock class="md:hidden" />
  </div>
</template>

<script setup>
</script>
