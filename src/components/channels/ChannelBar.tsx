import React, { useRef } from 'react'
import { Plus, X } from 'lucide-react'
import type { Channel } from '../../types'

interface ChannelBarProps {
  channels: Channel[]
  activeChannelId: string
  onSelectChannel: (id: string) => void
  onOpenAddModal: () => void
  onRemoveChannel: (id: string) => void
}

export const ChannelBar: React.FC<ChannelBarProps> = ({
  channels,
  activeChannelId,
  onSelectChannel,
  onOpenAddModal,
  onRemoveChannel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="w-full border-b border-white/[0.06] bg-black py-3 px-4 sm:px-7">
      <div
        ref={containerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x"
      >
        {channels.map((ch) => {
          const isActive = ch.id === activeChannelId
          return (
            <div
              key={ch.id}
              className={`group relative flex items-center shrink-0 rounded-full text-xs font-mono-meta transition-all duration-150 ${
                isActive
                  ? 'bg-white text-black font-medium shadow-sm'
                  : 'bg-[#121212] text-[#888888] hover:text-[#d0d0d0] hover:bg-[#1a1a1a] border border-white/[0.04]'
              }`}
            >
              <button
                onClick={() => onSelectChannel(ch.id)}
                className="px-3 py-1 cursor-pointer select-none focus:outline-none"
              >
                {ch.label}
              </button>

              {/* Remove button for user custom channels */}
              {ch.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveChannel(ch.id)
                  }}
                  title="Delete custom channel"
                  className={`pr-2 -ml-1 cursor-pointer transition-opacity ${
                    isActive ? 'text-black/60 hover:text-black' : 'text-[#666666] hover:text-white'
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )
        })}

        {/* Add custom channel button */}
        <button
          onClick={onOpenAddModal}
          title="Create custom channel filter"
          className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full text-xs font-mono-meta bg-transparent text-[#666666] hover:text-[#ff6600] border border-dashed border-white/[0.12] hover:border-[#ff6600]/40 transition-all cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>New</span>
        </button>
      </div>
    </div>
  )
}
