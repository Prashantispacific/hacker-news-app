import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { Clipboard } from '@capacitor/clipboard'

export async function openExternalUrl(url: string): Promise<void> {
  if (!url) return
  try {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url, presentationStyle: 'popover' })
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  } catch (err) {
    console.error('Failed to open URL in browser:', err)
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false
  try {
    if (Capacitor.isNativePlatform()) {
      await Clipboard.write({ string: text })
      return true
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)
      return successful
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}
