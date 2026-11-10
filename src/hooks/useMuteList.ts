import { useState, useEffect, useCallback } from 'react'
import type { MuteRules } from '../types'
import { DEFAULT_MUTE_RULES } from '../config/constants'
import { getMuteRules, saveMuteRules } from '../services/storage'

export function useMuteList() {
  const [muteRules, setMuteRules] = useState<MuteRules>(DEFAULT_MUTE_RULES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMuteRules().then((saved) => {
      setMuteRules(saved || DEFAULT_MUTE_RULES)
      setLoading(false)
    })
  }, [])

  const addRule = useCallback(async (type: 'keywords' | 'domains' | 'authors', value: string) => {
    const clean = value.trim().toLowerCase()
    if (!clean) return

    setMuteRules((prev) => {
      if (prev[type].includes(clean)) return prev
      const updated = {
        ...prev,
        [type]: [...prev[type], clean],
      }
      saveMuteRules(updated)
      return updated
    })
  }, [])

  const removeRule = useCallback(async (type: 'keywords' | 'domains' | 'authors', value: string) => {
    setMuteRules((prev) => {
      const updated = {
        ...prev,
        [type]: prev[type].filter((item) => item !== value),
      }
      saveMuteRules(updated)
      return updated
    })
  }, [])

  const clearAllRules = useCallback(async () => {
    const empty = { keywords: [], domains: [], authors: [] }
    setMuteRules(empty)
    await saveMuteRules(empty)
  }, [])

  return {
    muteRules,
    addRule,
    removeRule,
    clearAllRules,
    loading,
  }
}
