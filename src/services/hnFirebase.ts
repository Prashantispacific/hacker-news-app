import { HN_FIREBASE_BASE } from '../config/constants'
import type { Story, HNItem, CommentNode } from '../types'

// In-memory LRU cache to prevent re-fetching items during session
const itemCache = new Map<number, HNItem>()
const MAX_CACHE_SIZE = 1500

function cacheItem(item: HNItem) {
  if (itemCache.size >= MAX_CACHE_SIZE) {
    const firstKey = itemCache.keys().next().value
    if (firstKey !== undefined) itemCache.delete(firstKey)
  }
  itemCache.set(item.id, item)
}

export async function fetchItem(id: number): Promise<HNItem | null> {
  if (itemCache.has(id)) {
    return itemCache.get(id)!
  }

  try {
    const res = await fetch(`${HN_FIREBASE_BASE}/item/${id}.json`)
    if (!res.ok) return null
    const data: HNItem = await res.json()
    if (data) {
      cacheItem(data)
    }
    return data
  } catch (err) {
    console.error(`Error fetching item ${id}:`, err)
    return null
  }
}

export async function fetchStoryIds(feedType: string = 'top'): Promise<number[]> {
  let endpoint = 'topstories'
  if (feedType === 'best') endpoint = 'beststories'
  if (feedType === 'new') endpoint = 'newstories'
  if (feedType === 'show') endpoint = 'showstories'
  if (feedType === 'ask') endpoint = 'askstories'
  if (feedType === 'jobs') endpoint = 'jobstories'

  try {
    const res = await fetch(`${HN_FIREBASE_BASE}/${endpoint}.json`)
    if (!res.ok) return []
    const ids: number[] = await res.json()
    return ids || []
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err)
    return []
  }
}

export async function fetchStoriesBatch(ids: number[]): Promise<Story[]> {
  const promises = ids.map((id) => fetchItem(id))
  const items = await Promise.all(promises)
  return items.filter((item): item is Story => {
    return item !== null && !item.deleted && !item.dead && !!item.title
  })
}

// Fetch deeply nested comment tree
export async function fetchCommentTree(
  rootKids: number[] = [],
  storyAuthor?: string,
  onProgress?: (loaded: number) => void
): Promise<CommentNode[]> {
  let loadedCount = 0

  async function buildNode(id: number, level: number, parentAuthor?: string): Promise<CommentNode | null> {
    const item = await fetchItem(id)
    if (!item || item.deleted || item.dead || !item.text) {
      return null
    }

    loadedCount++
    if (onProgress) onProgress(loadedCount)

    let children: CommentNode[] = []
    let childDescendants = 0

    if (item.kids && item.kids.length > 0) {
      // Parallel fetch kids with concurrency safety
      const childPromises = item.kids.map((kidId) => buildNode(kidId, level + 1, item.by))
      const results = await Promise.all(childPromises)
      children = results.filter((c): c is CommentNode => c !== null)
      childDescendants = children.reduce((acc, c) => acc + 1 + (c.totalDescendants || 0), 0)
    }

    return {
      id: item.id,
      by: item.by || 'anonymous',
      text: item.text,
      time: item.time || Math.floor(Date.now() / 1000),
      parent: item.parent || 0,
      kids: children,
      level,
      parentAuthor,
      deleted: item.deleted,
      dead: item.dead,
      totalDescendants: childDescendants,
    }
  }

  const rootPromises = rootKids.map((kidId) => buildNode(kidId, 0, storyAuthor))
  const roots = await Promise.all(rootPromises)
  return roots.filter((r): r is CommentNode => r !== null)
}
