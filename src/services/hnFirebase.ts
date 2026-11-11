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

// Fetch deeply nested comment tree with real-time progressive streaming
export interface FetchCommentOptions {
  onProgress?: (loaded: number) => void
  onTreeUpdate?: (tree: CommentNode[], loaded: number) => void
  isCancelled?: () => boolean
}

export async function fetchCommentTree(
  rootKids: number[] = [],
  storyAuthor?: string,
  options?: FetchCommentOptions | ((loaded: number) => void)
): Promise<CommentNode[]> {
  const opts: FetchCommentOptions =
    typeof options === 'function' ? { onProgress: options } : options || {}

  const { onProgress, onTreeUpdate, isCancelled = () => false } = opts

  if (!rootKids || rootKids.length === 0) return []

  let loadedCount = 0
  const rootNodes: (CommentNode | null | undefined)[] = new Array(rootKids.length).fill(null)

  let updateTimer: ReturnType<typeof setTimeout> | null = null
  let pendingUpdate = false

  const emitTreeUpdate = (force = false) => {
    if (isCancelled()) return
    if (!onTreeUpdate) return

    const flush = () => {
      if (isCancelled()) return
      const currentList: CommentNode[] = []
      for (const node of rootNodes) {
        if (node) {
          // Clone shallowly to produce a new array reference
          currentList.push({ ...node })
        }
      }
      onTreeUpdate(currentList, loadedCount)
      pendingUpdate = false
    }

    if (force) {
      if (updateTimer) clearTimeout(updateTimer)
      flush()
      return
    }

    if (!pendingUpdate) {
      pendingUpdate = true
      updateTimer = setTimeout(() => {
        flush()
      }, 60)
    }
  }

  // Recursive child fetcher
  async function fetchKidsRecursive(
    kidIds: number[],
    level: number,
    parentAuthor?: string
  ): Promise<CommentNode[]> {
    if (isCancelled() || !kidIds || kidIds.length === 0) return []

    const childPromises = kidIds.map(async (kidId) => {
      if (isCancelled()) return null
      const item = await fetchItem(kidId)
      if (isCancelled() || !item || item.deleted || item.dead || !item.text) {
        return null
      }

      loadedCount++
      if (onProgress) onProgress(loadedCount)

      const hasKids = !!(item.kids && item.kids.length > 0)
      const childNode: CommentNode = {
        id: item.id,
        by: item.by || 'anonymous',
        text: item.text,
        time: item.time || Math.floor(Date.now() / 1000),
        parent: item.parent || 0,
        kids: [],
        level,
        parentAuthor,
        deleted: item.deleted,
        dead: item.dead,
        totalDescendants: 0,
        isLoadingReplies: hasKids,
      }

      // If this child itself has kids, recursively fetch
      if (hasKids) {
        const grandChildren = await fetchKidsRecursive(item.kids!, level + 1, item.by)
        if (!isCancelled()) {
          childNode.kids = grandChildren
          childNode.totalDescendants = grandChildren.reduce(
            (acc, c) => acc + 1 + (c.totalDescendants || 0),
            0
          )
          childNode.isLoadingReplies = false
        }
      }

      return childNode
    })

    const results = await Promise.all(childPromises)
    return results.filter((c): c is CommentNode => c !== null)
  }

  // Process root comments in parallel
  const rootPromises = rootKids.map(async (rootId, index) => {
    if (isCancelled()) return
    const item = await fetchItem(rootId)
    if (isCancelled()) return

    if (!item || item.deleted || item.dead || !item.text) {
      rootNodes[index] = undefined
      return
    }

    loadedCount++
    if (onProgress) onProgress(loadedCount)

    const hasKids = !!(item.kids && item.kids.length > 0)
    const node: CommentNode = {
      id: item.id,
      by: item.by || 'anonymous',
      text: item.text,
      time: item.time || Math.floor(Date.now() / 1000),
      parent: item.parent || 0,
      kids: [],
      level: 0,
      parentAuthor: storyAuthor,
      deleted: item.deleted,
      dead: item.dead,
      totalDescendants: 0,
      isLoadingReplies: hasKids,
    }

    // Immediately register this root comment so it shows up on screen right away!
    rootNodes[index] = node
    emitTreeUpdate()

    // If it has children, load them in parallel
    if (hasKids) {
      const children = await fetchKidsRecursive(item.kids!, 1, item.by)
      if (!isCancelled()) {
        node.kids = children
        node.totalDescendants = children.reduce(
          (acc, c) => acc + 1 + (c.totalDescendants || 0),
          0
        )
        node.isLoadingReplies = false
        emitTreeUpdate()
      }
    }
  })

  await Promise.all(rootPromises)
  if (updateTimer) clearTimeout(updateTimer)
  emitTreeUpdate(true)

  return rootNodes.filter((r): r is CommentNode => !!r)
}
