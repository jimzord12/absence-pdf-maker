# Issue 015: DateRangeField Calendar Layout Broken

## Status: Closed ✅

## Priority: Critical (Resolved)

## Component: `src/features/leave-request/ui/DateRangeField.tsx`

---

## Problem Summary

The calendar date picker displays days **vertically in a single column** instead of the expected **7-column weekly grid**. The month/year dropdowns work, but the actual calendar grid is completely broken.

![Calendar showing days stacked vertically instead of in a grid]

---

## Root Cause

### Version Mismatch: react-day-picker v8 API used on v9

The project uses **react-day-picker v9.13.0** (per `package.json`), but the styling code in `DateRangeField.tsx` uses the **v8 API** for the `styles` prop.

#### What Changed Between v8 and v9

| Aspect              | v8 API                                  | v9 API                                          |
| ------------------- | --------------------------------------- | ----------------------------------------------- |
| CSS class structure | `row`, `cell`, `head_row`, `head_cell`  | `week`, `day`, `weekdays`, `weekday`            |
| Styling approach    | Inline `styles` prop with specific keys | `classNames` prop or CSS import                 |
| Component structure | Table-based layout                      | Modern flexbox/grid layout                      |
| Default styling     | Optional import                         | Required: `import "react-day-picker/style.css"` |

#### The Problematic Code (Lines 39-110)

```tsx
const DAY_PICKER_STYLES = {
  root: { display: 'flex', flexDirection: 'column' } as const,
  months: { display: 'flex', gap: '1rem', flexWrap: 'wrap' } as const,
  month: { display: 'flex', flexDirection: 'column', gap: '0.5rem' } as const,
  table: { borderCollapse: 'collapse', width: '100%' } as const,
  head_row: { display: 'flex', justifyContent: 'space-between' } as const,  // ❌ v8 API
  head_cell: { ... } as const,  // ❌ v8 API
  row: { display: 'flex', justifyContent: 'space-between' } as const,       // ❌ v8 API
  cell: { ... } as const,       // ❌ v8 API
  day: { ... } as const,
  // ... more v8 properties
};
```

These property names (`row`, `cell`, `head_row`, `head_cell`, `table`, `tbody`, etc.) **do not exist in v9**. When passed to the `styles` prop, they are silently ignored, leaving the calendar with no grid layout.

---

## Visual Evidence

### Current (Broken) State

- Days 1-31 displayed in a single vertical column
- Week headers (Δε, Τρ, Τε, Πέ, Πα, Σά, Κυ) not aligned with days
- Navigation buttons work but calendar is unusable
- Two months shown side-by-side, both broken

### Expected State

- 7-column grid (Mon-Sun)
- 5-6 rows per month
- Proper alignment of headers with day columns
- Holiday highlighting visible (yellow background)
- Weekend styling visible (gray background)

---

## Solution Options

### Option A: Use Default CSS (Recommended - Minimal Changes)

**Step 1:** Import the default react-day-picker v9 styles

```tsx
// At the top of DateRangeField.tsx or in a parent component
import 'react-day-picker/style.css';
```

**Step 2:** Remove or simplify `DAY_PICKER_STYLES`

```tsx
// Remove the entire DAY_PICKER_STYLES object (lines 39-110)
// Remove the styles prop from DayPicker component
```

**Step 3:** Keep only `modifiersStyles` for custom holiday/weekend colors

```tsx
const MODIFIERS_STYLES = {
  holiday: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontWeight: 'bold' as const,
  },
  weekend: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
} as const;
```

**Step 4:** Update DayPicker usage

```tsx
<DayPicker
  mode="range"
  selected={selectedRange}
  onSelect={handleSelect}
  modifiers={modifiers}
  modifiersStyles={modifiersStyles}
  numberOfMonths={2}
  captionLayout="dropdown"
  locale={locale === 'gr' ? el : undefined}
  // Remove: styles={DAY_PICKER_STYLES as any}
/>
```

### Option B: Use Tailwind CSS Classes (More Control)

If you need custom styling beyond the defaults, use the `classNames` prop with Tailwind:

```tsx
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import 'react-day-picker/style.css';

const defaultClassNames = getDefaultClassNames();

<DayPicker
  classNames={{
    root: `${defaultClassNames.root} shadow-lg`,
    day: `${defaultClassNames.day} hover:bg-blue-100`,
    selected: 'bg-blue-600 text-white font-bold',
    today: 'border-2 border-blue-600',
    // ... other customizations
  }}
/>;
```

### Option C: Full Custom CSS (Most Work)

Create a custom CSS file with v9-compatible class names:

```css
/* styles/day-picker.css */
.rdp-root {
  /* root styles */
}
.rdp-month {
  /* month container */
}
.rdp-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.rdp-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
/* ... etc */
```

---

## Additional Issues to Fix

### 1. Console Logs in Production

**Location:** Lines 270, 287

```tsx
console.log('[DateRangeField] handleSelect called with:', range);
console.log('[DateRangeField] Setting dates via setValue:', {
  startDate: startDateValue,
  endDate: endDateValue,
});
```

