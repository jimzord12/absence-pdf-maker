import { useState, useEffect, useCallback } from 'react'
import { useLeaveRequestStore } from '../../features/leave-request/state/leaveRequest.store'

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function getSnoozeDelayHours(snoozeCount: number): number {
  const DELAY_MAP: Record<number, number> = {
    0: 24,
    1: 24 * 7,
    2: 24 * 30,
  }
  return DELAY_MAP[Math.min(snoozeCount, 2)] || 24 * 30
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  const completedPdfGenerations = useLeaveRequestStore(state => state.pwa.completedPdfGenerations)
  const dismissedPwaInstall = useLeaveRequestStore(state => state.pwa.dismissedPwaInstall)
  const pwaInstallSnoozeUntil = useLeaveRequestStore(state => state.pwa.pwaInstallSnoozeUntil)
  const pwaInstallSnoozeCount = useLeaveRequestStore(state => state.pwa.pwaInstallSnoozeCount)
  const snoozePwaInstall = useLeaveRequestStore(state => state.snoozePwaInstall)

  const canShowInstall =
    isInstallable &&
    completedPdfGenerations > 0 &&
    !dismissedPwaInstall &&
    (pwaInstallSnoozeUntil === null || new Date() >= pwaInstallSnoozeUntil)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstallable(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return 'not_supported' as const
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setIsInstallable(false)
      return outcome
    } catch (error) {
      console.error('Error during PWA install prompt:', error)
      return 'dismissed' as const
    }
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setDeferredPrompt(null)
    setIsInstallable(false)
  }, [])

  const snooze = useCallback(() => {
    const hours = getSnoozeDelayHours(pwaInstallSnoozeCount)
    dismiss()
    snoozePwaInstall(hours)
    setDeferredPrompt(null)
  }, [dismiss, pwaInstallSnoozeCount, snoozePwaInstall])

  return {
    isInstallable,
    canShowInstall,
    promptInstall,
    dismiss,
    snooze,
  }
}
