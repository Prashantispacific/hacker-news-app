import type { Story, CommentNode, ExtractedLink } from '../types'
import { extractDomain } from './timeAgo'

export function decodeHtmlEntities(str: string): string {
  if (!str) return ''
  return str
    .replace(/&#x2F;/gi, '/')
    .replace(/&#47;/gi, '/')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

export function cleanExtractedUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  let url = decodeHtmlEntities(rawUrl).trim()
  // Strip trailing punctuation often caught at end of sentences
  url = url.replace(/[),.;:!]+$/, '')
  return url
}

export function extractLinksFromThread(
  rootComments: CommentNode[],
  story?: Story | null
): ExtractedLink[] {
  const seenUrls = new Set<string>()
  const links: ExtractedLink[] = []

  const addLink = (rawUrl: string, author: string, commentId: number, context: string) => {
    let url = cleanExtractedUrl(rawUrl)
    if (!url) return

    // If URL starts with domain like web.archive.org without protocol, prepend https://
    if (/^(?:web\.archive\.org|archive\.(?:is|today|ph|org|md))\//i.test(url)) {
      url = `https://${url}`
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) return
    if (seenUrls.has(url)) return
    seenUrls.add(url)

    const domain = extractDomain(url)
    if (!domain) return

    links.push({
      url,
      domain,
      author,
      commentId,
      contextText: context,
    })
  }

  // 1. Primary story external article URL
  if (story?.url) {
    addLink(story.url, story.by, story.id, story.title || 'Original article link')
  }

  // 2. Links inside story text (Ask HN or self-posts)
  if (story?.text) {
    extractFromRawText(story.text, story.by, story.id)
  }

  function extractFromRawText(rawHtml: string, author: string, id: number) {
    if (!rawHtml) return

    // Step 1: Decode entities completely
    const decoded = decodeHtmlEntities(rawHtml)

    // Create a plain snippet
    const plainText = decoded
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const snippet = plainText.length > 110 ? `${plainText.slice(0, 107)}...` : plainText

    // Step 2: Match all href attributes (standard HTML href="...", href='...')
    const hrefRegex = /href=["']([^"']+)["']/gi
    let match: RegExpExecArray | null
    while ((match = hrefRegex.exec(decoded)) !== null) {
      addLink(match[1], author, id, snippet)
    }

    // Step 3: Match plaintext URLs (https://... or http://...)
    const plainUrlRegex = /(https?:\/\/[^\s<>"')]+)/gi
    while ((match = plainUrlRegex.exec(decoded)) !== null) {
      addLink(match[1], author, id, snippet)
    }

    // Step 4: Match archive and web URLs written without protocol (e.g. web.archive.org/web/... or archive.today/...)
    const archivePlainRegex = /(?:^|\s)((?:web\.archive\.org|archive\.(?:is|today|ph|org|md))\/[^\s<>"')]+)/gi
    while ((match = archivePlainRegex.exec(decoded)) !== null) {
      addLink(`https://${match[1]}`, author, id, snippet)
    }
  }

  function traverse(node: CommentNode) {
    if (node.text && !node.deleted && !node.dead) {
      extractFromRawText(node.text, node.by, node.id)
    }

    if (node.kids && node.kids.length > 0) {
      for (const child of node.kids) {
        traverse(child)
      }
    }
  }

  for (const root of rootComments) {
    traverse(root)
  }

  return links
}
