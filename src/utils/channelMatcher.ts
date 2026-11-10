import type { Channel, MuteRules, Story } from '../types'
import { extractDomain } from './timeAgo'

export function isStoryMuted(story: Story, muteRules: MuteRules): boolean {
  if (!muteRules) return false

  const titleLower = (story.title || '').toLowerCase()
  const authorLower = (story.by || '').toLowerCase()
  const domainLower = extractDomain(story.url).toLowerCase()

  // Keyword check
  if (muteRules.keywords && muteRules.keywords.length > 0) {
    for (const kw of muteRules.keywords) {
      const cleanKw = kw.trim().toLowerCase()
      if (cleanKw && titleLower.includes(cleanKw)) {
        return true
      }
    }
  }

  // Author check
  if (muteRules.authors && muteRules.authors.length > 0) {
    for (const author of muteRules.authors) {
      const cleanAuthor = author.trim().toLowerCase()
      if (cleanAuthor && authorLower === cleanAuthor) {
        return true
      }
    }
  }

  // Domain check
  if (muteRules.domains && muteRules.domains.length > 0) {
    for (const domain of muteRules.domains) {
      const cleanDomain = domain.trim().toLowerCase()
      if (cleanDomain && (domainLower === cleanDomain || domainLower.endsWith(`.${cleanDomain}`))) {
        return true
      }
    }
  }

  return false
}

export function matchesChannel(story: Story, channel: Channel): boolean {
  if (channel.id === 'all') return true

  if (channel.id === 'showcase') {
    const titleLower = story.title.toLowerCase()
    return titleLower.startsWith('show hn') || titleLower.startsWith('launch hn')
  }

  if (channel.id === 'ask') {
    const titleLower = story.title.toLowerCase()
    return titleLower.startsWith('ask hn') || story.type === 'ask'
  }

  if (channel.id === 'jobs') {
    const titleLower = story.title.toLowerCase()
    return (
      story.type === 'job' ||
      titleLower.includes('who is hiring') ||
      titleLower.includes('is hiring')
    )
  }

  if (channel.id === 'links') {
    return !!story.url && !story.url.includes('news.ycombinator.com')
  }

  // Minimum score condition
  if (channel.minScore && story.score < channel.minScore) {
    return false
  }

  const titleLower = story.title.toLowerCase()
  const domainLower = extractDomain(story.url).toLowerCase()

  // Keywords check
  if (channel.keywords && channel.keywords.length > 0) {
    const hasKeyword = channel.keywords.some((k) => {
      const clean = k.trim().toLowerCase()
      return clean && titleLower.includes(clean)
    })
    if (hasKeyword) return true
  }

  // Domains check
  if (channel.domains && channel.domains.length > 0) {
    const hasDomain = channel.domains.some((d) => {
      const clean = d.trim().toLowerCase()
      return clean && (domainLower === clean || domainLower.endsWith(`.${clean}`))
    })
    if (hasDomain) return true
  }

  return false
}
