// hooks/useAuth.js
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/authStore'

export function useAuth() {
  const store = useAuthStore()
  return store
}

export function useRequireAuth() {
  const { isAuthenticated, fetchMe } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    if (!isAuthenticated) fetchMe()
  }, [isAuthenticated, fetchMe, router])

  return useAuthStore()
}
