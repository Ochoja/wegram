<script setup lang="ts">
import { useAuthStore } from '#imports'

const auth = useAuthStore()

onBeforeMount(async () => {
  await auth.getUser()
})

</script>

<template>
  <main class="flex flex-col items-center min-h-screen bg-[#070744] text-text lg:px-10 md:px-5 px-4 py-16">
      <header class="w-full text-center">
        <p class="text-white mb-8 lg:text-7xl md:text-6xl text-5xl font-semibold font-[righteous]">WeGram</p>
        <div class="auth-options max-w-[350px] mx-auto flex items-center justify-around gap-8">
          <button type="button" aria-label="Login option"><NuxtLink active-class="border-b" to="/auth/login" class="px-4 block py-2">Login</NuxtLink></button>
          <button type="button" aria-label="Signup option"><NuxtLink active-class="border-b" to="/auth/signup" class="px-4 block py-2">Signup</NuxtLink></button>
        </div>
      </header>

      <div class="body my-10">
        <slot />
      </div>
  </main>
</template>