<template>
  <main class="w-80">
    <form @submit.prevent="submit" class="space-y-4">
      <div class="user-fullname">
        <label for="user-fullname"></label>
        <input v-model="name" id="user-fullname" type="text" placeholder="Fullname"
          class="w-full p-2 rounded-lg bg-card border border-border" />
      </div>

      <div class="user-email">
        <label for="user-email"></label>
        <input v-model="email" id="user-email" type="email" placeholder="Email"
          class="w-full p-2 rounded-lg bg-card border border-border" />
      </div>

      <div class="user-password">
        <label for="user-password"></label>
        <div class="password-input border flex items-center gap-2 rounded-lg border-border px-2">
          <input v-model="password" id="user-password" :type="showPassword ? 'text' : 'password'" placeholder="Password"
            class="w-full py-2 outline-none rounded-lg bg-card" />

          <Icon v-if="showPassword" name="uil:eye-slash" class="text-[20px] cursor-pointer"
            @click="showPassword = !showPassword" />
          <Icon v-else name="uil:eye" class="text-[20px] cursor-pointer" @click="showPassword = !showPassword" />
        </div>
      </div>

      <div class="login-button">
        <button type="submit" class="w-full py-3 rounded-full bg-[#11119D] text-white">
          Signup
        </button>
      </div>
    </form>

    <div class="other-auth-options">
      <p class="mt-4 text-sub text-center">
        Have have an account?
        <NuxtLink to="/auth/login" class="text-blue-500">Login</NuxtLink>
      </p>

      <p class="text-center my-7">OR</p>

      <button type="button" aria-label="Auth with x(formerly twitter)"
        class="flex items-center justify-center gap-2 rounded-full py-3 w-full bg-[#11119D]">Continue with
        <Icon name="ion:logo-x" />
      </button>
    </div>
  </main>
</template>

<script setup>
definePageMeta({
  layout: 'auth',
});

import { useAuthStore } from '@/stores/auth';
const name = ref('');
const email = ref('');
const password = ref('');
const auth = useAuthStore();

function submit() {
  auth.login('fake-jwt-token', { id: Date.now(), name });
  navigateTo('/');
}
</script>