**Fix:** Wrap in development check per AGENTS.md:

```tsx
if (import.meta.env.DEV) {
  console.log('[DateRangeField] handleSelect called with:', range);
}
```

### 2. Type Assertions with `as any`

**Location:** Lines 271, 275, 290, 291

```tsx
setValue('startDate', undefined as any, { shouldDirty: true, shouldValidate: false });
```

**Root Cause:** The form type (`LeaveRequest`) probably has `startDate: Date` but we're setting `undefined`.

**Fix:** Update the type definition to allow `undefined`:

```tsx
// In leaveRequest.types.ts or schema
interface LeaveRequest {
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  // ...
}
```

### 3. Unnecessary useMemo

**Location:** Line 220

```tsx
const modifiersStyles = useMemo(() => MODIFIERS_STYLES, []);
```

**Fix:** Since `MODIFIERS_STYLES` is a constant outside the component, this provides no benefit:

```tsx
// Just use directly
modifiersStyles = { MODIFIERS_STYLES };
```

---

## Resolution

**Status:** Fixed and Closed
**Date:** 2026-01-01
**Task:** 054-fix-issue-015-datepicker-styling-broken

### What Was Done

Successfully migrated the DateRangeField component from react-day-picker v8 API to v9 API. The calendar now displays correctly with a proper 7-column weekly grid layout instead of days stacked vertically in a single column.

### Changes Implemented

1. **Added v9 CSS Import**
   ```tsx
   import 'react-day-picker/style.css';
   ```
   - Provides default grid layout styles for react-day-picker v9
   - Automatically creates 7-column weekly grid structure

2. **Removed v8 `DAY_PICKER_STYLES` Object**
   - Deleted entire 80+ line object containing v8-specific properties:
     - `row`, `cell`, `head_row`, `head_cell`, `table`, `tbody`
     - All other v8 table-based layout properties
   - These properties don't exist in v9 and were silently ignored

3. **Removed `styles` Prop from DayPicker**
   - Previously: `styles={DAY_PICKER_STYLES as any}`
   - Now: Removed entirely (relying on CSS import)

4. **Kept `modifiersStyles` for Custom Highlighting**
   - Preserved `MODIFIERS_STYLES` constant for holiday/weekend styling
   - Holidays: Yellow background (#fef3c7) with brown text (#92400e)
   - Weekends: Gray background (#f3f4f6)
   - Removed unnecessary `useMemo` wrapper

5. **Wrapped Console Logs in DEV Check**
   ```tsx
   if (import.meta.env.DEV) {
     console.log('[DateRangeField] ...');
   }
   ```
   - Prevents console output in production builds

6. **Removed Type Assertions**
   - Removed `as any` type assertions from `setValue` calls
   - Schema already allows optional dates (`z.date().optional()`)

7. **Fixed React Hooks Ordering**
   - Moved early return for empty form context after all hooks
   - Prevents "React Hooks must be called in exact same order" error

### Verification

- ✅ Calendar displays in proper 7-column weekly grid layout
- ✅ Week headers (Δε, Τρ, Τε, Πέ, Πα, Σά, Κυ) aligned with day columns
- ✅ Holidays highlighted with yellow background and brown text
- ✅ Weekend days highlighted with gray background
- ✅ Two months display side-by-side with proper layout
- ✅ Month/year dropdowns work correctly
- ✅ Date range selection works
- ✅ Locale switching (Greek/English) works
- ✅ All 43 tests pass for DateRangeField
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ No console errors in production

### Code Review

**Status:** PASS

The implementation successfully upgrades the DateRangeField component to react-day-picker v9 API. The code is clean, well-typed, and follows all React and TypeScript best practices.

---

## Migration Checklist

- [x] Import `react-day-picker/style.css` in the app
- [x] Remove `DAY_PICKER_STYLES` object
- [x] Remove `styles` prop from DayPicker
- [x] Keep `modifiersStyles` for holiday/weekend highlighting
- [x] Wrap console.log statements in `import.meta.env.DEV`
- [x] Fix TypeScript types to allow `undefined` dates
- [x] Remove unnecessary `useMemo` for `modifiersStyles`
- [x] Test calendar displays in 7-column grid
- [x] Test holiday highlighting works
- [x] Test weekend highlighting works
- [x] Test date range selection works
- [x] Test locale switching (Greek/English)

---

## References

- [react-day-picker v9 Styling Guide](https://daypicker.dev/docs/styling)
- [react-day-picker v9 Migration Guide](https://daypicker.dev/docs/upgrading)
- [react-day-picker v9 Custom Modifiers](https://daypicker.dev/docs/custom-modifiers)
- [Project AGENTS.md Guidelines](../../../AGENTS.md)

---

## Related Files

- `src/features/leave-request/ui/DateRangeField.tsx` - Main component
- `src/features/leave-request/model/leaveRequest.types.ts` - Type definitions
- `src/features/leave-request/model/leaveRequest.schema.ts` - Zod schema
- `package.json` - react-day-picker version

---

_Created: 2026-01-01_
_Resolved: 2026-01-01_
