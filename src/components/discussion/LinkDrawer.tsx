import React, { useState, useMemo } from 'react'
import { X, ExternalLink, Link2, MessageSquare, Search, Filter } from 'lucide-react'
import type { ExtractedLink } from '../../types'
import { openExternalUrl } from '../../utils/browser'

interface LinkDrawerProps {
  isOpen: boolean
  onClose: () => void
  links: ExtractedLink[]
  onJumpToComment?: (commentId: number) => void
}

function matchesDomain(itemDomain: string, filterDomain: string | null): boolean {
  if (!filterDomain) return true
  const d1 = itemDomain.toLowerCase()
  const d2 = filterDomain.toLowerCase()
  if (d1 === d2) return true
  if (d1.endsWith(`.${d2}`) || d2.endsWith(`.${d1}`)) return true
  if (d1.includes('archive') && d2.includes('archive')) return true
  return false
}

export const LinkDrawer: React.FC<LinkDrawerProps> = ({
  isOpen,
  onClose,
  links,
  onJumpToComment,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  // Extract unique domains for quick filter chips
  const uniqueDomains = useMemo(() => {
    const domainCounts = new Map<string, number>()
    for (const link of links) {
      if (link.domain) {
        // Group archive domains under 'archive.org' for clean filter chip
        const key = link.domain.includes('archive') ? 'archive.org' : link.domain
        domainCounts.set(key, (domainCounts.get(key) || 0) + 1)
      }
    }
    return Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [links])

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((item) => {
      if (selectedDomain && !matchesDomain(item.domain, selectedDomain)) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesUrl = item.url.toLowerCase().includes(q)
        const matchesDom = item.domain.toLowerCase().includes(q)
        const matchesAuthor = item.author.toLowerCase().includes(q)
        const matchesContext = (item.contextText || '').toLowerCase().includes(q)
        // Also check if searching 'archive.org' or 'archive' matches web.archive.org
        const matchesArchive = q.includes('archive') && item.domain.toLowerCase().includes('archive')
        if (!matchesUrl && !matchesDom && !matchesAuthor && !matchesContext && !matchesArchive) {
          return false
        }
      }
      return true
    })
  }, [links, selectedDomain, searchQuery])

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg h-full bg-[#0a0a0a] border-l border-white/[0.1] px-4 sm:px-6 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+1rem))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-4 h-4 text-[#ff6600]" />
            <h2 className="text-sm font-mono-meta font-medium text-white tracking-wide uppercase">
              External Links ({filteredLinks.length}/{links.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close external links"
            className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.16] active:bg-[#ff6600]/25 text-[#cccccc] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Domain Filter Bar */}
        <div className="py-3 space-y-2.5 border-b border-white/[0.06]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter links by domain, keyword, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-white/[0.08] focus:border-[#ff6600] rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono-meta text-white placeholder-[#555555] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Domain Filter Chips */}
          {uniqueDomains.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              <span className="text-[10px] font-mono-meta text-[#666666] flex items-center gap-1 shrink-0">
                <Filter className="w-2.5 h-2.5" />
              </span>
              <button
                onClick={() => setSelectedDomain(null)}
                className={`px-2 py-0.5 rounded text-[10.5px] font-mono-meta shrink-0 transition-colors cursor-pointer ${
                  selectedDomain === null
                    ? 'bg-white text-black font-semibold'
                    : 'bg-[#141414] text-[#888888] hover:text-white border border-white/[0.06]'
                }`}
              >
                All ({links.length})
              </button>
              {uniqueDomains.map(([dom, count]) => (
                <button
                  key={dom}
                  onClick={() => setSelectedDomain(selectedDomain === dom ? null : dom)}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-mono-meta shrink-0 transition-colors cursor-pointer ${
                    selectedDomain === dom
                      ? 'bg-[#ff6600] text-black font-semibold'
                      : 'bg-[#141414] text-[#888888] hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {dom} ({count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Links List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 divide-y divide-white/[0.04]">
          {filteredLinks.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono-meta text-[#666666]">
              {links.length === 0
                ? 'No external links found in this discussion.'
                : 'No links matching your filter criteria.'}
            </div>
          ) : (
            filteredLinks.map((item, idx) => (
              <div key={idx} className="pt-3.5 first:pt-0 group">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => openExternalUrl(item.url)}
                    className="text-left text-xs font-medium text-[#6cb6ff] hover:text-[#93c5fd] hover:underline line-clamp-2 break-all flex items-center gap-1.5 leading-relaxed cursor-pointer"
                  >
                    <span>{item.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                  </button>

                  {onJumpToComment && (
                    <button
                      onClick={() => {
                        onJumpToComment(item.commentId)
                        onClose()
                      }}
                      title="Jump to comment"
                      className="text-[11px] font-mono-meta text-[#777777] hover:text-[#ff6600] shrink-0 flex items-center gap-1 cursor-pointer transition-colors pt-0.5"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Jump</span>
                    </button>
                  )}
                </div>

                <div className="mt-1.5 flex items-center gap-2 text-[11px] font-mono-meta text-[#777777]">
                  <span className="text-[#cccccc] font-medium">{item.domain}</span>
                  <span>·</span>
                  <span>by @{item.author}</span>
                </div>

                {item.contextText && (
                  <p className="mt-1 text-xs text-[#888888] line-clamp-2 italic leading-relaxed">
                    "{item.contextText}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
