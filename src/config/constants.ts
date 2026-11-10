export const HN_FIREBASE_BASE = 'https://hacker-news.firebaseio.com/v0'
export const HN_ALGOLIA_BASE = 'https://hn.algolia.com/api/v1'
export const JINA_READER_BASE = 'https://r.jina.ai'

export const STORAGE_KEYS = {
  CHANNELS: 'void_hn_custom_channels_v1',
  MUTE_RULES: 'void_hn_mute_rules_v1',
  BOOKMARKS: 'void_hn_bookmarks_v1',
  READ_STORIES: 'void_hn_read_stories_v1',
  READER_PREFS: 'void_hn_reader_prefs_v1',
  ACTIVE_CHANNEL: 'void_hn_active_channel_v1',
} as const

export const DEFAULT_READER_PREFS = {
  fontSize: 17,
  lineHeight: 'comfortable' as const,
  fontFamily: 'serif' as const,
  maxWidth: 'medium' as const,
  warmth: false,
  trueBlack: false,
}

export const DEFAULT_MUTE_RULES = {
  keywords: [],
  domains: [],
  authors: [],
}
