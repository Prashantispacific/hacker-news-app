import { useEffect } from 'react'

interface KeyboardShortcutsOptions {
  onNextStory?: () => void
  onPrevStory?: () => void
  onOpenLink?: () => void
  onOpenDiscussion?: () => void
  onOpenReader?: () => void
  onToggleSearch?: () => void
  onToggleFoldRoot?: () => void
  onEscape?: () => void
}

export function useKeyboard(options: KeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape' && options.onEscape) {
          options.onEscape()
        }
        return
      }

      if (e.key === 'j' || (e.key === 'ArrowDown' && e.altKey)) {
        e.preventDefault()
        options.onNextStory?.()
      } else if (e.key === 'k' || (e.key === 'ArrowUp' && e.altKey)) {
        e.preventDefault()
        options.onPrevStory?.()
      } else if (e.key === 'o') {
        e.preventDefault()
        options.onOpenLink?.()
      } else if (e.key === 'c') {
        e.preventDefault()
        options.onOpenDiscussion?.()
      } else if (e.key === 'r') {
        e.preventDefault()
        options.onOpenReader?.()
      } else if (e.key === '/') {
        e.preventDefault()
        options.onToggleSearch?.()
      } else if (e.key === 'f') {
        e.preventDefault()
        options.onToggleFoldRoot?.()
      } else if (e.key === 'Escape') {
        options.onEscape?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [options])
}
