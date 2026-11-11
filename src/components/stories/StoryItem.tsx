import React from 'react'
import { Bookmark, MessageSquare, ExternalLink, Globe } from 'lucide-react'
import type { Story } from '../../types'
import { timeAgo, extractDomain } from '../../utils/timeAgo'
import { openExternalUrl } from '../../utils/browser'

interface StoryItemProps {
  story: Story
  index: number
  isRead: boolean
  isBookmarked: boolean
  isSelected: boolean
  onSelectStory: (story: Story, targetTab: 'reader' | 'thread') => void
  onToggleBookmark: (story: Story) => void
}

export const StoryItem: React.FC<StoryItemProps> = ({
  story,
  index,
  isRead,
  isBookmarked,
  isSelected,
  onSelectStory,
  onToggleBookmark,
}) => {
  const domain = extractDomain(story.url)

  const handleTitleClick = () => {
    if (story.url) {
      // Direct navigation to original page URL via in-app browser or new tab
      openExternalUrl(story.url)
      onSelectStory(story, 'thread')
    } else {
      // Self / Ask HN post
      onSelectStory(story, 'thread')
    }
  }

  return (
    <article
      className={`group relative py-6 px-4 sm:px-7 transition-colors border-b border-white/[0.04] ${
        isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title: Direct link to original page URL */}
          <h2 className="text-[15px] sm:text-base leading-snug font-normal">
            <button
              onClick={handleTitleClick}
              className={`text-left cursor-pointer transition-colors focus:outline-none ${
                isRead
                  ? 'text-[#707070] hover:text-[#b0b0b0]'
                  : 'text-[#ededed] hover:text-white font-medium'
              }`}
            >
              <span className="font-mono-meta text-xs text-[#555555] mr-2 inline-block">
                {String(index + 1).padStart(2, '0')}.
              </span>
              {story.title}
            </button>
          </h2>

          {/* Monospace metadata line with direct domain link */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] font-mono-meta text-[#777777]">
            {domain && story.url && (
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#999999] hover:text-[#6cb6ff] transition-colors truncate max-w-[180px] flex items-center gap-1"
                title={`Open original article on ${domain}`}
              >
                <Globe className="w-2.5 h-2.5 opacity-60" />
                <span>{domain}</span>
              </a>
            )}

            <span>{story.score} pts</span>
            <span>by {story.by}</span>
            <span>{timeAgo(story.time)}</span>

            {/* Comment count button - switches to thread view */}
            <button
              onClick={() => onSelectStory(story, 'thread')}
              className="inline-flex items-center gap-1 text-[#ff6600]/80 hover:text-[#ff6600] transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{story.descendants || 0}</span>
            </button>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 pt-0.5">
          {/* View in App / Thread */}
          <button
            onClick={() => onSelectStory(story, 'reader')}
            title="View article details & original preview"
            className="p-2 sm:p-1.5 rounded text-[#666666] hover:text-[#ff6600] hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>

          {/* Direct original URL button */}
          {story.url && (
            <button
              onClick={() => openExternalUrl(story.url!)}
              title="Open direct URL in in-app browser / tab"
              className="p-2 sm:p-1.5 rounded text-[#666666] hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Bookmark toggle */}
          <button
            onClick={() => onToggleBookmark(story)}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
            className={`p-2 sm:p-1.5 rounded transition-all cursor-pointer ${
              isBookmarked
                ? 'text-[#ff6600] hover:bg-[#ff6600]/10'
                : 'text-[#666666] hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  )
}
