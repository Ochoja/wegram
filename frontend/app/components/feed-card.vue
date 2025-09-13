<template>
  <div class="border-b border-[#11119D] lg:px-10 md:px-5 p-4 flex flex-col gap-4 w-full">
    <!-- Header: User image, username, time -->
    <div class="flex items-center justify-between gap-3">
      <div class="user-avatar flex items-center gap-2">
        <img :src="feed.userImage" alt="User avatar"
          class="w-16 h-16 rounded-full object-cover border border-[#1C2440] flex-shrink-0" />
        <span class="font-semibold text-white text-sm">{{ feed.username }}</span>
      </div>
      <div class="flex gap-4 items-center justify-between">
        <span class="text-sm text-[#9AA5C6]">{{ timeAgo(feed.time) }}</span>
      </div>
    </div>
    <!-- Feed Content -->
    <div class="text-[#9AA5C6] text-base break-words">
      {{ feed.content }}
    </div>
    <!-- Actions: Like, Comment, Save -->
    <div class="flex items-center justify-between mt-2">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-1 cursor-pointer hover:text-blue-400 transition-colors">
          <Icon name="mdi:heart-outline" class="w-5 h-5" />
          <span class="text-sm text-[#9AA5C6]">{{ feed.likes }}</span>
        </div>
        <button @click="$emit('comment-clicked')" type="button" aria-label="Open comments button"
          class="flex items-center gap-1 cursor-pointer hover:text-blue-400 transition-colors">
          <Icon name="mdi:comment-outline" class="w-5 h-5" />
          <span class="text-sm text-[#9AA5C6]">{{ feed.comments.length }}</span>
        </button>
        <div class="flex items-center gap-1 cursor-pointer hover:text-blue-400 transition-colors">
          <Icon name="mdi:bookmark-outline" class="w-5 h-5" />
          <span class="text-sm text-[#9AA5C6]">{{ feed.saves }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type FeedItem, timeAgo } from "~/data/feed"
defineProps<{
  feed: FeedItem,
}>();

defineEmits(['comment-clicked'])
</script>
