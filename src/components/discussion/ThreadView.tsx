import React, { useState } from 'react'
import type { Story, CommentNode, ExtractedLink } from '../../types'
import { CommentItem } from './CommentItem'
import { OpStepper } from './OpStepper'
import { LinkDrawer } from './LinkDrawer'
import { ExternalLink, Layers, Link2, Globe, MessageSquare } from 'lucide-react'
import { timeAgo, extractDomain } from '../../utils/timeAgo'

interface ThreadViewProps {
  story: Story | null
  comments: CommentNode[]
  loading: boolean
  loadedCount: number
  extractedLinks: ExtractedLink[]
  opCommentIds: number[]
  foldToRoot: boolean
  isCollapsed: (id: number, level: number) => boolean
  onToggleCollapse: (id: number) => void
  onToggleFoldToRoot: () => void
  onOpenReader: () => void
}

export const ThreadView: React.FC<ThreadViewProps> = ({
  story,
  comments,
  loading,
  loadedCount,
  extractedLinks,
  opCommentIds,
  foldToRoot,
  isCollapsed,
  onToggleCollapse,
  onToggleFoldToRoot,
  onOpenReader,
}) => {
  const [isLinkDrawerOpen, setIsLinkDrawerOpen] = useState(false)

  if (!story) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs font-mono-meta text-[#666666]">
        <MessageSquare className="w-8 h-8 mb-3 opacity-30 text-[#ff6600]" />
        <p>Select a story from the feed to view discussions.</p>
      </div>
    )
  }

  const domain = extractDomain(story.url)

  const handleJumpToComment = (commentId: number) => {
    const el = document.getElementById(`comment-${commentId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('bg-[#ff6600]/15')
      setTimeout(() => el.classList.remove('bg-[#ff6600]/15'), 1800)
    }
  }

  return (
    <div className="w-full pb-28">
      {/* Story Thread Header Card with High Breathing Room */}
      <div className="p-5 sm:p-8 border-b border-white/[0.08] bg-black">
        <h1 className="text-xl sm:text-2xl font-medium text-white leading-snug tracking-tight">
          {story.title}
        </h1>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs font-mono-meta text-[#888888]">
          {domain && (
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6cb6ff] hover:underline flex items-center gap-1"
            >
              <span>{domain}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
          <span>{story.score} points</span>
          <span>by @{story.by}</span>
          <span>{timeAgo(story.time)}</span>
          <span className="text-[#ff6600] font-medium">{story.descendants || 0} comments</span>
        </div>

        {/* Action quick links */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {story.url && (
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-[#eaeaea] font-medium rounded text-xs font-mono-meta transition-colors cursor-pointer"
            >
              <span>Visit Original Article</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            onClick={onOpenReader}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-white/[0.08] rounded text-xs font-mono-meta text-[#ededed] transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#ff6600]" />
            <span>Direct Page Preview</span>
          </button>
        </div>
      </div>

      {/* Discussion Signals Sticky Bar */}
      <div className="sticky top-14 z-20 px-4 sm:px-8 py-2.5 bg-black/95 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          {/* Fold-to-Root Toggle */}
          <button
            onClick={onToggleFoldToRoot}
            title="Toggle between all replies and root comments only"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-meta transition-all cursor-pointer ${
              foldToRoot
                ? 'bg-white text-black font-medium'
                : 'bg-[#141414] text-[#888888] hover:text-white border border-white/[0.08]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>{foldToRoot ? 'Roots Only' : 'Fold-to-Root'}</span>
          </button>

          {/* Link Drawer Trigger */}
          <button
            onClick={() => setIsLinkDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-meta bg-[#141414] text-[#888888] hover:text-white border border-white/[0.08] transition-all cursor-pointer"
          >
            <Link2 className="w-3 h-3 text-[#ff6600]" />
            <span>Links ({extractedLinks.length})</span>
          </button>
        </div>

        {/* OP Stepper */}
        {opCommentIds.length > 0 && <OpStepper opCommentIds={opCommentIds} />}
      </div>

      {/* Loading Progress */}
      {loading && (
        <div className="p-8 text-center text-xs font-mono-meta text-[#777777] flex items-center justify-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#ff6600] animate-ping" />
          <span>Building discussion tree ({loadedCount} comments parsed)...</span>
        </div>
      )}

      {/* Pure, Minimal Comment Tree with Generous Breathing Space */}
      <div className="px-4 sm:px-8 py-6" role="tree" aria-label="Thread comments">
        {comments.length === 0 && !loading ? (
          <div className="py-16 text-center text-xs font-mono-meta text-[#666666]">
            No comments on this story yet.
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {comments.map((root, idx) => (
              <div
                key={root.id}
                className={idx > 0 ? 'pt-6 sm:pt-8 border-t border-white/[0.06]' : ''}
              >
                <CommentItem
                  comment={root}
                  opAuthor={story.by}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={onToggleCollapse}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subtle Discussion Footer */}
      {comments.length > 0 && (
        <footer className="pt-8 pb-12 text-center border-t border-white/[0.04] mt-6">
          <p className="text-[11px] font-mono-meta text-[#555555] tracking-wider">
            Hacker News by PG · Made by Prashant
          </p>
        </footer>
      )}

      {/* Link Drawer Sheet */}
      <LinkDrawer
        isOpen={isLinkDrawerOpen}
        onClose={() => setIsLinkDrawerOpen(false)}
        links={extractedLinks}
        onJumpToComment={handleJumpToComment}
      />
    </div>
  )
}
