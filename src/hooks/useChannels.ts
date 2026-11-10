import { useState, useEffect, useCallback } from 'react'
import type { Channel } from '../types'
import { BUILTIN_CHANNELS } from '../config/channels'
import { getCustomChannels, saveCustomChannels } from '../services/storage'

export function useChannels() {
  const [customChannels, setCustomChannels] = useState<Channel[]>([])
  const [activeChannelId, setActiveChannelId] = useState<string>('top')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomChannels().then((saved) => {
      setCustomChannels(saved)
      setLoading(false)
    })
  }, [])

  const allChannels = [...BUILTIN_CHANNELS, ...customChannels]

  const activeChannel = allChannels.find((c) => c.id === activeChannelId) || BUILTIN_CHANNELS[0]

  const addCustomChannel = useCallback(async (newChannel: Omit<Channel, 'isCustom'>) => {
    const channel: Channel = {
      ...newChannel,
      isCustom: true,
      id: newChannel.id || `custom-${Date.now()}`,
    }
    const updated = [...customChannels, channel]
    setCustomChannels(updated)
    await saveCustomChannels(updated)
    setActiveChannelId(channel.id)
  }, [customChannels])

  const removeCustomChannel = useCallback(async (channelId: string) => {
    const updated = customChannels.filter((c) => c.id !== channelId)
    setCustomChannels(updated)
    await saveCustomChannels(updated)
    if (activeChannelId === channelId) {
      setActiveChannelId('top')
    }
  }, [customChannels, activeChannelId])

  return {
    allChannels,
    customChannels,
    activeChannel,
    activeChannelId,
    setActiveChannelId,
    addCustomChannel,
    removeCustomChannel,
    loading,
  }
}
