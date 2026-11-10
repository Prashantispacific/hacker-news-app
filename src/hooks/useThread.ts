import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Story, CommentNode, ExtractedLink } from '../types'
import { fetchCommentTree } from '../services/hnFirebase'
import { extractLinksFromThread } from '../utils/linkExtractor'

export function useThread(story: Story | null) {
  const [comments, setComments] = useState<CommentNode[]>([])
  const [loading, setLoading] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)
  const [collapsedMap, setCollapsedMap] = useState<Set<number>>(new Set())
  const [foldToRoot, setFoldToRoot] = useState(false)

  useEffect(() => {
    if (!story || !story.kids || story.kids.length === 0) {
      setComments([])
      setLoading(false)
      setLoadedCount(0)
      setCollapsedMap(new Set())
      return
    }

    let isMounted = true
    setLoading(true)
    setLoadedCount(0)
    setCollapsedMap(new Set())
    setFoldToRoot(false)

    fetchCommentTree(story.kids, story.by, (count) => {
      if (isMounted) setLoadedCount(count)
    }).then((tree) => {
      if (isMounted) {
        setComments(tree)
        setLoading(false)
      }
    }).catch((err) => {
      console.error('Failed to load comment tree:', err)
      if (isMounted) setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [story?.id])

  // Extract all links across entire comment tree & main story
  const extractedLinks = useMemo<ExtractedLink[]>(() => {
    return extractLinksFromThread(comments, story)
  }, [comments, story])

  // Find all comments authored by OP
  const opCommentIds = useMemo<number[]>(() => {
    if (!story?.by) return []
    const ids: number[] = []

    function search(nodes: CommentNode[]) {
      for (const node of nodes) {
        if (story && node.by.toLowerCase() === story.by.toLowerCase()) {
          ids.push(node.id)
        }
        if (node.kids && node.kids.length > 0) {
          search(node.kids)
        }
      }
    }

    search(comments)
    return ids
  }, [comments, story])

  // Toggle individual branch collapse
  const toggleCollapse = useCallback((id: number) => {
    setCollapsedMap((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Check if branch is collapsed
  const isCollapsed = useCallback(
    (id: number, level: number) => {
      if (foldToRoot && level > 0) return true
      return collapsedMap.has(id)
    },
    [collapsedMap, foldToRoot]
  )

  const toggleFoldToRoot = useCallback(() => {
    setFoldToRoot((prev) => !prev)
  }, [])

  return {
    comments,
    loading,
    loadedCount,
    extractedLinks,
    opCommentIds,
    isCollapsed,
    toggleCollapse,
    foldToRoot,
    toggleFoldToRoot,
  }
}
