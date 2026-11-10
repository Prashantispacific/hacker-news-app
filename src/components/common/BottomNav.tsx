import React from 'react'
import { LayoutList, MessageSquare, Globe } from 'lucide-react'
import type { ActiveTab } from '../../types'

interface BottomNavProps {
  activeTab: ActiveTab
  onSelectTab: (tab: ActiveTab) => void
  commentCount?: number
  hasSelectedStory: boolean
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  commentCount,
  hasSelectedStory,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-black/95 backdrop-blur-xl border-t border-white/[0.08] px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {/* Stories Feed Tab */}
        <button
          onClick={() => onSelectTab('feed')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
            activeTab === 'feed'
              ? 'text-[#ff6600]'
              : 'text-[#777777] hover:text-[#cccccc]'
          }`}
        >
          <LayoutList className="w-4 h-4" />
          <span className="text-[10px] font-mono-meta tracking-wider uppercase font-medium">
            Stories
          </span>
        </button>

        {/* Discussion / Thread Tab */}
        <button
          onClick={() => onSelectTab('thread')}
          disabled={!hasSelectedStory}
          className={`relative flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
            activeTab === 'thread'
              ? 'text-[#ff6600]'
              : hasSelectedStory
              ? 'text-[#777777] hover:text-[#cccccc]'
              : 'text-[#333333] cursor-not-allowed'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[10px] font-mono-meta tracking-wider uppercase font-medium">
            Discussion
          </span>
          {hasSelectedStory && commentCount !== undefined && commentCount > 0 && (
            <span className="absolute -top-0.5 right-2 px-1 text-[9px] font-mono-meta font-bold bg-[#ff6600] text-black rounded-full leading-none py-0.5">
              {commentCount > 99 ? '99+' : commentCount}
            </span>
          )}
        </button>

        {/* Direct Page Tab */}
        <button
          onClick={() => onSelectTab('reader')}
          disabled={!hasSelectedStory}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all cursor-pointer ${
            activeTab === 'reader'
              ? 'text-[#ff6600]'
              : hasSelectedStory
              ? 'text-[#777777] hover:text-[#cccccc]'
              : 'text-[#333333] cursor-not-allowed'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span className="text-[10px] font-mono-meta tracking-wider uppercase font-medium">
            Page
          </span>
        </button>
      </div>
    </nav>
  )
}
