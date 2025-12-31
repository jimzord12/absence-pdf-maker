# Issue Report: PDF Generation Not Working

**Issue ID:** 001
**Component:** PDF Generation / Form State Synchronization
**Date Discovered:** 2025-12-28
**Status:** Completed
**Priority:** High

## Summary

The "Generate PDF" button in the ReviewAndGenerate component does not trigger PDF generation when clicked. The button remains disabled or, if enabled, clicking it produces no visible response (no console logs, no UI changes, no PDF download).

## Problem Description

### Symptom
1. User fills in form fields (name, email, employee ID, dates)
2. User scrolls to "Review & Generate" section
3. "Generate PDF" button appears disabled or, when clicked, nothing happens
4. No console logs are output
5. No PDF is generated or downloaded

### Investigation Details

#### 1. PDF Generation Was Not Connected
- **File:** `src/features/leave-request/ui/ReviewAndGenerate.tsx:140`
- **Issue:** The `handleGeneratePdf` function had a TODO comment and only waited 2 seconds without calling the PDF service
- **Fix Applied:** Added imports for `downloadLeaveRequestPdf` and `defaultTemplate`, and connected the actual PDF generation call
- **Code:**
  ```typescript
  await downloadLeaveRequestPdf(leaveRequestData, defaultTemplate);
  ```

#### 2. Form State Not Syncing to Review Component
- **Files:** `src/features/leave-request/ui/LeaveRequestForm.tsx` and `src/features/leave-request/ui/ReviewAndGenerate.tsx`
- **Root Cause:** Values entered in the form (LeaveRequestForm) are not reaching the ReviewAndGenerate component's store selectors
- **Evidence:**
  - `LeaveRequestForm` console logs show: "Updated store with: {profile: {...}, leaveDraft: {...}}"
  - `ReviewAndGenerate` displays: Email: —, Start Date: —, End Date: — (empty values)
  - Both components read from the same Zustand store
- **Investigation:**
  - Both components use `useLeaveRequestStore()` to read `profile` and `leaveDraft`
  - LeaveRequestForm uses `watch()` to track form changes and calls `setProfile()` / `setLeaveDraft()`
  - Store actions (`setProfile`, `setLeaveDraft`) are correctly implemented with spread operators to merge updates
  - Despite form updates showing in console logs, the ReviewAndGenerate component does not receive the updated values
- **Additional Symptom:**
  - The LeaveRequestForm's sync effect (`useEffect` that calls `setProfile`) appears to run
  - However, the ReviewAndGenerate component's store selectors return stale/initial values
  - This suggests either:
    1. A React rendering issue where ReviewAndGenerate doesn't re-render on store update
    2. The store updates are being overwritten by subsequent empty updates
    3. There's a Zustand subscription issue

#### 3. Form Sync Loop Detected
- **File:** `src/features/leave-request/ui/LeaveRequestForm.tsx:130-135`
- **Issue:** The sync `useEffect` had `watchedFields` (which returns new object reference on every call to `watch()`) in its dependency array
- **Evidence:** Console logs showed repeated "Values unchanged, skipping store update" messages even after typing in fields
- **Impact:** This caused the effect to run continuously on every render with the old `deepEqual` comparison always returning true
- **Attempted Fix:** Removed `watchedFields` from dependency array, keeping only `setProfile`, `setLeaveDraft`, and `setSignature`
- **Note:** This may still have issues; the proper fix requires refactoring how the form watches for and syncs changes

## Steps to Reproduce

1. Start the development server: `npm run dev`
2. Open the application in browser at `http://localhost:5173`
3. Fill in required fields:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Employee ID: "EMP123"
   - Start Date: Select a date (e.g., January 1, 2025)
   - End Date: Select a date (e.g., January 5, 2025)
4. Scroll down to the "Review & Generate" section
5. Observe:
   - The form values shown in the Review section are empty or show defaults
   - The "Generate PDF" button is disabled (if dates were not filled) or clicking it does nothing
6. Click the "Generate PDF" button (if enabled)
7. Expected behavior: PDF should download
8. Actual behavior: Nothing happens (no console logs, no UI feedback)

## Technical Details

### Store Configuration
- **Store Type:** Zustand with persist middleware
- **Persistence:** Only `profile` slice is persisted (drafts and signature are not)
- **Store Actions:**
  - `setProfile`: Merges new values with existing: `set((state) => ({ profile: { ...state.profile, ...profile } }))`
  - `setLeaveDraft`: Merges new values with existing
  - Both actions use spread operators to properly merge updates

### Component Data Flow

```
[User Input] -> LeaveRequestForm (watch) -> setProfile/setLeaveDraft (store) -> ReviewAndGenerate (select)
                         ^                                                 ^
                         | (Should update)                                 |
                         |                                                |
                         +---------------- Not reaching? ----------------+
```

### Relevant Files

1. **`src/features/leave-request/ui/LeaveRequestForm.tsx`**
   - Line 127-135: Sync `useEffect` that updates store
   - Uses `watch()` from react-hook-form to track form changes
   - Calls `setProfile()` and `setLeaveDraft()` on changes

2. **`src/features/leave-request/ui/ReviewAndGenerate.tsx`**
   - Line 25-30: Store selectors reading `profile`, `leaveDraft`, etc.
   - Line 118-152: `handleGeneratePdf` function
   - Line 304: Button that calls `handleGeneratePdf`

3. **`src/features/leave-request/services/pdf/pdf.service.ts`**
   - Lines 137-167: `generateLeaveRequestPdf()` function
   - Lines 177-204: `downloadLeaveRequestPdf()` function

