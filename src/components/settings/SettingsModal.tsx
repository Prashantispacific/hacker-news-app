import React, { useState } from 'react'
import {
  X,
  ShieldAlert,
  Plus,
  Trash2,
  Moon,
  Download,
  Keyboard,
  BookOpen,
  ExternalLink,
  Sparkles,
  Smartphone,
  Shield,
  FileText,
  Info,
  Globe,
} from 'lucide-react'

const GithubIcon = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)
import type { MuteRules, ReaderPreferences } from '../../types'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { openExternalUrl } from '../../utils/browser'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  muteRules: MuteRules
  onAddMuteRule: (type: 'keywords' | 'domains' | 'authors', value: string) => void
  onRemoveMuteRule: (type: 'keywords' | 'domains' | 'authors', value: string) => void
  onClearAllMuteRules: () => void
  prefs: ReaderPreferences
  onUpdatePrefs: (updater: (prev: ReaderPreferences) => ReaderPreferences) => void
  onExportData: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  muteRules,
  onAddMuteRule,
  onRemoveMuteRule,
  onClearAllMuteRules,
  prefs,
  onUpdatePrefs,
  onExportData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'mute' | 'display' | 'privacy' | 'terms' | 'about' | 'shortcuts' | 'guide'
  >('mute')
  const [keywordInput, setKeywordInput] = useState('')
  const [domainInput, setDomainInput] = useState('')
  const [authorInput, setAuthorInput] = useState('')
  const { canInstall, isInstalled, promptInstall } = usePwaInstall()

  if (!isOpen) return null

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault()
    if (keywordInput.trim()) {
      onAddMuteRule('keywords', keywordInput.trim())
      setKeywordInput('')
    }
  }

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault()
    if (domainInput.trim()) {
      onAddMuteRule('domains', domainInput.trim())
      setDomainInput('')
    }
  }

  const handleAddAuthor = (e: React.FormEvent) => {
    e.preventDefault()
    if (authorInput.trim()) {
      onAddMuteRule('authors', authorInput.trim())
      setAuthorInput('')
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 pt-[max(1rem,calc(env(safe-area-inset-top,0px)+0.75rem))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#0a0a0a] border border-white/[0.12] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header with Direct Guide Button */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/[0.08] bg-[#111111]">
          <h2 className="text-sm font-mono-meta font-medium text-white tracking-wide uppercase">
            Preferences & Settings
          </h2>
          <div className="flex items-center gap-2">
            {/* Guide Button in Setting Icon Modal */}
            <a
              href="/guide.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a1a1a] hover:bg-[#252525] border border-white/[0.1] rounded-full text-xs font-mono-meta text-[#ff6600] hover:text-[#ff8833] transition-colors cursor-pointer"
              title="Open Complete Platform & Custom Filter Guide"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Platform Guide ↗</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.16] active:bg-[#ff6600]/25 text-[#cccccc] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-white/[0.06] bg-[#0c0c0c] px-4 pt-2 gap-2 text-xs font-mono-meta overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('mute')}
            className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'mute'
                ? 'border-[#ff6600] text-white font-medium'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            Negative Filtering
          </button>
          <button
            onClick={() => setActiveTab('display')}
            className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'display'
                ? 'border-[#ff6600] text-white font-medium'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            OLED & Display
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-[#ff6600] text-white font-medium'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-[#ff6600] text-white font-medium'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            Terms & Disclaimer
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-[#ff6600] text-white font-medium'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            About & Contact
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'shortcuts'
                ? 'border-[#ff6600] text-white font-medium'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-[#ff6600] text-white font-medium'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            <span>Guide & Docs</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs font-mono-meta">
          {/* MUTE RULES TAB */}
          {activeTab === 'mute' && (
            <div className="space-y-5">
              <div className="flex items-start gap-2.5 p-3 bg-[#141414] border border-white/[0.06] rounded-lg text-[#909090]">
                <ShieldAlert className="w-4 h-4 text-[#ff6600] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Negative filtering occurs 100% on-device. Stories containing muted keywords,
                  originating from muted domains, or authored by muted users will be filtered out.
                </p>
              </div>

              {/* Mute Keywords */}
              <div>
                <label className="block text-[#cccccc] mb-2 font-medium">Muted Keywords</label>
                <form onSubmit={handleAddKeyword} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. crypto, nft, election"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    className="flex-1 bg-[#141414] border border-white/[0.1] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#ff6600]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-white text-black font-medium rounded hover:bg-[#eaeaea] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="flex flex-wrap gap-1.5">
                  {muteRules.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1a1a] border border-white/[0.08] text-[#cccccc] rounded-full"
                    >
                      <span>{kw}</span>
                      <button
                        onClick={() => onRemoveMuteRule('keywords', kw)}
                        className="hover:text-[#ff6600] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Mute Domains */}
              <div>
                <label className="block text-[#cccccc] mb-2 font-medium">Muted Domains</label>
                <form onSubmit={handleAddDomain} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. paywall.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    className="flex-1 bg-[#141414] border border-white/[0.1] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#ff6600]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-white text-black font-medium rounded hover:bg-[#eaeaea] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="flex flex-wrap gap-1.5">
                  {muteRules.domains.map((dom) => (
                    <span
                      key={dom}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1a1a] border border-white/[0.08] text-[#cccccc] rounded-full"
                    >
                      <span>{dom}</span>
                      <button
                        onClick={() => onRemoveMuteRule('domains', dom)}
                        className="hover:text-[#ff6600] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Mute Authors */}
              <div>
                <label className="block text-[#cccccc] mb-2 font-medium">Muted Authors</label>
                <form onSubmit={handleAddAuthor} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. username"
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                    className="flex-1 bg-[#141414] border border-white/[0.1] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#ff6600]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-white text-black font-medium rounded hover:bg-[#eaeaea] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="flex flex-wrap gap-1.5">
                  {muteRules.authors.map((author) => (
                    <span
                      key={author}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1a1a] border border-white/[0.08] text-[#cccccc] rounded-full"
                    >
                      <span>@{author}</span>
                      <button
                        onClick={() => onRemoveMuteRule('authors', author)}
                        className="hover:text-[#ff6600] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {(muteRules.keywords.length > 0 ||
                muteRules.domains.length > 0 ||
                muteRules.authors.length > 0) && (
                <div className="pt-2">
                  <button
                    onClick={onClearAllMuteRules}
                    className="text-[#ff6600] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear all mute rules</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DISPLAY TAB */}
          {activeTab === 'display' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#141414] border border-white/[0.06] rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Moon className="w-4 h-4 text-[#ff6600]" />
                    <span>True Black Canvas (`#000000`)</span>
                  </h3>
                  <p className="text-[#777777] text-[11px] mt-1 leading-relaxed">
                    Default is halation-safe near-black (`#0A0A0A`). Toggle for absolute true black pixels to maximize OLED power savings.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.trueBlack}
                  onChange={(e) =>
                    onUpdatePrefs((p) => ({ ...p, trueBlack: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#ff6600] cursor-pointer"
                />
              </div>

              {/* Progressive Web App Status */}
              <div className="p-4 bg-[#141414] border border-white/[0.06] rounded-lg flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#ff6600]" />
                    <span>Progressive Web App (PWA)</span>
                  </h3>
                  <p className="text-[#777777] text-[11px] mt-1 leading-relaxed">
                    Install Hacker News by PG to your home screen or desktop for offline reading, standalone launch, and instant caching.
                  </p>
                </div>
                {canInstall ? (
                  <button
                    onClick={promptInstall}
                    className="px-3.5 py-1.5 bg-white text-black font-semibold rounded-lg text-xs font-mono-meta hover:bg-[#eaeaea] transition-colors shrink-0 cursor-pointer"
                  >
                    Install App
                  </button>
                ) : isInstalled ? (
                  <span className="px-2.5 py-1 bg-[#ff6600]/15 text-[#ff6600] border border-[#ff6600]/30 rounded text-xs font-mono-meta shrink-0">
                    Installed ✓
                  </span>
                ) : (
                  <span className="text-xs font-mono-meta text-[#666666] shrink-0">
                    Ready
                  </span>
                )}
              </div>

              {/* Data Export */}
              <div className="pt-4 border-t border-white/[0.06]">
                <h3 className="text-white font-medium mb-1.5">Local Data Management</h3>
                <p className="text-[#777777] text-[11px] mb-3">
                  All channels, bookmarks, and mutes are strictly stored on your device.
                </p>
                <button
                  onClick={onExportData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#141414] hover:bg-[#1f1f1f] border border-white/[0.08] text-white rounded transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#ff6600]" />
                  <span>Export JSON Backup</span>
                </button>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs font-mono-meta leading-relaxed">
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                <Shield className="w-4 h-4 text-[#ff6600]" />
                <h3 className="text-sm font-medium text-white">Privacy Policy</h3>
                <span className="text-[10px] text-[#666666] ml-auto">Last updated: November 2026</span>
              </div>

              <div className="p-3.5 bg-[#121212] border border-white/[0.06] rounded-lg space-y-2">
                <span className="text-white font-medium block">1. Strict Zero Data Collection</span>
                <p className="text-[#888888]">
                  HN by PG is built with a strict privacy-first architecture. We do not require account registration, collect personal information, or track your reading habits. There are zero advertising trackers, analytics SDKs, or device fingerprinting embedded in this app.
                </p>
              </div>

              <div className="p-3.5 bg-[#121212] border border-white/[0.06] rounded-lg space-y-2">
                <span className="text-white font-medium block">2. Direct API Communication</span>
                <p className="text-[#888888]">
                  All story feeds, comments, and search queries communicate directly from your device to the official open Hacker News Firebase API (<code className="text-[#6cb6ff]">hacker-news.firebaseio.com</code>) and Algolia search API. There is no intermediate custom server logging your requests.
                </p>
              </div>

              <div className="p-3.5 bg-[#121212] border border-white/[0.06] rounded-lg space-y-2">
                <span className="text-white font-medium block">3. 100% On-Device Local Storage</span>
                <p className="text-[#888888]">
                  Your bookmarks, custom channel rules, negative filtering (mute lists), read state, and display preferences remain strictly on your local device storage (IndexedDB & LocalStorage). This data is never uploaded, synced to an external database, or transmitted to any third party.
                </p>
              </div>

              <div className="p-3.5 bg-[#121212] border border-white/[0.06] rounded-lg space-y-2">
                <span className="text-white font-medium block">4. External Web Links</span>
                <p className="text-[#888888]">
                  When you tap links to read external articles or view websites via in-app browser tabs, you are visiting third-party sites that operate under their own independent privacy policies.
                </p>
              </div>

              <div className="p-3.5 bg-[#141414] border border-[#ff6600]/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-white font-medium block">Privacy Questions?</span>
                  <span className="text-[#777777] text-[11px]">Open an issue or inquiry on GitHub:</span>
                </div>
                <button
                  onClick={() => openExternalUrl('https://github.com/Prashantispacific/hacker-news-app/issues')}
                  className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-white/[0.1] rounded text-[#ff6600] text-[11px] flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <GithubIcon className="w-3 h-3" />
                  <span>GitHub Issues</span>
                </button>
              </div>
            </div>
          )}

          {/* TERMS OF SERVICE & DISCLAIMER TAB */}
          {activeTab === 'terms' && (
            <div className="space-y-4 text-xs font-mono-meta leading-relaxed">
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                <FileText className="w-4 h-4 text-[#ff6600]" />
                <h3 className="text-sm font-medium text-white">Terms & Disclaimer</h3>
                <span className="text-[10px] text-[#666666] ml-auto">Version 1.0</span>
              </div>

              <div className="p-3.5 bg-[#121212] border border-white/[0.06] rounded-lg space-y-2">
                <span className="text-white font-medium block">1. Unofficial Client & Wrapper Statement</span>
                <p className="text-[#888888]">
                  <strong className="text-white">HN by PG</strong> is an independent, unofficial client application built to deliver an elevated, OLED-first reading experience for Hacker News. Think of this application as the classic Hacker News in "new and better clothes" — zero server middleware, pure front-end craftsmanship, and high signal-to-noise discussion tools.
                </p>
              </div>

              <div className="p-3.5 bg-[#121212] border border-white/[0.06] rounded-lg space-y-2">
                <span className="text-white font-medium block">2. Trademark & Content Attribution</span>
                <p className="text-[#888888]">
                  "Hacker News" and the original Y Combinator trademarks are the intellectual property of Y Combinator LLC. This app is not affiliated with, endorsed by, or sponsored by Y Combinator or Paul Graham. All article links, headlines, comments, and discussion content originate from the community of news.ycombinator.com via its public API.
                </p>
              </div>

              <div className="p-3.5 bg-[#121212] border border-white/[0.06] rounded-lg space-y-2">
                <span className="text-white font-medium block">3. User-Generated Content Disclaimer</span>
                <p className="text-[#888888]">
                  Content presented in story discussions is generated by independent users on Hacker News. We do not edit, moderate, or take responsibility for user comments or external linked material.
                </p>
              </div>

              <div className="p-3.5 bg-[#121212] border border-white/[0.06] rounded-lg space-y-2">
                <span className="text-white font-medium block">4. License & "As-Is" Provision</span>
                <p className="text-[#888888]">
                  This application is provided free of charge on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. You agree to use it at your own discretion.
                </p>
              </div>

              <div className="p-3.5 bg-[#141414] border border-[#ff6600]/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-white font-medium block">Legal Inquiries & Feedback</span>
                  <span className="text-[#777777] text-[11px]">Contact via GitHub repository:</span>
                </div>
                <button
                  onClick={() => openExternalUrl('https://github.com/Prashantispacific/hacker-news-app/issues')}
                  className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-white/[0.1] rounded text-[#ff6600] text-[11px] flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <GithubIcon className="w-3 h-3" />
                  <span>GitHub Issues</span>
                </button>
              </div>
            </div>
          )}

          {/* ABOUT & CONTACT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs font-mono-meta leading-relaxed">
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                <Info className="w-4 h-4 text-[#ff6600]" />
                <h3 className="text-sm font-medium text-white">About & Developer</h3>
                <span className="text-[10px] text-[#ff6600] ml-auto">v1.0.0</span>
              </div>

              <div className="p-4 bg-[#141414] border border-[#ff6600]/30 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 px-2 bg-[#ff6600] rounded-[4px] flex items-center justify-center font-bold text-sm text-white">
                    HN
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">HN by PG</h4>
                    <span className="text-[#888888] text-[11px]">The classic Hacker News in modern OLED attire</span>
                  </div>
                </div>

                <p className="text-[#999999] leading-relaxed">
                  Engineered as an ultra-fast, high-signal, zero-clutter wrapper around Hacker News. Built with real-time progressive comment streaming, guide rails, OP tracking, instant search, and complete on-device privacy.
                </p>

                <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[11px]">
                  <div>
                    <span className="text-[#666666] block">Developer</span>
                    <span className="text-white font-medium">Prashant</span>
                  </div>
                  <div>
                    <span className="text-[#666666] block">GitHub Profile</span>
                    <button
                      onClick={() => openExternalUrl('https://github.com/Prashantispacific')}
                      className="text-[#6cb6ff] hover:underline cursor-pointer"
                    >
                      @Prashantispacific
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#121212] border border-white/[0.06] rounded-lg space-y-2 text-[#888888]">
                <span className="text-white font-medium block">Tech Stack & Open Standards</span>
                <p>
                  React 19 · Capacitor 8 · Tailwind CSS v4 · JetBrains Mono & Newsreader Typography · Official Hacker News Firebase API.
                </p>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <button
                  onClick={() => openExternalUrl('https://hackernewsbypg.netlify.app/')}
                  className="w-full py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-white/[0.1] text-[#ff6600] font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Launch Web App (PWA) ↗</span>
                </button>
                <button
                  onClick={() => openExternalUrl('https://github.com/Prashantispacific/hacker-news-app/issues')}
                  className="w-full py-2.5 bg-white text-black hover:bg-[#eaeaea] font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>Report Bug or Feature on GitHub</span>
                </button>
              </div>
            </div>
          )}

          {/* SHORTCUTS TAB */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#cccccc] font-medium mb-2">
                <Keyboard className="w-4 h-4 text-[#ff6600]" />
                <span>Desktop Hotkeys</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[#888888]">
                <div className="flex items-center justify-between p-2 bg-[#121212] rounded">
                  <span>Next story</span>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded text-white text-[10px]">
                    j
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#121212] rounded">
                  <span>Previous story</span>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded text-white text-[10px]">
                    k
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#121212] rounded">
                  <span>Open article link</span>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded text-white text-[10px]">
                    o
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#121212] rounded">
                  <span>Open comments</span>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded text-white text-[10px]">
                    c
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#121212] rounded">
                  <span>Open reader mode</span>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded text-white text-[10px]">
                    r
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#121212] rounded">
                  <span>Instant search</span>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded text-white text-[10px]">
                    /
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#121212] rounded">
                  <span>Fold to root</span>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded text-white text-[10px]">
                    f
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#121212] rounded">
                  <span>Close dialog</span>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded text-white text-[10px]">
                    Esc
                  </kbd>
                </div>
              </div>
            </div>
          )}

          {/* GUIDE & DOCS TAB */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#141414] border border-[#ff6600]/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-white font-medium">
                    <Sparkles className="w-4 h-4 text-[#ff6600]" />
                    <span>Hacker News by PG Guide</span>
                  </span>
                  <span className="text-[10px] bg-[#ff6600]/20 text-[#ff6600] px-2 py-0.5 rounded font-mono">
                    HTML DOCS
                  </span>
                </div>
                <p className="text-[#a0a0a0] leading-relaxed text-xs">
                  We built a comprehensive, standalone documentation page covering custom filter creation with examples, discussion signal tools (OP Stepper, Link Drawer, Guide Rails), offline caching, and architecture.
                </p>
                <div className="pt-1">
                  <a
                    href="/guide.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-[#eaeaea] font-medium rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <span>Open Full Platform Guide in New Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-3 bg-[#111111] border border-white/[0.06] rounded-lg space-y-2">
                <span className="text-[#cccccc] font-medium block">What's in the guide?</span>
                <ul className="text-[#888888] space-y-1 list-disc list-inside">
                  <li>Original channel lineup breakdown (#top, #new, #past, #best, etc.)</li>
                  <li>Custom topic filter step-by-step tutorial with 3 concrete examples</li>
                  <li>How automatic keyword inference works for tags like #ai, #rust, #apple</li>
                  <li>How Chromatic 2px guide rails and OP stepper operate</li>
                  <li>Negative filtering & on-device mute lists</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Subtle Modal Footer */}
        <div className="px-5 py-2.5 bg-[#0b0b0b] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono-meta text-[#666666]">
          <span>Hacker News by PG</span>
          <span className="text-[#888888]">Made by Prashant</span>
        </div>
      </div>
    </div>
  )
}
