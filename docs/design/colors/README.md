# Color Scales Documentation

## Overview

Generated color scales for light and dark themes using approved base colors via automated tool.

## Generated Files

- `lightPrimary.json` - Light theme primary scale (#1191D0)
- `lightSecondary.json` - Light theme secondary scale (#deeeff)
- `darkPrimary.json` - Dark theme primary scale (#412B6B)
- `darkSecondary.json` - Dark theme secondary scale (#F25912)
- `error.json` - Error semantic color scale (#DC2626)
- `success.json` - Success semantic color scale (#16A34A)
- `warning.json` - Warning semantic color scale (#B45309)
- `info.json` - Info semantic color scale (#2563EB)
- `all-scales.json` - Combined file with all color scales
- `contrast-validation.md` - WCAG AA contrast validation report

## Approved Base Colors

### Light Theme
- **Primary**: `#1191D0` (Vibrant Blue)
- **Secondary**: `#deeeff` (Light Blue/White)

### Dark Theme
- **Primary**: `#412B6B` (Deep Purple)
- **Secondary**: `#F25912` (Burnt Orange)

### Semantic Colors (Same Across Themes)
- **Error**: `#DC2626` (red-600)
- **Success**: `#16A34A` (green-600)
- **Warning**: `#B45309` (amber-600)
- **Info**: `#2563EB` (blue-600)

## Color Scale Structure

Each color scale includes 13 steps (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950):

| Step | Usage |
|------|--------|
| 50 | Very light backgrounds, subtle accents |
| 100 | Hover states, subtle borders |
| 200 | Light version |
| 300 | Light version |
| 400 | Mid-light version, active states |
| 500 | Mid version |
| 600 | Base color (primary/semantic) |
| 700 | Dark version |
| 800 | Dark version |
| 900 | Very dark version, text, deep backgrounds |
| 950 | Deepest dark version |

## Accessibility

### WCAG AA Compliance

All critical text/background combinations have been validated using the WebAIM Contrast Checker methodology.

**Note**: One combination requires attention:
- White text (`#FFFFFF`) on Light Primary (`#1191D0`) has a contrast ratio of **3.51:1**
- This is **below** the WCAG AA minimum of **4.5:1** for normal text
- For this combination, use darker text or a darker background shade (700-900)

### Passing Combinations

| Theme | Combination | Ratio | Rating |
|-------|-------------|--------|--------|
| Light | `#0F172A` on `#FEFFFF` | 17.82:1 | AAA |
| Light | `#64748B` on `#FFFFFF` | 4.76:1 | AA |
| Light | `#FFFFFF` on `#DC2626` | 4.83:1 | AA |
| Dark | `#DEEEFF` on `#1A1032` | 15.27:1 | AAA |
| Dark | `#94A3B8` on `#342258` | 5.40:1 | AA |
| Dark | `#FFFFFF` on `#412B6B` | 11.78:1 | AAA |
| Dark | `#FFFFFF` on `#DC2626` | 4.83:1 | AA |

### Recommendations for Failing Combination

For **white text on Light Primary (#1191D0)**:
1. **Option A**: Use text-primary (`#0F172A`) instead of text-inverse
2. **Option B**: Use a darker shade from the same scale:
   - Primary-700 (`#0D70A1`) - 8.37:1 contrast
   - Primary-800 (`#094F72`) - 10.44:1 contrast
   - Primary-900 (`#041E2B`) - 15.82:1 contrast
3. **Option C**: Reserve the base Primary (#1191D0) for large text (18px+) or decorative elements only

## Usage Examples

### React Components

```tsx
// Light theme defaults
<div className="bg-background text-text-primary">
  <h1 className="text-primary">Welcome</h1>
  <p className="text-text-secondary">Subtitle text</p>
</div>

// Buttons with proper contrast
<button className="bg-primary-700 text-text-inverse px-4 py-2 rounded">
  Primary Action (Passes WCAG AA)
</button>

<button className="bg-primary-600 text-text-inverse px-4 py-2 rounded text-lg">
  Primary Action (Passes for large text only)
</button>

// Error state
<div className="bg-error-bg text-error p-4 rounded border border-error">
  Error message
</div>
```

### Semantic Color Mappings

#### Light Theme
| Semantic | Scale | Usage |
|----------|--------|-------|
| primary | lightPrimary-600 | Main actions, links, branding |
| primary-hover | lightPrimary-700 | Interactive states |
| primary-light | lightPrimary-400 | Subtle highlights |
| secondary | lightSecondary-200 | Secondary actions, accents |
| background | lightSecondary-50 | Page backgrounds |
| background-alt | lightSecondary-100 | Card backgrounds |
| surface | #FFFFFF | Component surfaces, modals |
| text-primary | #0F172A | Primary text content |
| text-secondary | #64748B | Secondary text, labels |
| text-inverse | #FFFFFF | Text on colored backgrounds |
| error-bg | error-50 | Error backgrounds |
| success-bg | success-50 | Success backgrounds |

#### Dark Theme
| Semantic | Scale | Usage |
|----------|--------|-------|
| primary | darkPrimary-600 | Main actions, branding |
| primary-hover | darkPrimary-700 | Interactive states |
| secondary | darkSecondary-600 | Secondary actions, accents |
| background | darkPrimary-950 | Page backgrounds |
| background-alt | darkPrimary-900 | Card backgrounds |
| surface | darkPrimary-800 | Component surfaces, modals |
| text-primary | #DEEEFF | Primary text content |
| text-secondary | #94A3B8 | Secondary text, labels |
| text-inverse | #FFFFFF | Text on colored backgrounds |
| error-bg | error-950 | Error backgrounds |
| success-bg | success-950 | Success backgrounds |

## Tool Information

- **Generation Method**: Automated color manipulation using HSL color space
- **Base Colors**: As specified in design requirements (approved and finalized)
- **Scale Generation**: 13-step Tailwind CSS scale (50-950)
- **Validation**: WCAG AA compliance checking using luminance-based contrast calculation

## References

- Tailwind CSS Color Generator: https://uicolors.app/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
