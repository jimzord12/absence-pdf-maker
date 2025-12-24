/**
 * StoreProvider is a wrapper component for store-related providers.
 *
 * Currently a passthrough component, it can be extended to:
 * - Handle SSR hydration when needed
 * - Add context providers for store access
 * - Manage store initialization logic
 *
 * For this Vite-only app, Zustand's persist middleware handles
 * client-side hydration automatically.
 */
export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
