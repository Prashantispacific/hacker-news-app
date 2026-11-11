import React, { useState } from 'react'
import { X, Hash, Sparkles } from 'lucide-react'
import type { Channel } from '../../types'

interface AddChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onAddChannel: (channel: Omit<Channel, 'isCustom'>) => void
}

const PRESET_TOPICS = [
  { name: '#ai', keywords: 'ai, llm, gpt, claude, machine learning' },
  { name: '#rust', keywords: 'rust, cargo, crates' },
  { name: '#crypto', keywords: 'crypto, bitcoin, ethereum, blockchain' },
  { name: '#apple', keywords: 'apple, ios, mac, swift' },
  { name: '#linux', keywords: 'linux, kernel, ubuntu, debian' },
]

export const AddChannelModal: React.FC<AddChannelModalProps> = ({
  isOpen,
  onClose,
  onAddChannel,
}) => {
  const [label, setLabel] = useState('')
  const [keywords, setKeywords] = useState('')
  const [domains, setDomains] = useState('')
  const [minScore, setMinScore] = useState<number>(0)

  if (!isOpen) return null

  const handleApplyPreset = (preset: { name: string; keywords: string }) => {
    setLabel(preset.name)
    setKeywords(preset.keywords)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let cleanLabel = label.trim()
    if (!cleanLabel) return
    if (!cleanLabel.startsWith('#')) {
      cleanLabel = `#${cleanLabel}`
    }

    const keywordList = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)

    const domainList = domains
      .split(',')
      .map((d) => d.trim().replace(/^https?:\/\//, '').replace(/^www\./, ''))
      .filter(Boolean)

    // If no explicit keywords AND no domains provided, use the channel tag as keyword fallback
    const inferredKeyword = cleanLabel.replace(/^#/, '').trim()
    const finalKeywords =
      keywordList.length > 0
        ? keywordList
        : domainList.length === 0 && inferredKeyword
        ? [inferredKeyword]
        : []

    onAddChannel({
      id: `custom-${cleanLabel.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}-${Date.now()}`,
      label: cleanLabel,
      description: `Custom filter for ${cleanLabel}`,
      keywords: finalKeywords,
      domains: domainList,
      minScore: minScore > 0 ? minScore : undefined,
    })

    // Reset and close
    setLabel('')
    setKeywords('')
    setDomains('')
    setMinScore(0)
    onClose()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 pt-[max(1rem,calc(env(safe-area-inset-top,0px)+0.75rem))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/[0.12] rounded-xl p-5 sm:p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#ff6600]" />
            <h2 className="text-sm font-mono-meta font-medium text-white tracking-wide uppercase">
              Create Custom Filter
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add channel modal"
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.16] active:bg-[#ff6600]/25 text-[#cccccc] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick presets */}
        <div className="mt-4 pt-1">
          <span className="text-[11px] font-mono-meta text-[#888888] flex items-center gap-1 mb-2">
            <Sparkles className="w-3 h-3 text-[#ff6600]" /> Quick Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TOPICS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 rounded bg-[#161616] hover:bg-[#222222] border border-white/[0.08] text-xs font-mono-meta text-[#cccccc] hover:text-white transition-colors cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-mono-meta">
          <div>
            <label className="block text-[#a0a0a0] mb-1.5 font-medium">Channel Name</label>
            <input
              type="text"
              required
              placeholder="e.g. #ai or #rust or #security"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-[#141414] border border-white/[0.1] rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#a0a0a0] mb-1.5">
              Keywords <span className="text-[#666666]">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. gpt, claude, transformer (optional: defaults to name)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full bg-[#141414] border border-white/[0.1] rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#a0a0a0] mb-1.5">
              Domains <span className="text-[#666666]">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. arxiv.org, github.com (optional)"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              className="w-full bg-[#141414] border border-white/[0.1] rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#a0a0a0] mb-1.5">
              Minimum Score <span className="text-[#666666]">(optional)</span>
            </label>
            <input
              type="number"
              min="0"
              step="10"
              placeholder="0 (no minimum score requirement)"
              value={minScore || ''}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-[#141414] border border-white/[0.1] rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-[#888888] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black hover:bg-[#eaeaea] font-medium rounded transition-colors cursor-pointer"
            >
              Create Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
