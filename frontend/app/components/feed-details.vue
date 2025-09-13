<template>
  <div class="max-w-2xl mx-auto border border-gray-900 text-white rounded-lg shadow-xl mt-6">
    <!-- Header -->
    <div class="flex items-center px-4 pt-4">
      <img
        v-if="feed.userImage"
        :src="feed.userImage"
        alt="User Avatar"
        class="w-12 h-12 rounded-full object-cover mr-3"
      />
      <div class="flex flex-col">
        <span class="font-semibold text-gray-100 leading-tight">{{ feed.username }}</span>
        <span class="text-gray-100 text-sm">@{{ feed.username }}</span>
      </div>
    </div>
    <!-- Post Content -->
    <div class="px-4 mt-3">
      <p class="text-xl text-gray-100 break-words whitespace-pre-line">
        {{ feed.content }}
      </p>
    </div>
    <!-- Post Meta -->
    <div class="px-4 mt-4 flex flex-wrap items-center text-gray-100 text-sm gap-x-2 gap-y-1">
      <span v-if="feed.time">{{ timeAgo(feed.time) }}</span>
      <span v-if="feed.location" class="hidden sm:inline">· {{ feed.location }}</span>
      <span v-if="feed.saves !== undefined" class="hidden sm:inline">· {{ feed.saves }} Saves</span>
    </div>
    <div class="border-b border-[#35358f] my-4"></div>
    <!-- Actions -->
    <div class="flex justify-between px-4 pb-2">
      <button class="flex items-center space-x-2 text-gray-100 hover:text-[#11119D] transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2"></path>
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v-6"></path>
        </svg>
        <span class="text-sm">{{ feed.comments?.length || 0 }}</span>
      </button>
      <button class="flex items-center space-x-2 text-gray-100 hover:text-green-500 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path>
        </svg>
        <span class="text-sm">{{ feed.shares || 0 }}</span>
      </button>
      <button class="flex items-center space-x-2 text-gray-100 hover:text-pink-500 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
        </svg>
        <span class="text-sm">{{ feed.likes || 0 }}</span>
      </button>
      <button class="flex items-center space-x-2 text-gray-100 hover:text-blue-400 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2"></path>
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v-6"></path>
        </svg>
        <span class="text-sm">Share</span>
      </button>
    </div>
    <!-- Reply Box -->
    <div class="px-4 py-3 border-t border-[#35358f] flex items-start gap-3">
      <img
        v-if="user?.avatar"
        :src="user.avatar"
        alt="Your Avatar"
        class="w-10 h-10 rounded-full object-cover"
      />
      <textarea
        class="flex-1 resize-none border border-[#35358f] rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#11119D] text-gray-100"
        rows="4"
        placeholder="Post your reply"
        v-model="reply"
      ></textarea>
      <button
        class="ml-2 px-4 py-2 bg-[#11119D] text-white rounded-full font-semibold hover:bg-[#11119D] transition disabled:opacity-50"
        :disabled="!reply.trim()"
        @click="postReply"
      >
        Reply
      </button>
    </div>
    <!-- Replies List -->
    <div v-if="feed.comments && feed.comments.length" class="px-4 pb-4">
      <div v-for="(r, idx) in feed.comments" :key="r.id" class="flex items-start gap-3 py-3 border-b border-[#35358f] last:border-b-0">
        <img
          v-if="r.userImage"
          :src="r.userImage"
          alt="Reply Avatar"
          class="w-9 h-9 rounded-full object-cover"
        />
        <div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-100 text-sm">{{ r.username }}</span>
            <span class="text-gray-100 text-xs">@{{ r.username }}</span>
            <span class="text-gray-100 text-xs">· {{ timeAgo(r.time) }}</span>
          </div>
          <p class="text-gray-300 text-sm mt-1 break-words whitespace-pre-line">{{ r.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type FeedItem, timeAgo } from "~/data/feed"
const props = defineProps<{
  feed: FeedItem,
  user?: { avatar?: string }
}>()

const reply = ref('')

function postReply() {
  if (!reply.value.trim()) return
  // This is a stub. In a real app, emit or call an API.
  // For demo, just clear the input.
  reply.value = ''
}
</script>

