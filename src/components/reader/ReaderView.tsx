import React, { useState } from 'react'
import type { Story, ReaderPreferences } from '../../types'
import {
  ExternalLink,
  MessageSquare,
  Globe,
  Sliders,
  Copy,
  Check,
  ArrowLeft,
} from 'lucide-react'
import { extractDomain, timeAgo } from '../../utils/timeAgo'
import { cleanHnHtml } from '../../utils/textParser'

interface ReaderViewProps {
  story: Story | null
  prefs: ReaderPreferences
  onUpdatePrefs: (updater: (prev: ReaderPreferences) => ReaderPreferences) => void
  onOpenThread: () => void
  onBackToFeed?: () => void
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  story,
  prefs,
  onUpdatePrefs,
  onOpenThread,
  onBackToFeed,
}) => {
  const [copied, setCopied] = useState(false)
  const [showComfortPanel, setShowComfortPanel] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  if (!story) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs font-mono-meta text-[#666666]">
        <Globe className="w-8 h-8 mb-2 opacity-30 text-[#ff6600]" />
        <p>Select a story to view the original article or discussion.</p>
        {onBackToFeed && (
          <button
            onClick={onBackToFeed}
            className="mt-4 px-3 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-white/[0.1] rounded text-white flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Feed</span>
          </button>
        )}
      </div>
    )
  }

  const domain = extractDomain(story.url)

  const handleCopyLink = () => {
    const link = story.url || `https://news.ycombinator.com/item?id=${story.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenDirect = () => {
    if (story.url) {
      window.open(story.url, '_blank', 'noopener,noreferrer')
    }
  }

  // Self-post comfort font classes
  const fontClasses = {
    serif: 'font-editorial',
    sans: 'font-sans',
    mono: 'font-mono-meta',
  }[prefs.fontFamily]

  const lineHeightClasses = {
    compact: 'leading-normal',
    comfortable: 'leading-relaxed',
    spacious: 'leading-loose',
  }[prefs.lineHeight]

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden">
      {/* Ultra-compact, space-efficient Top Utility Bar (42px) */}
      <div className="shrink-0 h-[44px] px-3 sm:px-5 bg-black/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between gap-3 select-none z-20">
        {/* Left: Back button + Title & Domain */}
        <div className="flex items-center gap-2.5 min-w-0">
          {onBackToFeed && (
            <button
              onClick={onBackToFeed}
              title="Back to feed"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#141414] hover:bg-[#202020] border border-white/[0.1] rounded text-xs font-mono-meta text-[#cccccc] hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Feed</span>
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-xs sm:text-sm font-medium text-white truncate max-w-sm sm:max-w-md lg:max-w-xl" title={story.title}>
              {story.title}
            </h2>
            {domain && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-mono-meta bg-white/[0.06] text-[#888888] shrink-0 border border-white/[0.04]">
                <Globe className="w-2.5 h-2.5 text-[#ff6600]" />
                <span>{domain}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Discussion jump button */}
          <button
            onClick={onOpenThread}
            className="px-2.5 py-1 bg-[#141414] hover:bg-[#1f1f1f] border border-white/[0.08] rounded text-xs font-mono-meta text-[#cccccc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3 h-3 text-[#ff6600]" />
            <span className="hidden sm:inline">Discussion</span>
            <span>({story.descendants || 0})</span>
          </button>

          {/* Direct link button */}
          {story.url && (
            <button
              onClick={handleOpenDirect}
              title="Open full page in a new browser tab"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-black hover:bg-[#eaeaea] rounded text-xs font-mono-meta font-medium transition-colors cursor-pointer"
            >
              <span>Open Tab</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            title="Copy URL"
            className="p-1 rounded text-[#777777] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Comfort adjustments toggle for text posts */}
          {story.text && (
            <button
              onClick={() => setShowComfortPanel(!showComfortPanel)}
              className="p-1 rounded text-[#777777] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Reading typography settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Comfort Settings Dropdown for Self-Posts */}
      {showComfortPanel && story.text && (
        <div className="shrink-0 px-4 py-2 bg-[#111111] border-b border-white/[0.08] text-xs font-mono-meta flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#888888]">Size:</span>
            <button
              onClick={() => onUpdatePrefs((p) => ({ ...p, fontSize: Math.max(14, p.fontSize - 1) }))}
              className="px-2 py-0.5 bg-[#1a1a1a] rounded text-white"
            >
              -
            </button>
            <span className="text-white">{prefs.fontSize}px</span>
            <button
              onClick={() => onUpdatePrefs((p) => ({ ...p, fontSize: Math.min(24, p.fontSize + 1) }))}
              className="px-2 py-0.5 bg-[#1a1a1a] rounded text-white"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#888888]">Font:</span>
            {(['sans', 'serif', 'mono'] as const).map((font) => (
              <button
                key={font}
                onClick={() => onUpdatePrefs((p) => ({ ...p, fontFamily: font }))}
                className={`px-2 py-0.5 rounded capitalize ${
                  prefs.fontFamily === font ? 'bg-white text-black font-semibold' : 'text-[#888888]'
                }`}
              >
                {font}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area: Maximum Space Dedicated to Article or Post */}
      <div className="flex-1 w-full h-full relative overflow-y-auto bg-black">
        {story.url ? (
          /* Live Article Frame filling 100% of remaining width and height */
          <div className="w-full h-full relative flex flex-col bg-[#050505]">
            {!iframeError ? (
              <iframe
                src={story.url}
                title={story.title}
                className="w-full flex-1 border-0 bg-white"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="eager"
                onError={() => setIframeError(true)}
              />
            ) : (
              /* Fallback if external site blocks iframe embedding (X-Frame-Options) */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs font-mono-meta">
                <Globe className="w-10 h-10 text-[#ff6600] mb-3 opacity-60" />
                <h3 className="text-base font-medium text-white mb-1.5">{story.title}</h3>
                <p className="text-[#888888] max-w-md mb-6 leading-relaxed">
                  This publisher ({domain}) disallows in-app embedding for security. You can read the original article directly:
                </p>
                <button
                  onClick={handleOpenDirect}
                  className="px-5 py-2.5 bg-white text-black hover:bg-[#eaeaea] font-medium rounded-lg text-xs font-mono-meta flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Open {domain} in Full Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Self-post / Ask HN full distraction-free reading canvas */
          <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 w-full">
            <h1 className="text-2xl sm:text-3xl font-medium text-white mb-4 leading-snug tracking-tight">
              {story.title}
            </h1>
            <div className="flex items-center gap-3 text-xs font-mono-meta text-[#777777] pb-6 mb-8 border-b border-white/[0.08]">
              <span>by @{story.by}</span>
              <span>·</span>
              <span>{timeAgo(story.time)}</span>
              <span>·</span>
              <span>{story.score} points</span>
              <span>·</span>
              <button onClick={onOpenThread} className="text-[#ff6600] hover:underline">
                {story.descendants || 0} comments
              </button>
            </div>

            {story.text ? (
              <div
                className={`text-[#d4d4d4] ${fontClasses} ${lineHeightClasses} comment-content`}
                style={{ fontSize: `${prefs.fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: cleanHnHtml(story.text) }}
              />
            ) : (
              <p className="text-xs font-mono-meta text-[#666666]">
                No text body provided for this discussion.
              </p>
            )}

            <footer className="mt-16 pt-8 border-t border-white/[0.06] text-center text-[11px] font-mono-meta text-[#555555]">
              Hacker News by PG · Made by Prashant
            </footer>
          </div>
        )}
      </div>
    </div>
  )
}
