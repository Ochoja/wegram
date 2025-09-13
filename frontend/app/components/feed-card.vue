<template>
  <div class="bg-[#0F1528] border border-[#1C2440] rounded-2xl p-4 shadow-sm">
    <h3 class="font-semibold mb-2">{{ author }}</h3>
    <p class="text-[#9AA5C6]">{{ content }}</p>
  </div>
</template>

<script setup>
defineProps({
  author: String,
  content: String,
});
</script>
