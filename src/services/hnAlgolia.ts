import { HN_ALGOLIA_BASE } from '../config/constants'
import type { Story } from '../types'

export interface AlgoliaHit {
  objectID: string
  title: string
  url?: string
  author: string
  points: number
  created_at_i: number
  num_comments: number
  story_text?: string
  _tags?: string[]
}

function mapAlgoliaHitToStory(hit: AlgoliaHit): Story {
  return {
    id: parseInt(hit.objectID, 10),
    title: hit.title,
    url: hit.url,
    by: hit.author || 'anonymous',
    score: hit.points || 0,
    time: hit.created_at_i,
    descendants: hit.num_comments || 0,
    text: hit.story_text,
  }
}

// Global search
export async function searchStories(query: string, page: number = 0): Promise<Story[]> {
  if (!query || query.trim().length === 0) return []

  try {
    const encoded = encodeURIComponent(query.trim())
    const res = await fetch(`${HN_ALGOLIA_BASE}/search?query=${encoded}&tags=story&page=${page}&hitsPerPage=30`)
    if (!res.ok) return []
    const data = await res.json()
    const hits: AlgoliaHit[] = data.hits || []
    return hits.map(mapAlgoliaHitToStory)
  } catch (err) {
    console.error('Algolia search error:', err)
    return []
  }
}

// Past stories: Top front-page stories from previous 24-48 hours
export async function fetchPastStories(page: number = 0): Promise<Story[]> {
  try {
    const now = Math.floor(Date.now() / 1000)
    // 24 hours to 72 hours ago
    const start = now - 86400 * 3
    const end = now - 86400

    const url = `${HN_ALGOLIA_BASE}/search?tags=story&numericFilters=created_at_i>=${start},created_at_i<=${end}&page=${page}&hitsPerPage=30`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    const hits: AlgoliaHit[] = data.hits || []
    return hits.map(mapAlgoliaHitToStory)
  } catch (err) {
    console.error('Algolia past stories error:', err)
    return []
  }
}

// Custom channel search: Queries Algolia for stories matching custom keywords, domains, or minScore
export async function searchChannelStories(
  keywords: string[] = [],
  domains: string[] = [],
  minScore: number = 0,
  page: number = 0
): Promise<Story[]> {
  try {
    const queryParts = [...keywords, ...domains]
    const queryString = queryParts.join(' ').trim()
    const encodedQuery = encodeURIComponent(queryString)

    let url = `${HN_ALGOLIA_BASE}/search?tags=story&page=${page}&hitsPerPage=30`
    if (encodedQuery) {
      url += `&query=${encodedQuery}`
    }

    if (minScore > 0) {
      url += `&numericFilters=points>=${minScore}`
    }

    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    const hits: AlgoliaHit[] = data.hits || []
    return hits.map(mapAlgoliaHitToStory)
  } catch (err) {
    console.error('Algolia channel search error:', err)
    return []
  }
}
