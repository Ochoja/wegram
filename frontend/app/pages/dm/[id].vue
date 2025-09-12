<template>
  <section class="flex flex-col h-full">
    <h1 class="text-xl font-bold mb-4">DM with {{ user }}</h1>
    <div class="flex-1 overflow-y-auto space-y-2">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="p-2 rounded-lg max-w-[70%]"
        :class="
          msg.from === 'me'
            ? 'bg-blue-600 ml-auto text-white'
            : 'bg-card text-text'
        ">
        {{ msg.text }}
      </div>
    </div>
    <div class="flex gap-2 mt-4">
      <input
        v-model="newMessage"
        placeholder="Type a message..."
        class="flex-1 p-2 rounded-lg bg-card border border-border" />
      <button @click="send" class="px-4 py-2 rounded-lg bg-blue-600 text-white">
        Send
      </button>
    </div>
  </section>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
const user = 'User ' + route.params.id;

const messages = ref([
  { id: 1, from: 'them', text: 'Hey there!' },
  { id: 2, from: 'me', text: 'Hello 👋' },
]);
const newMessage = ref('');

function send() {
  if (!newMessage.value) return;
  messages.value.push({ id: Date.now(), from: 'me', text: newMessage.value });
  newMessage.value = '';
}
</script>
