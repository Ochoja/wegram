<template>
  <section>
    <h1 class="text-2xl font-bold mb-4">Feed</h1>
    <div class="space-y-4">
      <FeedCard
        v-for="post in posts"
        :key="post.id"
        :author="post.author"
        :content="post.content" />
    </div>
  </section>
</template>

<script setup>
import FeedCard from '@/components/FeedCard.vue';

const posts = [
  { id: 1, author: 'Alice', content: 'Just joined WEGRAM 🎉' },
  { id: 2, author: 'Bob', content: 'Exploring Web3 🚀' },
];
</script>
