import { useState, useEffect, useCallback, useRef } from 'react'
import type { Channel, MuteRules, Story } from '../types'
import { fetchStoryIds, fetchStoriesBatch } from '../services/hnFirebase'
import { fetchPastStories, searchChannelStories } from '../services/hnAlgolia'
import { isStoryMuted } from '../utils/channelMatcher'

const PAGE_SIZE = 30

export function useStories(
  activeChannel: Channel,
  muteRules: MuteRules,
  bookmarks: Story[]
) {
  const [allStoryIds, setAllStoryIds] = useState<number[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [mutedCount, setMutedCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const activeChannelRef = useRef(activeChannel)
  activeChannelRef.current = activeChannel

  // Initial fetch when channel changes
  const loadInitial = useCallback(async () => {
    setLoading(true)
    setMutedCount(0)
    setPage(0)

    // 1. Saved Bookmarks channel
    if (activeChannel.id === 'saved' || activeChannel.feedType === 'saved') {
      const filtered = bookmarks.filter((s) => !isStoryMuted(s, muteRules))
      setStories(filtered)
      setMutedCount(bookmarks.length - filtered.length)
      setHasMore(false)
      setLoading(false)
      return
    }

    // 2. Past front page stories
    if (activeChannel.feedType === 'past' || activeChannel.id === 'past') {
      try {
        const pastHits = await fetchPastStories(0)
        let muted = 0
        const visible = pastHits.filter((s) => {
          if (isStoryMuted(s, muteRules)) {
            muted++
            return false
          }
          return true
        })
        setStories(visible)
        setMutedCount(muted)
        setPage(1)
        setHasMore(pastHits.length >= PAGE_SIZE)
      } catch (err) {
        console.error('Failed to load past stories:', err)
      } finally {
        setLoading(false)
      }
      return
    }

    // 3. Custom Channels or keyword/domain channels (e.g. #systems, #essays, or user-created #custom)
    if (
      activeChannel.isCustom ||
      (activeChannel.keywords && activeChannel.keywords.length > 0) ||
      (activeChannel.domains && activeChannel.domains.length > 0)
    ) {
      try {
        const hits = await searchChannelStories(
          activeChannel.keywords,
          activeChannel.domains,
          activeChannel.minScore || 0,
          0
        )
        let muted = 0
        const visible = hits.filter((s) => {
          if (isStoryMuted(s, muteRules)) {
            muted++
            return false
          }
          return true
        })
        setStories(visible)
        setMutedCount(muted)
        setPage(1)
        setHasMore(hits.length >= PAGE_SIZE)
      } catch (err) {
        console.error('Failed to load custom channel stories:', err)
      } finally {
        setLoading(false)
      }
      return
    }

    // 4. Standard Firebase HN Feeds (top, new, best, ask, show, jobs)
    try {
      const feedType = activeChannel.feedType || 'top'
      const ids = await fetchStoryIds(feedType)
      setAllStoryIds(ids)

      // Fetch first batch of 30 stories
      const initialBatchIds = ids.slice(0, PAGE_SIZE)
      const fetchedStories = await fetchStoriesBatch(initialBatchIds)

      let mutedInBatch = 0
      const visible = fetchedStories.filter((s) => {
        if (isStoryMuted(s, muteRules)) {
          mutedInBatch++
          return false
        }
        if (activeChannel.id === 'links' && (!s.url || s.url.includes('news.ycombinator.com'))) {
          return false
        }
        return true
      })

      setStories(visible)
      setMutedCount(mutedInBatch)
      setPage(1)
      setHasMore(PAGE_SIZE < ids.length)
    } catch (err) {
      console.error('Failed to load stories:', err)
    } finally {
      setLoading(false)
    }
  }, [activeChannel, muteRules, bookmarks])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  // Load next batch / pagination
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || activeChannel.id === 'saved') return

    setLoadingMore(true)

    // For Past stories: fetch next page via Algolia
    if (activeChannel.feedType === 'past' || activeChannel.id === 'past') {
      try {
        const nextHits = await fetchPastStories(page)
        let newlyMuted = 0
        const visible = nextHits.filter((s) => {
          if (isStoryMuted(s, muteRules)) {
            newlyMuted++
            return false
          }
          return true
        })
        setStories((prev) => [...prev, ...visible])
        setMutedCount((prev) => prev + newlyMuted)
        setPage((prev) => prev + 1)
        setHasMore(nextHits.length >= PAGE_SIZE)
      } catch (err) {
        console.error('Failed to load more past stories:', err)
      } finally {
        setLoadingMore(false)
      }
      return
    }

    // For Custom / keyword channels: fetch next page via Algolia
    if (
      activeChannel.isCustom ||
      (activeChannel.keywords && activeChannel.keywords.length > 0) ||
      (activeChannel.domains && activeChannel.domains.length > 0)
    ) {
      try {
        const hits = await searchChannelStories(
          activeChannel.keywords,
          activeChannel.domains,
          activeChannel.minScore || 0,
          page
        )
        let newlyMuted = 0
        const visible = hits.filter((s) => {
          if (isStoryMuted(s, muteRules)) {
            newlyMuted++
            return false
          }
          return true
        })
        setStories((prev) => [...prev, ...visible])
        setMutedCount((prev) => prev + newlyMuted)
        setPage((prev) => prev + 1)
        setHasMore(hits.length >= PAGE_SIZE)
      } catch (err) {
        console.error('Failed to load more custom channel stories:', err)
      } finally {
        setLoadingMore(false)
      }
      return
    }

    // For Firebase standard feeds: paginate IDs
    const startIndex = page * PAGE_SIZE
    const nextBatchIds = allStoryIds.slice(startIndex, startIndex + PAGE_SIZE)

    if (nextBatchIds.length === 0) {
      setHasMore(false)
      setLoadingMore(false)
      return
    }

    try {
      const fetchedStories = await fetchStoriesBatch(nextBatchIds)
      let newlyMuted = 0

      const visible = fetchedStories.filter((s) => {
        if (isStoryMuted(s, muteRules)) {
          newlyMuted++
          return false
        }
        if (activeChannel.id === 'links' && (!s.url || s.url.includes('news.ycombinator.com'))) {
          return false
        }
        return true
      })

      setStories((prev) => [...prev, ...visible])
      setMutedCount((prev) => prev + newlyMuted)
      setPage((prev) => prev + 1)
      setHasMore(startIndex + PAGE_SIZE < allStoryIds.length)
    } catch (err) {
      console.error('Failed to load more stories:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, page, allStoryIds, muteRules, activeChannel])

  return {
    stories,
    loading,
    loadingMore,
    loadMore,
    refresh: loadInitial,
    hasMore,
    mutedCount,
  }
}
