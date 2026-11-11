export interface Story {
  id: number
  title: string
  url?: string
  by: string
  score: number
  time: number
  descendants?: number
  kids?: number[]
  type?: string
  text?: string
}

export interface HNItem {
  id: number
  deleted?: boolean
  type?: string
  by?: string
  time?: number
  text?: string
  dead?: boolean
  parent?: number
  poll?: number
  kids?: number[]
  url?: string
  score?: number
  title?: string
  parts?: number[]
  descendants?: number
}

export interface CommentNode {
  id: number
  by: string
  text: string
  time: number
  parent: number
  kids: CommentNode[]
  level: number
  parentAuthor?: string
  deleted?: boolean
  dead?: boolean
  totalDescendants?: number
  isLoadingReplies?: boolean
}

export interface ExtractedLink {
  url: string
  domain: string
  author: string
  commentId: number
  contextText: string
}

export interface Channel {
  id: string
  label: string
  description?: string
  isCustom?: boolean
  feedType?: 'top' | 'best' | 'new' | 'past' | 'ask' | 'show' | 'jobs' | 'saved'
  keywords?: string[]
  domains?: string[]
  minScore?: number
}

export interface MuteRules {
  keywords: string[]
  domains: string[]
  authors: string[]
}

export interface ReaderPreferences {
  fontSize: number
  lineHeight: 'compact' | 'comfortable' | 'spacious'
  fontFamily: 'sans' | 'serif' | 'mono'
  maxWidth: 'narrow' | 'medium' | 'wide'
  warmth: boolean
  trueBlack: boolean
}

export type ActiveTab = 'feed' | 'reader' | 'thread'
