import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { vi } from 'vitest';
import i18n from './i18n/config';

/**
 * Render component with i18n provider for testing
 *
 * This helper wraps components with I18nextProvider to ensure
 * translations are available in tests. It uses the default i18n configuration
 * from '../i18n/config' which sets Greek as default language with English as fallback.
 *
 * @param ui - React component to render
 * @param options - Additional render options from @testing-library/react
 * @returns Render result with i18n context
 *
 * @example
 * ```tsx
 * import { renderWithI18n } from './test-utils';
 *
 * it('should render translated text', () => {
 *   renderWithI18n(<MyComponent />);
 *   expect(screen.getByText('Translated text')).toBeInTheDocument();
 * });
 * ```
 */
export function renderWithI18n(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Create a mock translation function for testing
 *
 * This helper creates a vi.fn() mock for the `t` function used by i18next.
 * It returns the translation key prefixed with "t:" for easy debugging in tests.
 * When options.message is provided, it returns "key: message" format.
 *
 * @returns Mocked t function
 *
 * @example
 * ```tsx
 * const mockT = createMockT();
 * expect(mockT('forms.personal.heading')).toBe('t:forms.personal.heading');
 *
 * // With message option
 * expect(mockT('validation.required', { message: 'This field is required' }))
 *   .toBe('validation.required: This field is required');
 * ```
 */
export function createMockT() {
  return vi.fn((key: string, options?: Record<string, unknown>) => {
    if (options?.message) {
      return `${key}: ${options.message as string}`;
    }
    return `t:${key}`;
  });
}

/**
 * Wait for i18n to finish initializing
 *
 * Useful when tests need to ensure translations are fully loaded before asserting.
 * This resolves when i18n is ready.
 *
 * @returns Promise that resolves when i18n is initialized
 */
export async function waitForI18n() {
  if (!i18n.isInitialized) {
    await new Promise<void>((resolve) => {
      i18n.on('initialized', () => resolve());
    });
  }
}

/**
 * Change i18n language for a test
 *
 * Changes the active language for i18n. Useful for testing
 * multi-language components.
 *
 * @param lang - Language code ('en' or 'gr')
 * @returns Promise that resolves when language is changed
 *
 * @example
 * ```tsx
 * await changeLanguage('en');
 * expect(screen.getByText('English text')).toBeInTheDocument();
 *
 * await changeLanguage('gr');
 * expect(screen.getByText('Ελληνικό κείμενο')).toBeInTheDocument();
 * ```
 */
export async function changeLanguage(lang: 'en' | 'gr') {
  await i18n.changeLanguage(lang);
}
