<template>
  <main class="w-80">
    <form @submit.prevent="submit" class="space-y-4">
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
        <button type="submit"
          class="w-full py-3 h-[50px] flex items-center justify-center rounded-full bg-[#11119D] text-white">
          <Icon v-if="loading" name="ion:load-c" class="animate-spin text-[20px]" />
          <span v-else>Login</span>
        </button>
      </div>
    </form>

    <div class="other-auth-options">
      <p class="mt-4 text-sub text-center">
        Don’t have an account?
        <NuxtLink to="/auth/signup" class="text-blue-500">Sign up</NuxtLink>
      </p>

      <p class="text-center my-7">OR</p>

      <button @click="signInWithTwitter" type="button" aria-label="Auth with x(formerly twitter)"
        class="flex items-center justify-center gap-2 rounded-full py-3 w-full bg-[#11119D]">Continue with
        <Icon name="ion:logo-x" />
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

definePageMeta({
  layout: 'auth',
});

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const auth = useAuthStore();

const { signInWithTwitter } = auth

async function submit() {
  loading.value = true;
  try {
    const { user } = await auth.login(email.value, password.value);
    if (user) {
      navigateTo('/');
    }
    loading.value = false;
  } catch (err) {
    console.log(err)
    const message = err instanceof Error ? err.message : String(err)
    alert(message);
    loading.value = false;
  }
}
</script>
