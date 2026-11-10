import { useState, useEffect, useCallback } from 'react'
import type { Story } from '../types'
import { getBookmarkedStories, saveBookmarkedStories } from '../services/storage'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBookmarkedStories().then((saved) => {
      setBookmarks(saved || [])
      setLoading(false)
    })
  }, [])

  const isBookmarked = useCallback((storyId: number) => {
    return bookmarks.some((s) => s.id === storyId)
  }, [bookmarks])

  const toggleBookmark = useCallback(async (story: Story) => {
    setBookmarks((prev) => {
      const exists = prev.some((s) => s.id === story.id)
      const updated = exists ? prev.filter((s) => s.id !== story.id) : [story, ...prev]
      saveBookmarkedStories(updated)
      return updated
    })
  }, [])

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    loading,
  }
}
