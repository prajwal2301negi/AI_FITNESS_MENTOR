// store/appStore.js
import { create } from 'zustand'

const useAppStore = create((set, get) => ({
  // ─── Toast notifications ─────────────────────────────────
  toasts: [],

  addToast: (toast) => {
    const id = Date.now().toString()
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }))
    // Auto remove after 4 seconds
    setTimeout(() => get().removeToast(id), 4000)
    return id
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Helpers
  toast: {
    success: (message) =>
      useAppStore.getState().addToast({ type: 'success', message }),
    error: (message) =>
      useAppStore.getState().addToast({ type: 'error', message }),
    info: (message) =>
      useAppStore.getState().addToast({ type: 'info', message }),
  },

  // ─── Global loading ───────────────────────────────────────
  globalLoading: false,
  setGlobalLoading: (val) => set({ globalLoading: val }),

  // ─── Sidebar state ────────────────────────────────────────
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))

export default useAppStore
