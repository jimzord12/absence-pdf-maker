# DeveloperPresence Component Usage

The DeveloperPresence component showcases the developer's presence in the app with sophisticated framer-motion animations.

## Installation

The component is already installed and available at:
```
src/shared/ui/DeveloperPresence
```

## Basic Usage

```tsx
import { DeveloperPresence } from './shared/ui';

function App() {
  return (
    <DeveloperPresence
      avatarUrl="https://github.com/jimzord12.png"
      name="Dimitrios Stamatakis"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|-------|----------|-------------|
| `avatarUrl` | `string` | Required | URL of the developer's profile avatar image |
| `name` | `string` | `"Dimitrios Stamatakis"` | Developer's name |
| `githubUrl` | `string` | `"https://github.com/jimzord12/absence-pdf-maker"` | GitHub repository URL |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the component |
| `className` | `string` | `''` | Additional Tailwind CSS classes |
| `ariaLabel` | `string` | `"Developer profile for {name}"` | ARIA label for accessibility |

## Size Options

- **sm**: 80px width/height
- **md**: 120px width/height (default)
- **lg**: 160px width/height

## Animation Behavior

1. **Initial State**: Shows round profile image with shadow and subtle rainbow gradient glow
2. **Hover**: Triggers triple flip animation sequence:
   - **Flip 1**: 0° → 180° (reveals name and GitHub icon)
   - **Flip 2**: 180° → 360° (returns to profile image)
   - **Flip 3**: 360° → 540° (ends at 180°, showing name and GitHub icon again)
3. **Tails State**: Shows indented card with:
   - Developer name (properly oriented, not mirrored)
   - Clickable GitHub icon (32px, opens in new tab)
   - Inner drop shadow effect
4. **Auto-revert**: After 1.5 seconds on Tails side, automatically flips back to Heads (profile image)
5. **Re-hover**: Cancels revert timer and restarts triple flip sequence
6. **Rainbow Glow**: Subtle rotating conic gradient continuously animates around the component (8-second loop, 30% opacity)

## Accessibility

- Keyboard navigable (Tab + Enter/Space)
- Screen reader friendly (proper ARIA labels)
- GitHub link opens in new tab with `rel="noopener noreferrer"`

## Example with All Props

```tsx
<DeveloperPresence
  avatarUrl="https://github.com/jimzord12.png"
  name="Dimitrios Stamatakis"
  githubUrl="https://github.com/jimzord12/absence-pdf-maker"
  size="lg"
  className="mt-8"
  ariaLabel="Developer profile: Dimitrios Stamatakis"
/>
```

## Current Implementation

The component is currently integrated in `src/features/leave-request/ui/pages/LeaveRequestPage.tsx` at the bottom of the page content.
