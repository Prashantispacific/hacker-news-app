import { useEffect, useRef } from 'react'

interface SwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 60 }: SwipeOptions) {
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchStartTime = useRef<number>(0)

  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      touchStartX.current = touch.clientX
      touchStartY.current = touch.clientY
      touchStartTime.current = Date.now()
    }

    function handleTouchEnd(e: TouchEvent) {
      if (e.changedTouches.length !== 1) return
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartX.current
      const deltaY = touch.clientY - touchStartY.current
      const deltaTime = Date.now() - touchStartTime.current

      // Guard: swipe took less than 450ms and horizontal distance dominated vertical distance
      if (deltaTime < 450 && Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        // Prevent accidental trigger from extreme edge (system edge navigation)
        if (touchStartX.current < 20 || touchStartX.current > window.innerWidth - 20) {
          return
        }

        if (deltaX < 0) {
          onSwipeLeft?.()
        } else {
          onSwipeRight?.()
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, threshold])
}
