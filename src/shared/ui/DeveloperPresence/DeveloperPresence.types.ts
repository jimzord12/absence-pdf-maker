export type DeveloperPresenceSize = 'sm' | 'md' | 'lg';

export interface DeveloperPresenceProps {
  /** URL of the developer's profile avatar image */
  avatarUrl: string;
  /** Developer's name (defaults to "Dimitrios Stamatakis") */
  name?: string;
  /** GitHub repository URL (defaults to the project repo) */
  githubUrl?: string;
  /** Size of the component (sm, md, lg) */
  size?: DeveloperPresenceSize;
  /** Additional Tailwind CSS classes */
  className?: string;
  /** Optional aria-label for accessibility */
  ariaLabel?: string;
}
