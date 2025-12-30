# Issue Report: User Signature Not Persisting After Save

**Issue ID:** 010
**Component:** Signature Management
**Date Discovered:** 2025-12-30
**Status:** Open
**Priority:** Medium

## Summary

User signatures are not being saved to persistent storage after clicking "Save Signature", requiring users to redraw their signature every time they revisit the form.

## Problem Description

### Symptom

1. User navigates to Leave Request form
2. User opens signature modal and draws signature
3. User clicks "Save Signature" button
4. User navigates away or refreshes the page
5. Upon returning, signature is not present
6. User must redraw signature every time

### Investigation Details

#### 1. Signature Not Persisted

- **File:** `src/features/leave-request/ui/SignatureModal.tsx`
- **Issue:** Signature data is not saved to persistent storage
- **Evidence:** Signature disappears after page refresh/navigation
- **Fix Applied (if any):** None yet

#### 2. Missing Store Integration

- **File:** `src/features/leave-request/state/leaveRequest.store.ts`
- **Root Cause:** Signature field may not be included in persisted store data
- **Evidence:** Signature data is in memory but not in localStorage

#### 3. Incorrect Persistence Strategy

- **File:** `src/features/leave-request/state/leaveRequest.store.ts`
- **Potential Issue:** Signatures may be intentionally excluded from persistence using `partialize`
- **Evidence:** Check store configuration for signature field exclusion

## Steps to Reproduce

1. Open the application and navigate to Leave Request form
2. Click on signature field to open signature modal
3. Draw a signature using mouse or touch
4. Click "Save Signature" button
5. Close the modal or refresh the page
6. Navigate back to the Leave Request form
7. Observe: Signature field is empty
8. Expected behavior: Previously saved signature should be displayed
9. Actual behavior: Signature field is empty, requiring user to redraw

## Technical Details

### State Management

- **Store:** Zustand with persist middleware
- **Storage:** LocalStorage
- **Signature Format:** Base64 encoded image data (canvas)

### Relevant Files

1. **`src/features/leave-request/ui/SignatureModal.tsx`**

   - Signature drawing and saving component
   - Handles signature capture and display

2. **`src/features/leave-request/state/leaveRequest.store.ts`**

   - Application state management
   - Contains signature field and persistence configuration

3. **`src/features/leave-request/ui/ReviewAndGenerate.tsx`**

   - Displays signature in preview/summary

### Data Flow

```
User draws signature in canvas
  → Canvas converted to Base64 data URL
  → Data saved to store in memory
  → (Current behavior) Store does NOT persist to localStorage
  → (Desired behavior) Store persists to localStorage via persist middleware
  → On page load, signature loaded from localStorage and displayed
```

### Store Configuration

Check if signature field is included in `partialize` function:

```typescript
// If signature is excluded:
partialize: (state) => ({
  profile: state.profile,
  leaveDraft: state.leaveDraft,
  // signature: state.signature  <- MISSING?
})
```

## Potential Causes

### 1. Signature Excluded from Persistence

The signature field may be intentionally excluded from persistence to avoid storing large Base64 strings in localStorage, which has a size limit (typically 5-10MB).

### 2. Missing Save Logic

The "Save Signature" button may only close the modal and update local state without triggering persistence.

### 3. Storage Quota Exceeded

If the signature data is large or many signatures are stored, localStorage quota may be exceeded, preventing persistence.

## Suggested Solutions

### Short Term (Workaround)

1. **Session-Only Signature:**
   - Document that signatures are not persisted
   - Users must redraw signature each session
   - Limitations: Poor user experience

### Medium Term (Proper Fix)

1. **Include Signature in Persistence:**
   - Add signature field to the `partialize` function in store
   - Ensure "Save Signature" updates the persisted store state
   - Expected outcome: Signature persists across sessions

2. **Implement Storage Management:**
   - Validate signature data size before storing
   - Handle localStorage quota errors gracefully
   - Expected outcome: Reliable signature persistence

### Long Term (Architectural)

1. **External Signature Storage:**
   - Store signatures in IndexedDB instead of localStorage (higher quota)
   - Or store signatures on server with authentication
   - Benefits: No localStorage quota issues, better security
   - Implementation: Create signature service with IndexedDB backend

2. **Signature Cache Strategy:**
   - Cache signatures with expiration
   - Allow users to opt out of persistence for privacy
   - Benefits: Balance convenience and privacy

## Additional Notes

- Medium priority: Improves user experience but not a blocker
- Consider privacy implications: Some users may not want signatures stored
- LocalStorage has size limits (5-10MB), test with large signatures
- Consider compression for Base64 signature data

## Related Issues

- None documented yet

## References

- File: `src/features/leave-request/ui/SignatureModal.tsx`
- File: `src/features/leave-request/state/leaveRequest.store.ts`
- Documentation: Zustand persist middleware
