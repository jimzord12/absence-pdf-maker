# 064-fix-issue-014-component-naming

**Priority:** medium
**Blocks:** none
**Blocked By:** none
**Issue:** [#014](../issues/open/014.md)

---

## Description

Rename form sections and read-only summary sections to eliminate naming confusion. Currently "Personal Details" and "Leave Details" names are used for both form inputs and read-only summaries, making it difficult to identify which component is being referenced.

## Constraints

- Must follow project code style (AGENTS.md)
- Maintain existing functionality
- Update all references in documentation and code comments
- Ensure clear distinction between form input and summary/preview components

## Acceptance Criteria

- [ ] Form section titles include "Form" or "Input" suffix (e.g., "Personal Details Form")
- [ ] Summary section titles include "Summary" or "Preview" suffix (e.g., "Personal Details Summary")
- [ ] ReviewAndGenerate.tsx section titles updated to reflect their purpose
- [ ] Component file names (PersonalDetailsSection, LeaveDetailsSection) may remain unchanged or updated if needed
- [ ] All documentation references updated with new naming convention
- [ ] Code comments updated where section names are mentioned
- [ ] No TypeScript errors
- [ ] No console errors

## Notes

Reviewer feedback: Consistent naming convention applied across all sections. All tests passing. No breaking changes. Minor suggestion: replace @ts-ignore with @ts-expect-error in ReviewAndGenerate.test.tsx; consider aligning section ID naming in ReviewAndGenerate.tsx with form section IDs.
