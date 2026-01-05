# capture-pre-upgrade-baselines

**Priority:** high
**Blocks:** upgrade-tailwind-v3-to-v4
**Blocked By:** none
**Issue:** N/A

---

## Description

Capture visual regression baselines before upgrading Tailwind CSS from v3 to v4. These baselines will serve as the "before" reference to detect visual regressions after the upgrade.

## Constraints

- Must capture baselines while Tailwind v3 is still active (before any changes)
- Must have development server running before capturing
- Must capture all three form sections (Personal Details, Employment Details, Leave Details)
- Baselines must be saved in docs/baselines/ directory
- Must create baselines directory if it doesn't exist

## Acceptance Criteria

- Development server is running at http://localhost:5174 before capturing
- Personal Details section baseline captured as `docs/baselines/personal-details.png`
- Employment Details section baseline captured as `docs/baselines/employment-details.png`
- Leave Details section baseline captured as `docs/baselines/leave-details.png`
- All baselines successfully saved without errors
- Baselines are version-controlled and committed to git before upgrade

## Notes

### Pre-Capture Checklist

Before running the capture script, ensure:

1. **Development server is running**:
   ```bash
   npm run dev
   ```

2. **Verify server is accessible**:
   ```bash
   curl http://localhost:5174
   ```

3. **No uncommitted changes**:
   ```bash
   git status
   ```

### Capture Process

The `scripts/capture-baselines.ts` script:

1. Launches a headless Chromium browser using Playwright
2. Navigates to the running application
3. Waits for the Personal Details section to render (app ready signal)
4. Captures element-level screenshots of three form sections:
   - Personal Details: `section[aria-labelledby="personal-details-heading"]`
   - Employment Details: `section[aria-labelledby="employment-details-heading"]`
   - Leave Details: `section[aria-labelledby="leave-details-heading"]`
5. Saves each as PNG in `docs/baselines/`

### Execution Command

```bash
# From project root
npm run capture-baselines
```

### Expected Output

```
Launching browser...
Navigating to http://localhost:5174...
Capturing personal-details...
Capturing employment-details...
Capturing leave-details...
Baselines captured successfully in docs/baselines/
```

### Post-Capture Steps

After capturing baselines:

1. **Commit baselines to git**:
   ```bash
   git add docs/baselines/
   git commit -m "chore: capture pre-upgrade baselines for Tailwind v3"
   ```

2. **Verify baselines exist**:
   ```bash
   ls docs/baselines/
   ```

3. **Optional: Create backup** (for comparison convenience):
   ```bash
   cd docs/baselines
   mkdir before
   cp *.png before/
   cd ../..
   ```

### What Gets Captured

| Section | File | Component |
|---------|------|-----------|
| Personal Details | `personal-details.png` | `PersonalDetailsSection.tsx` |
| Employment Details | `employment-details.png` | `EmploymentDetailsSection.tsx` |
| Leave Details | `leave-details.png` | `LeaveDetailsSection.tsx` |

### Why This Matters

After the Tailwind upgrade, you'll:

1. Capture new baselines (will overwrite originals)
2. Compare "before" vs "after" using ZAI's `ui_diff_check` tool
3. Detect visual regressions caused by v4 breaking changes
4. Fix regressions before committing the upgrade

This workflow ensures the visual design remains consistent through the major framework upgrade.
