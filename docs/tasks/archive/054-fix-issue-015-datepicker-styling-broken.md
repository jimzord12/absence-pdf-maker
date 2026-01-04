# 054-fix-issue-015-datepicker-styling-broken

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** N/A

---

## Description

Fix DateRangeField calendar layout that displays days vertically in a single column instead of the expected 7-column weekly grid. The root cause is using react-day-picker v8 API styling on v9.

## Constraints

- Project uses react-day-picker v9.13.0
- Must migrate from v8 styling API to v9 styling approach
- Must import default react-day-picker v9 styles
- Must maintain holiday and weekend highlighting functionality
- Must maintain Greek/English locale support
- Follow AGENTS.md code style guidelines

## Acceptance Criteria

- [ ] Import `react-day-picker/style.css` for default v9 styles
- [ ] Remove `DAY_PICKER_STYLES` object (v8 API properties like `row`, `cell`, `head_row`, `head_cell`, `table`, `tbody`)
- [ ] Remove `styles` prop from DayPicker component
- [ ] Keep `modifiersStyles` for holiday and weekend highlighting
- [ ] Calendar displays in proper 7-column weekly grid layout
- [ ] Week headers (Δε, Τρ, Τε, Πέ, Πα, Σά, Κυ) aligned with day columns
- [ ] Holidays highlighted with yellow background (#fef3c7) and brown text (#92400e)
- [ ] Weekend days highlighted with gray background (#f3f4f6)
- [ ] Two months display side-by-side with proper layout
- [ ] Month/year dropdowns work correctly
- [ ] Date range selection works
- [ ] Locale switching (Greek/English) works
- [ ] Console.log statements wrapped in `import.meta.env.DEV` check
- [ ] TypeScript type assertions with `as any` removed or types fixed
- [ ] Unnecessary `useMemo` for `modifiersStyles` removed
- [ ] No TypeScript errors
- [ ] No console errors in production
- [ ] Calendar layout responsive on mobile and desktop
- [ ] Tests pass for DateRangeField component

## Notes

No notes.
