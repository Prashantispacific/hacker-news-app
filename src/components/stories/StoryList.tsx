import React from 'react'
import type { Story } from '../../types'
import { StoryItem } from './StoryItem'
import { StorySkeleton } from './StorySkeleton'
import { EyeOff, RefreshCw } from 'lucide-react'

interface StoryListProps {
  stories: Story[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  mutedCount: number
  selectedStoryId?: number
  isRead: (id: number) => boolean
  isBookmarked: (id: number) => boolean
  onSelectStory: (story: Story, tab: 'reader' | 'thread') => void
  onToggleBookmark: (story: Story) => void
  onLoadMore: () => void
  onRefresh: () => void
  onOpenSettings: () => void
}

export const StoryList: React.FC<StoryListProps> = ({
  stories,
  loading,
  loadingMore,
  hasMore,
  mutedCount,
  selectedStoryId,
  isRead,
  isBookmarked,
  onSelectStory,
  onToggleBookmark,
  onLoadMore,
  onRefresh,
  onOpenSettings,
}) => {
  if (loading) {
    return <StorySkeleton count={10} />
  }

  return (
    <div className="w-full">
      {/* Subtle banner if stories are hidden by mute list */}
      {mutedCount > 0 && (
        <div className="mx-4 sm:mx-6 my-3 px-3 py-2 bg-[#121212] border border-white/[0.06] rounded flex items-center justify-between text-xs font-mono-meta text-[#888888]">
          <div className="flex items-center gap-2">
            <EyeOff className="w-3.5 h-3.5 text-[#ff6600]" />
            <span>
              {mutedCount} {mutedCount === 1 ? 'story' : 'stories'} filtered by your mute list
            </span>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-white hover:text-[#ff6600] underline underline-offset-2 cursor-pointer transition-colors"
          >
            Manage rules
          </button>
        </div>
      )}

      {/* Empty feed state */}
      {stories.length === 0 ? (
        <div className="py-24 text-center px-4">
          <p className="text-sm font-mono-meta text-[#777777] mb-4">
            No stories matching this channel filter.
          </p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#141414] hover:bg-[#1f1f1f] border border-white/[0.08] text-xs font-mono-meta text-white rounded transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Refresh Feed
          </button>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {stories.map((story, idx) => (
            <StoryItem
              key={story.id}
              story={story}
              index={idx}
              isRead={isRead(story.id)}
              isBookmarked={isBookmarked(story.id)}
              isSelected={selectedStoryId === story.id}
              onSelectStory={onSelectStory}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      )}

      {/* Load more controls */}
      {hasMore && stories.length > 0 && (
        <div className="py-8 text-center px-4">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-[#111111] hover:bg-[#1a1a1a] border border-white/[0.08] rounded-full text-xs font-mono-meta text-[#cccccc] hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? 'Loading next stories...' : 'Load more stories'}
          </button>
        </div>
      )}

      {/* Subtle Feed Footer */}
      {stories.length > 0 && (
        <footer className="pt-6 pb-12 text-center border-t border-white/[0.04]">
          <p className="text-[11px] font-mono-meta text-[#555555] tracking-wider">
            Hacker News by PG · Made by Prashant
          </p>
        </footer>
      )}
    </div>
  )
}
