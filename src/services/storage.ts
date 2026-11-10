import { get, set } from 'idb-keyval'
import { STORAGE_KEYS, DEFAULT_READER_PREFS, DEFAULT_MUTE_RULES } from '../config/constants'
import type { Channel, MuteRules, ReaderPreferences, Story } from '../types'

// Fallback-safe key-value getters and setters
export async function getStoredItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const val = await get<T>(key)
    if (val !== undefined && val !== null) return val
  } catch (err) {
    console.warn(`IDB read failed for ${key}, checking localStorage:`, err)
  }

  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    // ignore
  }

  return defaultValue
}

export async function setStoredItem<T>(key: string, value: T): Promise<void> {
  try {
    await set(key, value)
  } catch (err) {
    console.warn(`IDB write failed for ${key}, falling back to localStorage:`, err)
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

// Channels
export async function getCustomChannels(): Promise<Channel[]> {
  return getStoredItem<Channel[]>(STORAGE_KEYS.CHANNELS, [])
}

export async function saveCustomChannels(channels: Channel[]): Promise<void> {
  return setStoredItem(STORAGE_KEYS.CHANNELS, channels)
}

// Mute Rules
export async function getMuteRules(): Promise<MuteRules> {
  return getStoredItem<MuteRules>(STORAGE_KEYS.MUTE_RULES, DEFAULT_MUTE_RULES)
}

export async function saveMuteRules(rules: MuteRules): Promise<void> {
  return setStoredItem(STORAGE_KEYS.MUTE_RULES, rules)
}

// Bookmarks
export async function getBookmarkedStories(): Promise<Story[]> {
  return getStoredItem<Story[]>(STORAGE_KEYS.BOOKMARKS, [])
}

export async function saveBookmarkedStories(stories: Story[]): Promise<void> {
  return setStoredItem(STORAGE_KEYS.BOOKMARKS, stories)
}

// Read Stories (Set of IDs stored as number[])
export async function getReadStoryIds(): Promise<number[]> {
  return getStoredItem<number[]>(STORAGE_KEYS.READ_STORIES, [])
}

export async function saveReadStoryIds(ids: number[]): Promise<void> {
  return setStoredItem(STORAGE_KEYS.READ_STORIES, ids)
}

// Reader Preferences
export async function getReaderPreferences(): Promise<ReaderPreferences> {
  return getStoredItem<ReaderPreferences>(STORAGE_KEYS.READER_PREFS, DEFAULT_READER_PREFS)
}

export async function saveReaderPreferences(prefs: ReaderPreferences): Promise<void> {
  return setStoredItem(STORAGE_KEYS.READER_PREFS, prefs)
}
