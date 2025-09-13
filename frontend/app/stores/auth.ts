import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as { id: string; name: string, email: string, isAuthenticated: boolean, isLogedIn: boolean } | null,
    supabaseUrl: "" as string,
    supabaseKey: "" as string,
  }),
  actions: {
    intialize() {
      const config = useRuntimeConfig();
      this.supabaseKey = config.public.publishableKey;
      this.supabaseUrl = config.public.supabaseUrl;
    },
    async login(email: string, password: string) {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey)
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if(data.user) {
        this.user = {
          name: data.user.user_metadata.name as string,
          id: data.user.id,
          email: data.user.email as string,
          isLogedIn: true,
          isAuthenticated: data.user.aud === "authenticated" ? true : false,
        }
        return data;
      } else {
        const message = error instanceof Error ? error.message : String(error)
        throw Error (message)
      }
    },
    async signup(email: string, name: string, password: string) {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        },
      })

      if(data.user) {
        this.user = {
          name: data.user.user_metadata.name as string,
          id: data.user.id,
          email: data.user.email as string,
          isLogedIn: true,
          isAuthenticated: data.user.aud === "authenticated" ? true : false,
        }

        return data;
      } else {
        const message = error instanceof Error ? error.message : String(error)
        throw Error (message)
      }
    },
    async signInWithTwitter(): Promise<any> {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
      })
      console.log(data);
      console.log(error);
    },
    async codeForSession(code: string) {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey)
      const {error, data} = await supabase.auth.exchangeCodeForSession(code);
      console.log(error)
      console.log(data);
    },
    logout() {
      this.token = null;
      this.user = null;
    },
    async signOut() {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey)
      const { error } = await supabase.auth.signOut()
      console.log(error);
    },
  },
});
