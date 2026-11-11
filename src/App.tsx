import { useState, useCallback, useMemo, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import type { Story, ActiveTab, ReaderPreferences } from './types'
import { useChannels } from './hooks/useChannels'
import { useMuteList } from './hooks/useMuteList'
import { useBookmarks } from './hooks/useBookmarks'
import { useReadState } from './hooks/useReadState'
import { useStories } from './hooks/useStories'
import { useThread } from './hooks/useThread'
import { useKeyboard } from './hooks/useKeyboard'
import { useSwipe } from './hooks/useSwipe'
import { getReaderPreferences, saveReaderPreferences } from './services/storage'
import { DEFAULT_READER_PREFS } from './config/constants'
import { fetchItem } from './services/hnFirebase'

import { Header } from './components/common/Header'
import { ChannelBar } from './components/channels/ChannelBar'
import { AddChannelModal } from './components/channels/AddChannelModal'
import { StoryList } from './components/stories/StoryList'
import { ThreadView } from './components/discussion/ThreadView'
import { ReaderView } from './components/reader/ReaderView'
import { SearchBar } from './components/search/SearchBar'
import { SettingsModal } from './components/settings/SettingsModal'
import { BottomNav } from './components/common/BottomNav'

export function App() {
  // Channel state
  const {
    allChannels,
    activeChannel,
    activeChannelId,
    setActiveChannelId,
    addCustomChannel,
    removeCustomChannel,
  } = useChannels()

  // Mute rules
  const {
    muteRules,
    addRule: addMuteRule,
    removeRule: removeMuteRule,
    clearAllRules: clearAllMuteRules,
  } = useMuteList()

  // Bookmarks
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks()

  // Read status tracking
  const { isRead, markAsRead } = useReadState()

  // Stories feed
  const {
    stories,
    loading: storiesLoading,
    loadingMore,
    loadMore,
    refresh: refreshStories,
    hasMore,
    mutedCount,
  } = useStories(activeChannel, muteRules, bookmarks)

  // Selection & Navigation
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed')

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false)

  // Preferences
  const [prefs, setPrefs] = useState<ReaderPreferences>(DEFAULT_READER_PREFS)
  useEffect(() => {
    getReaderPreferences().then(setPrefs)
  }, [])

  // Native Android Status Bar & Back Button Integration
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
    StatusBar.setBackgroundColor({ color: prefs.trueBlack ? '#000000' : '#0a0a0a' }).catch(() => {})
    StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
  }, [prefs.trueBlack])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const backListener = CapApp.addListener('backButton', () => {
      if (isSearchOpen) {
        setIsSearchOpen(false)
        return
      }
      if (isSettingsOpen) {
        setIsSettingsOpen(false)
        return
      }
      if (isAddChannelOpen) {
        setIsAddChannelOpen(false)
        return
      }
      if (activeTab !== 'feed') {
        setActiveTab('feed')
        return
      }
      CapApp.exitApp()
    })

    return () => {
      backListener.then((sub) => sub.remove())
    }
  }, [isSearchOpen, isSettingsOpen, isAddChannelOpen, activeTab])

  const updatePrefs = (updater: (prev: ReaderPreferences) => ReaderPreferences) => {
    setPrefs((prev) => {
      const next = updater(prev)
      saveReaderPreferences(next)
      return next
    })
  }

  // Thread hook
  const {
    comments,
    loading: threadLoading,
    loadedCount,
    extractedLinks,
    opCommentIds,
    foldToRoot,
    isCollapsed,
    toggleCollapse,
    toggleFoldToRoot,
  } = useThread(selectedStory)

  // Select story handler
  const handleSelectStory = useCallback(
    (story: Story, targetTab: 'reader' | 'thread' = 'thread') => {
      setSelectedStory(story)
      markAsRead(story.id)
      setActiveTab(targetTab)
    },
    [markAsRead]
  )

  // Supported Links & Deep Linking (e.g. news.ycombinator.com/item?id=12345)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const handleDeepLinkUrl = async (urlStr: string) => {
      if (!urlStr) return
      try {
        const idMatch = urlStr.match(/[?&]id=(\d+)/)
        if (idMatch && idMatch[1]) {
          const storyId = parseInt(idMatch[1], 10)
          const item = await fetchItem(storyId)
          if (item && item.title) {
            handleSelectStory(item as Story, 'thread')
          }
        } else if (urlStr.includes('news.ycombinator.com')) {
          setActiveTab('feed')
        }
      } catch (err) {
        console.error('Failed to handle deep link URL:', err)
      }
    }

    // Check cold launch URL
    CapApp.getLaunchUrl().then((launchUrl) => {
      if (launchUrl?.url) {
        handleDeepLinkUrl(launchUrl.url)
      }
    }).catch(() => {})

    // Listen for runtime URL open events (from browser, messaging apps, etc.)
    const urlListener = CapApp.addListener('appUrlOpen', (event) => {
      if (event?.url) {
        handleDeepLinkUrl(event.url)
      }
    })

    return () => {
      urlListener.then((sub) => sub.remove())
    }
  }, [handleSelectStory])

  // Mobile swipe gestures
  useSwipe({
    onSwipeLeft: () => {
      if (activeTab === 'feed' && selectedStory) setActiveTab('thread')
      else if (activeTab === 'thread') setActiveTab('reader')
    },
    onSwipeRight: () => {
      if (activeTab === 'reader') setActiveTab('thread')
      else if (activeTab === 'thread') setActiveTab('feed')
    },
  })

  // Keyboard navigation
  const currentStoryIndex = useMemo(() => {
    if (!selectedStory) return -1
    return stories.findIndex((s) => s.id === selectedStory.id)
  }, [stories, selectedStory])

  useKeyboard({
    onNextStory: () => {
      const nextIdx = Math.min(stories.length - 1, currentStoryIndex + 1)
      if (stories[nextIdx]) {
        handleSelectStory(stories[nextIdx], activeTab === 'feed' ? 'thread' : activeTab)
      }
    },
    onPrevStory: () => {
      const prevIdx = Math.max(0, currentStoryIndex - 1)
      if (stories[prevIdx]) {
        handleSelectStory(stories[prevIdx], activeTab === 'feed' ? 'thread' : activeTab)
      }
    },
    onOpenLink: () => {
      if (selectedStory?.url) {
        window.open(selectedStory.url, '_blank', 'noopener,noreferrer')
      }
    },
    onOpenDiscussion: () => {
      if (selectedStory) setActiveTab('thread')
    },
    onOpenReader: () => {
      if (selectedStory) setActiveTab('reader')
    },
    onToggleSearch: () => setIsSearchOpen(true),
    onToggleFoldRoot: toggleFoldToRoot,
    onEscape: () => {
      setIsSearchOpen(false)
      setIsSettingsOpen(false)
      setIsAddChannelOpen(false)
    },
  })

  // Export data
  const handleExportData = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      bookmarks,
      muteRules,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `void-hn-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`min-h-screen flex flex-col ${prefs.trueBlack ? 'true-black' : ''}`}>
      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedStoryTitle={selectedStory?.title}
      />

      {/* Main App Content */}
      <div className={`flex-1 flex w-full mx-auto overflow-hidden transition-all duration-150 ${
        activeTab === 'reader' ? 'max-w-full' : 'max-w-[1600px]'
      }`}>
        {/* DESKTOP SPLIT PANE (>= 1024px) */}
        <div className="hidden lg:flex w-full h-[calc(100vh-3.5rem)]">
          {/* Left Column: Feed List (hidden in full Reader Mode to give max space to article) */}
          <section className={`shrink-0 border-r border-white/[0.08] flex flex-col h-full bg-black transition-all duration-200 ${
            activeTab === 'reader' ? 'w-0 hidden' : 'w-[440px]'
          }`}>
            <ChannelBar
              channels={allChannels}
              activeChannelId={activeChannelId}
              onSelectChannel={setActiveChannelId}
              onOpenAddModal={() => setIsAddChannelOpen(true)}
              onRemoveChannel={removeCustomChannel}
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
              <StoryList
                stories={stories}
                loading={storiesLoading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                mutedCount={mutedCount}
                selectedStoryId={selectedStory?.id}
                isRead={isRead}
                isBookmarked={isBookmarked}
                onSelectStory={handleSelectStory}
                onToggleBookmark={toggleBookmark}
                onLoadMore={loadMore}
                onRefresh={refreshStories}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>
          </section>

          {/* Right Column: Active Thread View or Direct Page View */}
          <main className="flex-1 h-full overflow-y-auto bg-black">
            {activeTab === 'reader' ? (
              <ReaderView
                story={selectedStory}
                prefs={prefs}
                onUpdatePrefs={updatePrefs}
                onOpenThread={() => setActiveTab('thread')}
                onBackToFeed={() => setActiveTab('feed')}
              />
            ) : (
              <ThreadView
                story={selectedStory}
                comments={comments}
                loading={threadLoading}
                loadedCount={loadedCount}
                extractedLinks={extractedLinks}
                opCommentIds={opCommentIds}
                foldToRoot={foldToRoot}
                isCollapsed={isCollapsed}
                onToggleCollapse={toggleCollapse}
                onToggleFoldToRoot={toggleFoldToRoot}
                onOpenReader={() => setActiveTab('reader')}
              />
            )}
          </main>
        </div>

        {/* MOBILE / TABLET SINGLE COLUMN (< 1024px) */}
        <div className="lg:hidden w-full flex-1 flex flex-col pb-24 sm:pb-28">
          {activeTab === 'feed' && (
            <div className="w-full">
              <ChannelBar
                channels={allChannels}
                activeChannelId={activeChannelId}
                onSelectChannel={setActiveChannelId}
                onOpenAddModal={() => setIsAddChannelOpen(true)}
                onRemoveChannel={removeCustomChannel}
              />

              <StoryList
                stories={stories}
                loading={storiesLoading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                mutedCount={mutedCount}
                selectedStoryId={selectedStory?.id}
                isRead={isRead}
                isBookmarked={isBookmarked}
                onSelectStory={handleSelectStory}
                onToggleBookmark={toggleBookmark}
                onLoadMore={loadMore}
                onRefresh={refreshStories}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>
          )}

          {activeTab === 'thread' && (
            <ThreadView
              story={selectedStory}
              comments={comments}
              loading={threadLoading}
              loadedCount={loadedCount}
              extractedLinks={extractedLinks}
              opCommentIds={opCommentIds}
              foldToRoot={foldToRoot}
              isCollapsed={isCollapsed}
              onToggleCollapse={toggleCollapse}
              onToggleFoldToRoot={toggleFoldToRoot}
              onOpenReader={() => setActiveTab('reader')}
            />
          )}

          {activeTab === 'reader' && (
            <ReaderView
              story={selectedStory}
              prefs={prefs}
              onUpdatePrefs={updatePrefs}
              onOpenThread={() => setActiveTab('thread')}
              onBackToFeed={() => setActiveTab('feed')}
            />
          )}
        </div>
      </div>

      {/* Ergonomic Mobile Bottom Nav (< 768px) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        commentCount={selectedStory?.descendants}
        hasSelectedStory={!!selectedStory}
      />

      {/* Modals & Dialogs */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectStory={(story) => handleSelectStory(story, 'thread')}
      />

      <AddChannelModal
        isOpen={isAddChannelOpen}
        onClose={() => setIsAddChannelOpen(false)}
        onAddChannel={addCustomChannel}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        muteRules={muteRules}
        onAddMuteRule={addMuteRule}
        onRemoveMuteRule={removeMuteRule}
        onClearAllMuteRules={clearAllMuteRules}
        prefs={prefs}
        onUpdatePrefs={updatePrefs}
        onExportData={handleExportData}
      />
    </div>
  )
}

export default App
