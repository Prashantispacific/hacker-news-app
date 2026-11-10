import { useState, useEffect, useCallback } from 'react'
import { getReadStoryIds, saveReadStoryIds } from '../services/storage'

export function useReadState() {
  const [readIds, setReadIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    getReadStoryIds().then((ids) => {
      setReadIds(new Set(ids))
    })
  }, [])

  const markAsRead = useCallback((storyId: number) => {
    setReadIds((prev) => {
      if (prev.has(storyId)) return prev
      const updated = new Set(prev)
      updated.add(storyId)
      saveReadStoryIds(Array.from(updated))
      return updated
    })
  }, [])

  const isRead = useCallback((storyId: number) => {
    return readIds.has(storyId)
  }, [readIds])

  return {
    isRead,
    markAsRead,
  }
}
