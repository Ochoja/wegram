<template>
  <section>
    <h1 class="text-2xl font-bold mb-4">Chats</h1>
    <ul class="space-y-2">
      <li
        v-for="chat in chats"
        :key="chat.id"
        class="bg-card p-3 rounded-xl border border-border">
        <NuxtLink :to="`/dm/${chat.id}`">
          <strong>{{ chat.user }}</strong> — {{ chat.lastMessage }}
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup>
const chats = [
  { id: 1, user: 'Alice', lastMessage: 'Hey!' },
  { id: 2, user: 'Bob', lastMessage: 'What’s up?' },
];
</script>
