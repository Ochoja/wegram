import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as { id: string; avatar?: string, name: string, email: string, isAuthenticated: boolean, isLogedIn: boolean } | null,
    supabaseUrl: "" as string,
    supabaseKey: "" as string,
    accessToken: "" as string,
    refreshToken: "" as string,
  }),
  actions: {
    intialize() {
      const config = useRuntimeConfig();
      this.supabaseKey = config.public.publishableKey;
      this.supabaseUrl = config.public.supabaseUrl;
    },
    async setSession( accessToken: string, refreshToken: string ) {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        console.error('Error setting session:', error);
        return false;
      }
      this.user = {
        name: data.user?.user_metadata.name,
        id: data.user?.id as string,
        email: data.user?.email as string,
        isAuthenticated: data.user?.aud === "authenticated" ? true : false,
        isLogedIn: true
      }
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      return data;
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
      })

      if(error) {
        const message = error instanceof Error ? error.message : String(error)
        throw Error (message)
      }
    },
    async getUser () {
      const supabase = createClient(this.supabaseUrl, this.supabaseKey)
      const {data, error} = await supabase.auth.getUser();
      console.log(data)
      if(data && data.user) {
        const {user} = data
        this.user = {
          id: user.id,
          email: user.email as string,
          isAuthenticated: user.aud === "authenticated" ? true : false,
          isLogedIn: true,
          name: user.user_metadata.name,
          avatar: user.user_metadata.avatar_url || "", 
        }
      }
      console.log(error)
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
