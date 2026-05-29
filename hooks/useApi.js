// hooks/useApi.js
import { useState, useEffect, useCallback } from 'react'
import { getErrorMessage } from '@/lib/utils'
import useAppStore from '@/store/appStore'

// ─── Generic fetch hook ───────────────────────────────────────
export function useFetch(apiFn, deps = [], options = {}) {
  const [data, setData] = useState(options.initialData || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useAppStore()

  const fetch = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn(...args)
      setData(res.data.data)
      return res.data.data
    } catch (err) {
      const msg = getErrorMessage(err)
      setError(msg)
      if (options.showError !== false) toast.error(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (options.skip) return
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// ─── Mutation hook (POST/PUT/DELETE) ─────────────────────────
export function useMutation(apiFn, options = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useAppStore()

  const mutate = async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn(...args)
      if (options.successMessage) toast.success(options.successMessage)
      if (options.onSuccess) options.onSuccess(res.data.data)
      return { success: true, data: res.data.data }
    } catch (err) {
      const msg = getErrorMessage(err)
      setError(msg)
      if (options.showError !== false) toast.error(msg)
      if (options.onError) options.onError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
