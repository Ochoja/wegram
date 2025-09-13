<template>
  <main class="h-screen overflow-auto">
    <header class="pt-8 pb-4 lg:px-10 md:px-5 px-4 border-b border-[#35358f]">
      <h1 class="font-[poppins] lg:text-[32px] md:text-[24px] text-[20px]">Feed</h1>
      <p class="font-[geist] text-[18px]">Your top posts all in one place</p>
    </header>

    <div class="body flex relative gap-4">
      <!-- Feeds Section -->
      <section class="feeds lg:w-[60%] md:w-[50%] w-full transition-filter duration-300 border-r border-[#35358f]" :class="{
        'filter blur-sm pointer-events-none select-none': activeFeed && isMobile,
      }">
        <!-- Create/Send post -->
        <form @submit.prevent="createPost" class="create-post flex gap-4 items-end border-b border-[#35358f] lg:px-10 md:px-5 px-4">
          <textarea name="post" id="create-post" placeholder="What's on your mind" class="font-[geist] p-4 outline-none w-full" rows="5"
            v-model.trim.lazy="post"></textarea>

          <button type="submit" aria-label="Send post button"
            class="bg-[#11119D] w-[100px] rounded-full py-2 px-3 flex items-center justify-center gap-2">
            Send
            <Icon name="ion:send-outline" />
          </button>
        </form>

        <!-- All Feeds for User -->
        <div class="all-feeds-container mt-10 py-8 flex flex-col gap-4 items-center justify-center">
          <FeedCard @comment-clicked="setActiveFeed(feed)" v-for="feed in feedData" :key="feed.id" :feed="feed" />
        </div>
      </section>

      <!-- Feed Details Section (Desktop) -->
      <section class="feed-details hidden md:block w-[40%]">
        <FeedDetails v-if="activeFeed" :feed="activeFeed" />
      </section>

      <!-- Feed Details Modal (Mobile) -->
      <transition name="fade">
        <div v-if="activeFeed && isMobile"
          class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm md:hidden">
          <FeedDetails :feed="activeFeed" />
        </div>
      </transition>
    </div>
  </main>
</template>

<script setup lang="ts">
import FeedCard from '~/components/feed-card.vue';
import { feedData, type FeedItem } from '~/data/feed';
import { ref, type Ref } from 'vue';

const activeFeed: Ref<FeedItem | null> = ref(null)
const post: Ref<string> = ref("");
const isMobile: Ref<boolean> = ref(false);

const setActiveFeed = (feed: FeedItem) => {
  activeFeed.value = feed;
}

const createPost = async () => {
  console.log(post)
}
</script>
