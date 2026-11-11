import React, { useState, useEffect } from 'react'
import { Search, Settings, WifiOff, Download } from 'lucide-react'
import { usePwaInstall } from '../../hooks/usePwaInstall'

interface HeaderProps {
  onOpenSearch: () => void
  onOpenSettings: () => void
  activeTab: 'feed' | 'reader' | 'thread'
  onSelectTab: (tab: 'feed' | 'reader' | 'thread') => void
  selectedStoryTitle?: string
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenSettings,
  activeTab,
  onSelectTab,
  selectedStoryTitle,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { canInstall, promptInstall } = usePwaInstall()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.08] bg-black/95 backdrop-blur-md px-4 sm:px-6 pt-[env(safe-area-inset-top,0px)] h-[calc(3.5rem+env(safe-area-inset-top,0px))] flex items-center justify-between transition-colors">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectTab('feed')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
        >
          {/* HN Orange Box */}
          <div className="h-5 px-1 bg-[#ff6600] rounded-[3px] flex items-center justify-center font-mono-meta font-extrabold text-[11px] text-white tracking-tight select-none group-hover:scale-105 transition-transform min-w-[22px]">
            HN
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-[#f0f0f0] tracking-tight group-hover:text-white transition-colors">
              Hacker News
            </span>
            <span className="font-mono-meta text-[11px] text-[#ff6600]/90 font-medium">
              by PG
            </span>
          </div>
        </button>

        {/* Offline indicator */}
        {!isOnline && (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono-meta text-[#ff8844] bg-[#ff6600]/10 px-2 py-0.5 rounded border border-[#ff6600]/20">
            <WifiOff className="w-3 h-3" /> Offline
          </span>
        )}

        {/* Breadcrumb title preview on desktop */}
        {selectedStoryTitle && (
          <div className="hidden xl:flex items-center gap-2 text-xs text-[#555555] truncate max-w-sm">
            <span>/</span>
            <span className="text-[#999999] truncate font-normal">
              {selectedStoryTitle}
            </span>
          </div>
        )}
      </div>

      {/* Center Tabs for Desktop (>= 768px) */}
      <div className="hidden md:flex items-center gap-1 bg-[#111111] p-1 rounded-full border border-white/[0.08]">
        <button
          onClick={() => onSelectTab('feed')}
          className={`px-3.5 py-1 rounded-full text-xs font-mono-meta transition-all cursor-pointer ${
            activeTab === 'feed'
              ? 'bg-[#222222] text-[#ff6600] font-medium shadow-sm'
              : 'text-[#888888] hover:text-[#cccccc]'
          }`}
        >
          Stories
        </button>
        <button
          onClick={() => onSelectTab('thread')}
          className={`px-3.5 py-1 rounded-full text-xs font-mono-meta transition-all cursor-pointer ${
            activeTab === 'thread'
              ? 'bg-[#222222] text-[#ff6600] font-medium shadow-sm'
              : 'text-[#888888] hover:text-[#cccccc]'
          }`}
        >
          Discussion
        </button>
        <button
          onClick={() => onSelectTab('reader')}
          className={`px-3.5 py-1 rounded-full text-xs font-mono-meta transition-all cursor-pointer ${
            activeTab === 'reader'
              ? 'bg-[#222222] text-[#ff6600] font-medium shadow-sm'
              : 'text-[#888888] hover:text-[#cccccc]'
          }`}
        >
          Direct Page
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* PWA Install Button */}
        {canInstall && (
          <button
            onClick={promptInstall}
            title="Install Hacker News by PG as standalone PWA"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ff6600]/15 hover:bg-[#ff6600]/25 text-[#ff6600] border border-[#ff6600]/30 rounded-full text-xs font-mono-meta transition-all cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}

        {/* Search button with keyboard shortcut hint */}
        <button
          onClick={onOpenSearch}
          aria-label="Search stories"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[#909090] hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer text-xs font-mono-meta"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] text-[#666666] bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">
            /
          </span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="p-1.5 rounded-md text-[#909090] hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
