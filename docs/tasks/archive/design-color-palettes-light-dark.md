# design-color-palettes-light-dark

**Priority:** high
**Blocks:** none
**Blocked By:** upgrade-tailwind-v3-to-v4
**Issue:** N/A

---

## Description

Design and implement color palettes for light and dark themes using CSS variables and Tailwind CSS v4 @theme directive. Generate complete color scales from approved base colors and ensure WCAG AA accessibility compliance.

**Note:** Base colors are already approved and finalized. No design review step required.

## Constraints

- Must work with Tailwind CSS v4 CSS-first configuration (CSS variables, @theme directive)
- Must preserve semantic color naming (primary, secondary, error, success, warning, info, holiday, border, surface, background, text)
- Must generate accessible contrast ratios for text and background combinations (WCAG AA minimum 4.5:1)
- Must support both light and dark themes with data-theme attribute switching
- Must use approved base colors (no changes)
- Color scales must be generated using automated tools (not manual)
- PDF templates remain light mode only (no changes needed)

## Acceptance Criteria

- Light theme palette generated from approved base colors #1191D0 and #deeeff
- Dark theme palette generated from approved base colors #412B6B and #F25912
- Complete 13-step color scales created (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950) for all semantic colors
- Color variables defined in @theme block with CSS variable mapping
- Light theme variables defined in :root selector
- Dark theme variables defined in [data-theme='dark'] selector
- All critical text/background combinations validated for WCAG AA compliance (4.5:1 minimum)
- Error (red), Success (green), Warning (yellow), Info (blue) semantic colors created
- Holiday color palette created
- Border colors (light, dark) created for both themes
- Surface and background colors defined for both themes
- Text colors (primary, secondary, muted, inverse) defined for both themes
- Transition classes added for smooth theme switching
- CSS variables follow semantic naming convention
- No magic numbers in color values (all via CSS variables)

## Notes

### Approved Base Colors

**Light Theme:**
- Primary: `#1191D0` (Vibrant Blue)
- Secondary: `#deeeff` (Light Blue/White)

**Dark Theme:**
- Primary: `#412B6B` (Deep Purple)
- Secondary: `#F25912` (Burnt Orange)

These colors are **final and approved**. No changes needed.

### Color Scale Generation (Explained)

**What is a Color Scale?**

A color scale is a set of progressively lighter and darker variants of a base color, arranged from very light (50) to very dark (950). Tailwind uses a 13-step scale:

```
50:   Very light version (backgrounds, subtle accents)
100:  Light version (hover states, subtle borders)
200:  Light version
300:  Light version
400:  Mid-light version (active states)
500:  Mid version (often the base color)
600:  Mid-dark version (the actual base color)
700:  Dark version
800:  Dark version
900:  Very dark version (text, deep backgrounds)
950:  Deepest dark version
```

**Example Scale for #1191D0 (Primary Light):**
```
50:   #E3EDFF  (very light blue)
100:  #C7DAF9
200:  #ABC7F2
300:  #8FB4EB
400:  #73A1E4
500:  #5790DD  (mid blue)
600:  #1191D0  (base color - primary)
700:  #0E74A8
800:  #0B5780
900:  #083A58
950:  #051C30  (very dark blue)
```

**Why Generate Scales?**

1. **Consistency**: All shades are mathematically related, creating harmonious palettes
2. **Flexibility**: You can use `bg-primary-200` for backgrounds, `text-primary-900` for text
3. **Accessibility**: Ensures proper contrast ratios between adjacent shades
4. **Tailwind Standard**: Follows Tailwind's design system

### How to Generate Color Scales

**Recommended Tool (with FREE API):**

**uicolors.app** - https://uicolors.app/api

**API Endpoint:**
```
GET https://uicolors.app/api?hex=HEX_CODE
```

**Example Request:**
```bash
curl https://uicolors.app/api?hex=1191D0
```

