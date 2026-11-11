import React from 'react'
import type { CommentNode } from '../../types'
import { cleanHnHtml } from '../../utils/textParser'
import { timeAgo } from '../../utils/timeAgo'
import { ChevronRight, CornerDownRight, ExternalLink } from 'lucide-react'

interface CommentItemProps {
  comment: CommentNode
  opAuthor?: string
  isCollapsed: (id: number, level: number) => boolean
  onToggleCollapse: (id: number) => void
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  opAuthor,
  isCollapsed,
  onToggleCollapse,
}) => {
  const collapsed = isCollapsed(comment.id, comment.level)
  const isOp = !!opAuthor && comment.by.toLowerCase() === opAuthor.toLowerCase()
  const formattedHtml = cleanHnHtml(comment.text)

  const isDeepLevel = comment.level >= 3
  const shouldIndent = comment.level < 3
  const descendantCount = (comment.kids?.length || 0) + (comment.totalDescendants || 0)

  const scrollToParent = (e: React.MouseEvent) => {
    e.stopPropagation()
    const parentEl = document.getElementById(`comment-${comment.parent}`)
    if (parentEl) {
      parentEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      parentEl.classList.add('bg-[#ff6600]/15')
      setTimeout(() => parentEl.classList.remove('bg-[#ff6600]/15'), 1600)
    }
  }

  return (
    <div
      id={`comment-${comment.id}`}
      role="treeitem"
      aria-expanded={!collapsed}
      className={`relative transition-colors duration-150 ${
        comment.level === 0 ? 'py-1' : 'pt-3 pb-1'
      }`}
    >
      {/* Minimal Header: Author, OP tag, Time, Collapse Button */}
      <div className="flex items-center justify-between gap-3 text-xs font-mono-meta text-[#777777] mb-2 select-none">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <button
            onClick={() => onToggleCollapse(comment.id)}
            className="font-medium text-[#ededed] hover:text-[#ff6600] transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none"
          >
            <span>{comment.by}</span>
            {isOp && (
              <span className="text-[10px] text-[#ff6600] font-bold tracking-wider">
                [op]
              </span>
            )}
          </button>

          <span className="text-[#444444]">·</span>

          <span className="text-[11px] text-[#777777]">{timeAgo(comment.time)}</span>

          {/* Reply indicator for deep clamped levels */}
          {isDeepLevel && comment.parentAuthor && (
            <button
              onClick={scrollToParent}
              title="Jump to parent comment"
              className="inline-flex items-center gap-1 text-[#666666] hover:text-[#ff6600] text-[11px] cursor-pointer transition-colors"
            >
              <CornerDownRight className="w-2.5 h-2.5 text-[#ff6600]/70" />
              <span>@{comment.parentAuthor}</span>
            </button>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggleCollapse(comment.id)}
            className="text-[#666666] hover:text-[#ededed] px-1 py-0.5 rounded text-[11px] cursor-pointer transition-colors"
            title={collapsed ? 'Expand replies' : 'Collapse thread'}
          >
            {collapsed ? `[+${descendantCount + 1}]` : `[–]`}
          </button>

          <a
            href={`https://news.ycombinator.com/item?id=${comment.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on Hacker News"
            className="text-[#444444] hover:text-[#888888] transition-colors p-0.5"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Comment Body or Collapsed Indicator */}
      {!collapsed ? (
        <div className="space-y-3">
          {/* Main Comment Text */}
          <div
            className="text-[#d4d4d4] text-[14.5px] sm:text-[15px] leading-relaxed comment-content font-sans"
            dangerouslySetInnerHTML={{ __html: formattedHtml }}
          />

          {/* Inline pending reply indicator while fetching subtree */}
          {comment.isLoadingReplies && (!comment.kids || comment.kids.length === 0) && (
            <div className="flex items-center gap-2 text-[11px] font-mono-meta text-[#666666] pt-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6600]/80 animate-pulse" />
              <span>loading replies...</span>
            </div>
          )}

          {/* Nested Replies with 1px Subtle Guide Rail */}
          {comment.kids && comment.kids.length > 0 && (
            <div
              role="group"
              className={`relative mt-3 space-y-3 transition-colors ${
                shouldIndent
                  ? 'border-l border-white/[0.08] hover:border-white/[0.22] pl-3.5 sm:pl-4 ml-0.5'
                  : 'border-l border-white/[0.05] pl-2 sm:pl-3 ml-0.5'
              }`}
            >
              {/* Invisible clickable rail gutter to collapse branch */}
              <button
                onClick={() => onToggleCollapse(comment.id)}
                title="Click rail to collapse thread"
                aria-label="Collapse reply tree"
                className="absolute -left-[12px] top-0 bottom-0 w-[20px] cursor-pointer focus:outline-none z-10"
              />

              {comment.kids.map((child) => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  opAuthor={opAuthor}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={onToggleCollapse}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Minimal Collapsed Row */
        <button
          onClick={() => onToggleCollapse(comment.id)}
          className="my-2 py-1 text-xs font-mono-meta text-[#777777] hover:text-white cursor-pointer flex items-center gap-1.5 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5 text-[#ff6600]" />
          <span>
            [+] {descendantCount + 1} {descendantCount === 0 ? 'reply' : 'replies'} collapsed · @{comment.by}
          </span>
        </button>
      )}
    </div>
  )
}
