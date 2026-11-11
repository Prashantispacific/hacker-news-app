import React, { useState, useEffect, useRef } from 'react'
import { Search, X, MessageSquare } from 'lucide-react'
import type { Story } from '../../types'
import { searchStories } from '../../services/hnAlgolia'
import { timeAgo, extractDomain } from '../../utils/timeAgo'

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
  onSelectStory: (story: Story) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isOpen,
  onClose,
  onSelectStory,
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      searchStories(query)
        .then((hits) => {
          setResults(hits)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)+1rem))] px-3 sm:px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0a0a0a] border border-white/[0.12] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[75vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08] bg-[#111111]">
          <Search className="w-4 h-4 text-[#ff6600] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, topics, ask HN..."
            className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-[#555555] font-mono-meta min-w-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#666666] hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search modal"
            className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-[#888888] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
          {loading && (
            <div className="py-12 text-center text-xs font-mono-meta text-[#777777]">
              Searching Algolia HN index...
            </div>
          )}

          {!loading && results.length === 0 && query.trim() && (
            <div className="py-12 text-center text-xs font-mono-meta text-[#666666]">
              No stories found for "{query}".
            </div>
          )}

          {!loading &&
            results.map((story) => {
              const domain = extractDomain(story.url)
              return (
                <div
                  key={story.id}
                  onClick={() => {
                    onSelectStory(story)
                    onClose()
                  }}
                  className="p-4 hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  <h3 className="text-sm font-medium text-[#ededed] group-hover:text-white leading-snug">
                    {story.title}
                  </h3>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono-meta text-[#777777]">
                    {domain && <span className="text-[#999999]">{domain}</span>}
                    <span>{story.score} pts</span>
                    <span>by @{story.by}</span>
                    <span>{timeAgo(story.time)}</span>
                    <span className="text-[#ff6600] flex items-center gap-1">
                      <MessageSquare className="w-2.5 h-2.5" />
                      {story.descendants || 0}
                    </span>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
