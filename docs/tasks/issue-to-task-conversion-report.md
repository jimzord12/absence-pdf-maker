# Issue to Task Conversion Report

**Date Generated:** 2026-01-03
**Mode:** Batch Conversion (All open issues without tasks)

## Summary

- **Total Open Issues Analyzed:** 8
- **Issues with Existing Tasks:** 4
- **Issues Converted to Tasks:** 4
- **New Tasks Created:** 5

## Converted Issues

| Issue ID | Task Identifier | Description | Priority |
| -------- | --------------- | ----------- | --------- |
| 014 | 064-fix-issue-014-component-naming | Rename components to distinguish form inputs from read-only summaries | Medium |
| 014 | 065-fix-issue-014-toastify-errors | Add react-toastify for user-friendly error notifications | Medium |
| 016 | 066-fix-issue-016-import-export-clear-sync | Fix form state synchronization on Clear/Import operations | High |
| 017 | 067-add-date-range-clear-button | Add clear button to Date Range Picker | Medium |
| 018 | 068-fix-issue-018-pdf-offline-generation | Fix PDF generation to work offline (Critical) | Critical |

## Skipped Issues (Already Have Tasks)

| Issue ID | Existing Task | Status |
| -------- | ------------- | ------ |
| 006 | 045-fix-issue-006-ui-fixes | Committed |
| 007 | 046-fix-issue-007-pdf-generation-failure | Committed |
| 008 | 047-fix-issue-008-update-import-export | Committed |
| 015 | 054-fix-issue-015-datepicker-styling-broken | Committed |

## Issues Requiring Manual Review

| Issue ID | Reason |
| -------- | ------ |
| 006 | Issue states "Not Completed" for text wrapping, but task 045 is marked "Committed". Verify if task fully addressed the issue. |

## Task Details

### Task 064: Component Naming (Issue 014)

**Problem:** Form sections and read-only summary sections share identical names ("Personal Details", "Leave Details"), causing confusion.

**Solution:** Rename components to add context:
- Form sections: Add "Form" or "Input" suffix
- Summary sections: Add "Summary" or "Preview" suffix

### Task 065: Toastify Error Handling (Issue 014)

**Problem:** Error messages appear as brief red box overlays instead of persistent, user-friendly notifications.

**Solution:**
- Install `react-toastify`
- Create ToastContainer in app root
- Replace red box alerts with toast.error() calls
- Create centralized error notification utility

### Task 066: Import/Export/Clear Form Sync (Issue 016)

**Problem:** Clear and Import operations update the Read-only Summary but not the form fields. Import also rejects incomplete data.

**Solution:**
- Sync React Hook Form state on Clear (use `form.reset()`)
- Sync React Hook Form state on Import (use `form.reset(importedData)`)
- Use `safeParse()` for import validation to accept partial data
- Show toast notifications for missing/invalid fields
- Write unit tests for partial data scenarios

### Task 067: Date Range Clear Button (Issue 017)

**Problem:** No way to clear selected dates in Date Range Picker; users must manually deselect dates.

**Solution:**
- Add "Clear Dates" button in LeaveDetailsSection (next to Holidays Legend)
- Reset `startDate` and `endDate` to undefined on click
- Show button only when dates are selected (context-aware UI)

### Task 068: PDF Offline Generation (Issue 018)

**Problem:** PDF generation fails offline with "Failed to fetch" error. This is critical for a PWA designed to work fully offline.

**Solution:**
- Bundle fonts locally (download to `public/fonts/`)
- Update font registration to use local paths
- Add fonts to service worker precache
- Test PDF generation offline thoroughly

## Next Steps

1. **Immediate Priority:**
   - Start with Task 068 (Critical) - PDF generation offline failure blocks core functionality

2. **High Priority:**
   - Task 066 - Import/Export/Clear form sync affects core user workflow

3. **Medium Priority:**
   - Task 064 - Component naming improves developer communication
   - Task 065 - Toastify improves user experience
   - Task 067 - Clear button improves UX

4. **Review:**
   - Verify Task 045 (Issue 006) fully completed text wrapping fix

## Implementation Commands

```bash
# Start implementation (replace with task ID)
/implement-task 068-fix-issue-018-pdf-offline-generation

# View task state
cat docs/tasks/state.json | grep 068

# Commit when done
/commit-task 068-fix-issue-018-pdf-offline-generation
```

## Dependencies

- Task 065 should be completed before Task 066 (toastify needed for partial data notifications)
- Task 064 is independent and can be done anytime
- Task 067 is independent and can be done anytime
- Task 068 is critical and should be prioritized

---

**Note:** Issue 014 was split into two separate tasks (064 and 065) because it contains two distinct, independent problems: component naming and error handling.
