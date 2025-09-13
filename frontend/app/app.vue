<script setup lang="ts">
import { useAuthStore } from '#imports';
const auth = useAuthStore();

onMounted(() => {
  auth.intialize();
})
</script>

<template>
  <div class="bg-[#070744] text-white h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
div, main {
  font-family: 'Poppins', 'Geist', 'Righteous';
}
</style>