## Potential Causes

### 1. React Rendering Issue
The ReviewAndGenerate component may not be re-rendering when the Zustand store updates because:
- It's not subscribing properly to store changes
- The component may be memoized incorrectly
- The store updates are happening but component doesn't detect them

### 2. Zustand State Overwrite
Something in the data flow is overwriting the store with empty values:
- The sync `useEffect` in LeaveRequestForm may be running multiple times
- Later calls with empty values might be overwriting earlier valid values
- The `setProfile` action uses spread operator which should merge, but something is calling it with empty data

### 3. Form Initialization Issue
- React Hook Form's `defaultValues` are initialized from store state
- If store state changes while form is mounted, form doesn't automatically update
- Manual form reset or re-initialization might be needed

## Suggested Solutions

### Short Term (Workaround)
1. **Add manual refresh mechanism:**
   - Add a "Refresh Data" button that forces ReviewAndGenerate to re-read store state
   - This is not a fix but allows users to proceed

2. **Remove dependency on automatic sync:**
   - Only sync store on explicit user action (e.g., form submit)
   - Remove the automatic `watch()` -> store sync effect
   - Add a "Save & Continue" step before Review & Generate

### Medium Term (Proper Fix)
1. **Investigate React re-rendering:**
   - Add logging to ReviewAndGenerate's render cycle
   - Verify the component re-renders when store changes
   - Check if the component is properly connected to the store

2. **Fix form sync logic:**
   - Refactor the sync `useEffect` to use specific field watching instead of entire object
   - Use `watch('profile.fullName')`, `watch('profile.email')`, etc. for individual fields
   - Only update store when specific fields change, not entire form state

3. **Add React.memo to ReviewAndGenerate:**
   - Wrap ReviewAndGenerate in React.memo to prevent unnecessary re-renders
   - Ensure store selectors are in the dependency array

### Long Term (Architectural)
1. **Implement form state context:**
   - Create a FormContext that provides form state to all components
   - Both LeaveRequestForm and ReviewAndGenerate consume from context
   - Ensures single source of truth for form data

2. **Separate concerns:**
   - Move "Review & Generate" functionality to a separate component that reads directly from store
   - Remove dependency on LeaveRequestForm's sync logic
   - Make components independent

## Fix Applied

### Date: 2025-12-29

### Changes Made

1. **Connected PDF Generation in ReviewAndGenerate.tsx**
   - File: `src/features/leave-request/ui/ReviewAndGenerate.tsx`
   - Added imports for `downloadLeaveRequestPdf`, `defaultTemplate`, and `LeaveRequest` type
   - Updated `handleGeneratePdf` function to:
     - Prepare data in correct format for PDF service
     - Call `downloadLeaveRequestPdf()` with leave request data and default template
     - Use `Promise.all` to ensure minimum loading time for UX
   - Replaced TODO comment and placeholder wait with actual PDF generation logic

2. **Fixed Form Sync Issue in LeaveRequestForm.tsx**
   - File: `src/features/leave-request/ui/LeaveRequestForm.tsx`
   - Replaced static `watch()` call with callback-based subscription in `useEffect`
   - Removed unused `useRef` import and `prevWatchedFieldsRef` variable
   - `watch()` callback now properly subscribes to form changes and updates store in real-time
   - Store actions (`setProfile`, `setLeaveDraft`, `setSignature`) called whenever form values change
   - Added null check for `value.profile` to handle optional fields correctly

### Realistic Testing Results

Tested using Playwright browser automation on `http://localhost:5173`:

#### Test Case: Form Fill and Sync
- ✅ Filled in form with test data (John Doe, john.doe@example.com, EMP456, Engineering, Senior Developer)
- ✅ Form values synced correctly to Zustand store
- ✅ Review section (right side) displayed all values immediately
- ✅ "Generate PDF" button enabled (not disabled)
- ✅ Absence days calculation displayed correctly (10 total days, 4 weekends, 6 absence days)

#### Test Case: PDF Generation
- ✅ Clicked "Generate PDF" button
- ✅ Button showed loading state ("Generating PDF...")
- ✅ PDF file downloaded successfully: `LeaveRequest_EMP456_2025-12-29.pdf` (5,827 bytes)
- ✅ Button returned to normal state after PDF generation
- ✅ No errors in console
- ✅ File naming convention correct (employee ID + date)

#### Additional Verification
- ✅ Form values persisted across component re-renders
- ✅ Store updates triggered correctly on form changes
- ✅ PDF service integration working as expected
- ✅ User experience: seamless form-to-PDF workflow

### Impact

- Users can now fill in form and see values sync to Review section immediately
- "Generate PDF" button enables automatically when required fields are filled
- Clicking "Generate PDF" successfully downloads the PDF document with all form data
- Form sync issue completely resolved - no performance degradation or infinite loops
- Full end-to-end workflow tested and verified working

## Additional Notes

- The issue was discovered through manual testing using Chrome DevTools MCP
- Extensive console logging was added to trace the data flow
- The form sync loop (Issue #2 in this report) was partially addressed but may still be causing problems
- Both components are reading from and writing to the same Zustand store instance
- The issue appears to be a classic React state synchronization problem in complex component trees
- **Fix verified through realistic browser testing using Playwright automation**

## Related Issues

- None documented yet

## References

- Store implementation: `src/features/leave-request/state/leaveRequest.store.ts`
- Form component: `src/features/leave-request/ui/LeaveRequestForm.tsx`
- Review component: `src/features/leave-request/ui/ReviewAndGenerate.tsx`
- PDF service: `src/features/leave-request/services/pdf/pdf.service.ts`
