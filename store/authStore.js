// store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI, userAPI } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // ─── Register ───────────────────────────────────────────
      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await authAPI.register(data)
          const { user, accessToken } = res.data.data
          localStorage.setItem('accessToken', accessToken)
          set({ user, token: accessToken, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (err) {
          const error = getErrorMessage(err)
          set({ error, isLoading: false })
          return { success: false, error }
        }
      },

      // ─── Login ──────────────────────────────────────────────
      login: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await authAPI.login(data)
          const { user, accessToken } = res.data.data
          localStorage.setItem('accessToken', accessToken)
          set({ user, token: accessToken, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (err) {
          const error = getErrorMessage(err)
          set({ error, isLoading: false })
          return { success: false, error }
        }
      },

      // ─── Logout ─────────────────────────────────────────────
      logout: async () => {
        try { await authAPI.logout() } catch (_) {}
        localStorage.removeItem('accessToken')
        set({ user: null, token: null, isAuthenticated: false, error: null })
      },

      // ─── Fetch current user ──────────────────────────────────
      fetchMe: async () => {
        try {
          const res = await userAPI.getMe()
          set({ user: res.data.data, isAuthenticated: true })
        } catch (_) {
          set({ user: null, isAuthenticated: false })
        }
      },

      // ─── Update user in store ────────────────────────────────
      setUser: (user) => set({ user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
