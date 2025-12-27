/**
 * PwaProvider - Provider for PWA functionality
 *
 * Currently a minimal wrapper since the usePwaInstall hook handles
 * all PWA-specific logic (install prompts, event listeners).
 *
 * This provider can be extended in the future to:
 * - Add PWA-specific context for state management
 * - Handle service worker updates globally
 * - Manage offline status across the app
 */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