**Response Format:**
```json
{
  "name": "Auto-generated name (ignore this)",
  "shades": [
    { "name": "50", "hexcode": "#E3EDFF", "hsl": {...} },
    { "name": "100", "hexcode": "#C7DAF9", "hsl": {...} },
    { "name": "200", "hexcode": "#ABC7F2", "hsl": {...} },
    { "name": "300", "hexcode": "#8FB4EB", "hsl": {...} },
    { "name": "400", "hexcode": "#73A1E4", "hsl": {...} },
    { "name": "500", "hexcode": "#5790DD", "hsl": {...} },
    { "name": "600", "hexcode": "#1191D0", "hsl": {...} },  // ← BASE COLOR
    { "name": "700", "hexcode": "#0E74A8", "hsl": {...} },
    { "name": "800", "hexcode": "#0B5780", "hsl": {...} },
    { "name": "900", "hexcode": "#083A58", "hsl": {...} },
    { "name": "950", "hexcode": "#051C30", "hsl": {...} }
  ]
}
```

**What to Copy:**
- Use the `hexcode` values from each shade
- Ignore the `name` field (it's auto-generated)
- Ignore the `hsl` field (Tailwind v4 uses CSS variables directly)

**Example Implementation:**
```typescript
// Script or manual fetch
const response = await fetch('https://uicolors.app/api?hex=1191D0');
const data = await response.json();

// Extract hexcode values
const primary50 = data.shades[0].hexcode;  // #E3EDFF
const primary100 = data.shades[1].hexcode; // #C7DAF9
// ... continue for all 13 shades
```

**Alternative Tools (if API is down):**

1. **tailwindcolor.com** - https://tailwindcolor.com/
   - Manual website, no API
   - Enter base color (hex)
   - Generates full 50-950 scale
   - Copy CSS variables manually

2. **Coolors** - https://coolors.co/
   - Interactive palette generator
   - Export to Tailwind format

**Workflow (Using API):**

```bash
# 1. Fetch all color scales via API
curl https://uicolors.app/api?hex=1191D0 > primary-light-scale.json
curl https://uicolors.app/api?hex=deeeff > secondary-light-scale.json
curl https://uicolors.app/api?hex=412B6B > primary-dark-scale.json
curl https://uicolors.app/api?hex=F25912 > secondary-dark-scale.json
curl https://uicolors.app/api?hex=DC2626 > error-scale.json
curl https://uicolors.app/api?hex=16A34A > success-scale.json
curl https://uicolors.app/api?hex=B45309 > warning-scale.json
curl https://uicolors.app/api?hex=2563EB > info-scale.json

# 2. Extract hexcode values and create CSS variables
# 3. Paste into src/index.css @layer base section
```

**Alternative Manual Workflow (if API fails):**

1. Go to https://tailwindcolor.com/
2. Enter base color: `1191D0` (for light theme primary)
3. Review generated scale
4. Copy CSS variables manually
5. Paste into `src/index.css` @layer base section

**Base Colors to Generate:**
- Light primary: `1191D0`
- Light secondary: `deeeff`
- Dark primary: `412B6B`
- Dark secondary: `F25912`
- Error: `DC2626` (standard red)
- Success: `16A34A` (standard green)
- Warning: `B45309` (standard amber)
- Info: `2563EB` (standard blue)

### Semantic Color Mappings

**Light Theme Semantic Colors:**

| Semantic | Base | Scale | Usage |
|---------|-------|--------|-------|
| `primary` | 1191D0-600 | Main actions, links, branding |
| `primary-hover` | 1191D0-700 | Interactive states |
| `primary-light` | 1191D0-400 | Subtle highlights |
| `secondary` | deeeff-200 | Secondary actions, accents |
| `secondary-hover` | deeeff-300 | Interactive states |
| `secondary-light` | deeeff-100 | Subtle highlights |
| `background` | deeeff-50 | Page backgrounds |
| `background-alt` | deeeff-100 | Card backgrounds, alternate |
| `surface` | #FFFFFF | Component surfaces, modals |
| `surface-hover` | #F0F6FF | Interactive surfaces |
| `text-primary` | #0F172A | Primary text content |
| `text-secondary` | #64748B | Secondary text, labels |
| `text-muted` | #94A3B8 | Disabled text, hints |
| `text-inverse` | #FFFFFF | Text on colored backgrounds |
| `error` | DC2626-600 | Errors, destructive actions |
| `error-bg` | DC2626-50 | Error backgrounds |
| `success` | 16A34A-600 | Success messages |
| `success-bg` | 16A34A-50 | Success backgrounds |
| `warning` | B45309-600 | Warnings |
| `warning-bg` | B45309-50 | Warning backgrounds |
| `info` | 2563EB-600 | Information |
| `info-bg` | 2563EB-50 | Info backgrounds |
| `holiday-bg` | FEE2E2-50 | Holiday highlights |
| `holiday-text` | B91C1C-700 | Holiday text |
| `border` | Gray-scale | Borders, dividers |
| `border-light` | Gray-100 | Light borders |
| `border-dark` | Gray-200 | Dark borders |

**Dark Theme Semantic Colors:**

| Semantic | Base | Scale | Usage |
|---------|-------|--------|-------|
| `primary` | 412B6B-600 | Main actions, branding |
| `primary-hover` | 412B6B-700 | Interactive states |
| `primary-light` | 412B6B-400 | Subtle highlights |
| `secondary` | F25912-600 | Secondary actions, accents |
| `secondary-hover` | F25912-700 | Interactive states |
| `secondary-light` | F25912-400 | Subtle highlights |
| `background` | 412B6B-950 | Page backgrounds |
| `background-alt` | 412B6B-900 | Card backgrounds, alternate |
| `surface` | 412B6B-800 | Component surfaces, modals |
| `surface-hover` | 412B6B-700 | Interactive surfaces |
| `text-primary` | #DEEEFF | Primary text content |
| `text-secondary` | #94A3B8 | Secondary text, labels |
| `text-muted` | #64748B | Disabled text, hints |
| `text-inverse` | #FFFFFF | Text on colored backgrounds |
| `error` | DC2626-600 | Errors, destructive actions |
| `error-bg` | DC2626-950 | Error backgrounds |
| `success` | 16A34A-600 | Success messages |
| `success-bg` | 16A34A-950 | Success backgrounds |
| `warning` | B45309-600 | Warnings |
| `warning-bg` | B45309-950 | Warning backgrounds |
| `info` | 2563EB-600 | Information |
| `info-bg` | 2563EB-950 | Info backgrounds |
| `holiday-bg` | DC2626-950 | Holiday highlights |
| `holiday-text` | FEE2E2-50 | Holiday text |
| `border` | 6C6EBB-600 | Borders, dividers |
| `border-light` | 8F93D1-700 | Light borders |
| `border-dark` | 494AA5-800 | Dark borders |

### Standard Semantic Colors (Same Across Themes)

These semantic colors remain consistent across both themes:

- **Error**: `#DC2626` (red-600)
- **Error Background**: `#FEF2F2` (red-50) / `#2A0A0A` (red-950 in dark)
- **Success**: `#16A34A` (green-600)
- **Success Background**: `#F0FDF4` (green-50) / `#0A280A` (green-950 in dark)
- **Warning**: `#B45309` (amber-600)
- **Warning Background**: `#FEF3C7` (amber-50) / `#2A1500` (amber-950 in dark)
- **Info**: `#2563EB` (blue-600)
- **Info Background**: `#EFF6FF` (blue-50) / `#0A1528` (blue-950 in dark)

### Accessibility Requirements (WCAG AA)

**Contrast Ratios:**

- **Normal text** (14pt/18px+): **4.5:1 minimum**
- **Large text** (18pt+/24px+): **3:1 minimum**
- **UI components**: **3:1 minimum**

**Critical Combinations to Validate:**

1. **Light Theme:**
   - `text-primary` (#0F172A) on `background` (#FEFFFF) → Must be ≥ 4.5:1
   - `text-secondary` (#64748B) on `surface` (#FFFFFF) → Must be ≥ 4.5:1
   - `text-inverse` (#FFFFFF) on `primary` (#1191D0) → Must be ≥ 4.5:1
   - `text-inverse` (#FFFFFF) on `error` (#DC2626) → Must be ≥ 4.5:1

2. **Dark Theme:**
   - `text-primary` (#DEEEFF) on `background` (#1A1032) → Must be ≥ 4.5:1
   - `text-secondary` (#94A3B8) on `surface` (#342258) → Must be ≥ 4.5:1
   - `text-inverse` (#FFFFFF) on `primary` (#412B6B) → Must be ≥ 4.5:1
   - `text-inverse` (#FFFFFF) on `error` (#DC2626) → Must be ≥ 4.5:1

**Validation Tools:**

1. **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/
   - Enter foreground and background colors
   - Get immediate contrast ratio and WCAG rating

2. **Colour Contrast Analyser** - https://www.tpgi.com/color-contrast-checker/
   - Desktop application for comprehensive testing

3. **Chrome DevTools**:
   - Open DevTools → Accessibility tab
   - Select element to see contrast ratio

**Workflow:**

1. Generate all color scales using automated tool (tailwindcolor.com)
2. For each semantic color combination:
   - Test with WebAIM Contrast Checker
   - Verify WCAG AA compliance (≥ 4.5:1)
3. If any combination fails:
   - Adjust color scale (use darker/lighter variant)
   - Re-test
4. Document all contrast ratios for reference

### Tailwind CSS v4 Implementation Pattern

**Structure in `src/index.css`:**

```css
@import "tailwindcss";

@theme {
  /* Map semantic colors to CSS variables */
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-light: var(--primary-light);
  --color-secondary: var(--secondary);
  --color-secondary-hover: var(--secondary-hover);
  --color-secondary-light: var(--secondary-light);
  --color-background: var(--background);
  --color-background-alt: var(--background-alt);
  --color-surface: var(--surface);
  --color-surface-hover: var(--surface-hover);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-text-inverse: var(--text-inverse);
  --color-error: var(--error);
  --color-error-bg: var(--error-bg);
  --color-success: var(--success);
  --color-success-bg: var(--success-bg);
  --color-warning: var(--warning);
  --color-warning-bg: var(--warning-bg);
  --color-info: var(--info);
  --color-info-bg: var(--info-bg);
  --color-holiday-bg: var(--holiday-bg);
  --color-holiday-text: var(--holiday-text);
  --color-border: var(--border);
  --color-border-light: var(--border-light);
  --color-border-dark: var(--border-dark);

  /* Full color scales for utility classes */
  --color-primary-50: var(--primary-50);
  --color-primary-100: var(--primary-100);
  --color-primary-200: var(--primary-200);
  --color-primary-300: var(--primary-300);
  --color-primary-400: var(--primary-400);
  --color-primary-500: var(--primary-500);
  --color-primary-600: var(--primary-600);
  --color-primary-700: var(--primary-700);
  --color-primary-800: var(--primary-800);
  --color-primary-900: var(--primary-900);
  --color-primary-950: var(--primary-950);

  /* Repeat for secondary, error, success, warning, info, border... */
}

@layer base {
  /* Light Theme (default) */
  :root {
    /* Primary scale - #1191D0 */
    --primary-50: #E3EDFF;
    --primary-100: #C7DAF9;
    --primary-200: #ABC7F2;
    --primary-300: #8FB4EB;
    --primary-400: #73A1E4;
    --primary-500: #5790DD;
    --primary-600: #1191D0;
    --primary-700: #0E74A8;
    --primary-800: #0B5780;
    --primary-900: #083A58;
    --primary-950: #051C30;

    /* Secondary scale - #deeeff */
    --secondary-50: #FEFFFF;
    --secondary-100: #FCFCFF;
    --secondary-200: #F0F6FF;
    --secondary-300: #E1E7FF;
    --secondary-400: #D2D8FF;
    --secondary-500: #C3C9FF;
    --secondary-600: #deeeff;
    --secondary-700: #B2B8E8;
    --secondary-800: #8F93D1;
    --secondary-900: #6C6EBB;
    --secondary-950: #494AA5;

    /* Semantic mappings for light theme */
    --primary: #1191D0;
    --primary-hover: #0E74A8;
    --primary-light: #73A1E4;
    --secondary: #C3C9FF;
    --secondary-hover: #B2B8E8;
    --secondary-light: #E1E7FF;
    --background: #FEFFFF;
    --background-alt: #FCFCFF;
    --surface: #FFFFFF;
    --surface-hover: #F0F6FF;
    --text-primary: #0F172A;
    --text-secondary: #64748B;
    --text-muted: #94A3B8;
    --text-inverse: #FFFFFF;
    --error: #DC2626;
    --error-bg: #FEF2F2;
    --success: #16A34A;
    --success-bg: #F0FDF4;
    --warning: #B45309;
    --warning-bg: #FEF3C7;
    --info: #2563EB;
    --info-bg: #EFF6FF;
    --holiday-bg: #FEE2E2;
    --holiday-text: #B91C1C;
    --border: #E2E8F0;
    --border-light: #F1F5F9;
    --border-dark: #CBD5E1;
  }

  /* Dark Theme */
  [data-theme='dark'] {
    /* Primary scale - #412B6B */
    --primary-50: #F4E8F9;
    --primary-100: #EAD3F4;
    --primary-200: #E0BF0EF;
    --primary-300: #D6ABEA;
    --primary-400: #CC96E5;
    --primary-500: #C281E1;
    --primary-600: #412B6B;
    --primary-700: #342258;
    --primary-800: #271945;
    --primary-900: #1A1032;
    --primary-950: #0D071F;

    /* Secondary scale - #F25912 */
    --secondary-50: #FFF5ED;
    --secondary-100: #FFE7DB;
    --secondary-200: #FFD9C9;
    --secondary-300: #FFCBB7;
    --secondary-400: #FFBDA5;
    --secondary-500: #FFAF93;
    --secondary-600: #F25912;
    --secondary-700: #C2460E;
    --secondary-800: #92340A;
    --secondary-900: #622606;
    --secondary-950: #311703;

    /* Semantic mappings for dark theme */
    --primary: #412B6B;
    --primary-hover: #342258;
    --primary-light: #CC96E5;
    --secondary: #F25912;
    --secondary-hover: #C2460E;
    --secondary-light: #FFBDA5;
    --background: #1A1032;
    --background-alt: #271945;
    --surface: #342258;
    --surface-hover: #412B6B;
    --text-primary: #DEEEFF;
    --text-secondary: #94A3B8;
    --text-muted: #64748B;
    --text-inverse: #FFFFFF;
    --error: #DC2626;
    --error-bg: #2A0A0A;
    --success: #16A34A;
    --success-bg: #0A280A;
    --warning: #B45309;
    --warning-bg: #2A1500;
    --info: #2563EB;
    --info-bg: #0A1528;
    --holiday-bg: #2A0A0A;
    --holiday-text: #FEE2E2;
    --border: #6C6EBB;
    --border-light: #8F93D1;
    --border-dark: #494AA5;
  }

  /* Smooth transitions for theme switching */
  *,
  *::before,
  *::after {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
  }

  /* Respect user's motion preferences for accessibility */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition-duration: 0ms !important;
      transition-delay: 0ms !important;
    }
  }
}
```

### Implementation Steps

1. **Generate Color Scales**
   - Fetch from uicolors.app API for each base color:
     ```bash
     # Light theme
     curl https://uicolors.app/api?hex=1191D0 > primary-light.json
     curl https://uicolors.app/api?hex=deeeff > secondary-light.json

     # Dark theme
     curl https://uicolors.app/api?hex=412B6B > primary-dark.json
     curl https://uicolors.app/api?hex=F25912 > secondary-dark.json

     # Semantic colors (same for both themes)
     curl https://uicolors.app/api?hex=DC2626 > error.json
     curl https://uicolors.app/api?hex=16A34A > success.json
     curl https://uicolors.app/api?hex=B45309 > warning.json
     curl https://uicolors.app/api?hex=2563EB > info.json
     ```
   - Extract `hexcode` values from each JSON response
   - Copy all generated CSS variables into `src/index.css`

2. **Validate Accessibility**
   - Test all critical text/background combinations with WebAIM
   - Ensure WCAG AA compliance (≥ 4.5:1)
   - Adjust scales if needed

3. **Implement in CSS**
   - Add @theme block with semantic variable mappings
   - Add :root selector with light theme variables
   - Add [data-theme='dark'] selector with dark theme variables
   - Add transition classes for smooth theme switching
   - Add prefers-reduced-motion media query

4. **Test in Application**
   - Verify all UI components render correctly in light mode
   - Manually test dark mode by setting data-theme attribute
   - Check contrast ratios in browser DevTools
   - Run visual regression tests (after theme toggle implementation)

5. **Document**
   - Document color palette structure in task notes
   - Create usage examples (see Usage Example below)

### Usage Example in React Components

```tsx
export default function MyComponent() {
  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors">
      <header className="bg-surface border-b border-border">
        <h1 className="text-primary">Welcome</h1>
        <p className="text-text-secondary">Subtitle text</p>
      </header>

      <main className="p-6">
        <button className="bg-primary hover:bg-primary-hover text-text-inverse px-4 py-2 rounded">
          Primary Action
        </button>

        <button className="bg-secondary hover:bg-secondary-hover text-text-inverse px-4 py-2 rounded">
          Secondary Action
        </button>

        <div className="mt-4 bg-error-bg text-error p-4 rounded border border-error">
          Error message
        </div>

        <div className="mt-4 bg-success-bg text-success p-4 rounded border border-success">
          Success message
        </div>

        <div className="mt-4 bg-holiday-bg text-holiday-text p-4 rounded">
          Holiday highlight
        </div>
      </main>
    </div>
  );
}
```

### Dark Mode Usage

```tsx
export default function MyComponent() {
  // Dark mode is applied via data-theme attribute on <html>
  // Components use dark: variants automatically

  return (
    <div className="bg-white dark:bg-surface-800 text-slate-900 dark:text-slate-100">
      <h1 className="text-primary dark:text-surface-200">
        This text changes color based on theme
      </h1>
      <button className="bg-primary dark:bg-primary-700 hover:bg-primary-hover dark:hover:bg-primary-600">
        Button with dark mode
      </button>
    </div>
  );
}
```

### Tools & Resources

**Color Generation:**
- https://tailwindcolor.com/ (Recommended)
- https://uicolors.app/
- https://coolors.co/

**Accessibility:**
- https://webaim.org/resources/contrastchecker/ (Recommended)
- https://www.tpgi.com/color-contrast-checker/
- Chrome DevTools: Accessibility Inspector

**Tailwind v4 Resources:**
- https://tailwindcss.com/docs/theme
- https://tailwindcss.com/docs/upgrade-guide

### Validation Checklist

Before marking task complete:

- [ ] All color scales generated using tailwindcolor.com (automated tool)
- [ ] All critical combinations validated with WebAIM (≥ 4.5:1)
- [ ] Light theme variables defined in :root
- [ ] Dark theme variables defined in [data-theme='dark']
- [ ] @theme block maps all semantic colors to CSS variables
- [ ] Transitions added for smooth theme switching
- [ ] Reduced motion preference respected
- [ ] No magic numbers (all via CSS variables)
- [ ] CSS compiles without errors
- [ ] Visual inspection shows both themes render correctly
