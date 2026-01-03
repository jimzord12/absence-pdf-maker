# Issue Report: Update Import/Export Profile for New User Information

**Issue ID:** 008
**Component:** Data Persistence Service
**Date Discovered:** 2025-12-30
**Status:** Open
**Priority:** Medium

## Summary

Import/export profile functionality needs to be updated to include new user information fields and remove deprecated fields to maintain data consistency with the current form structure.

## Problem Description

### Symptom

1. User imports an exported profile from a previous version
2. Profile contains deprecated fields and is missing new fields
3. Form does not work correctly with old profile data
4. Data inconsistency between stored profiles and current form structure

### Investigation Details

#### 1. Outdated Profile Schema

- **File:** `src/features/leave-request/services/persistence.ts`
- **Issue:** Profile schema does not match current form structure
- **Evidence:** Deprecated fields like Employer ID and Employer Name still exist
- **Fix Applied (if any):** None yet

#### 2. Missing New Fields

- **File:** `src/features/leave-request/services/persistence.ts`
- **Root Cause:** Import/export logic not updated after form changes
- **Evidence:** New fields not included in exported profile

## Steps to Reproduce

1. Open the application
2. Export a profile (if working with current version)
3. Modify form structure to add/remove fields
4. Attempt to import previously exported profile
5. Observe: Profile data does not match current form fields
6. Expected behavior: Profile should contain all current fields and no deprecated fields
7. Actual behavior: Profile contains outdated fields and is missing new ones

## Technical Details

### Persistence Layer

- **Storage:** LocalStorage
- **State Management:** Zustand with persist middleware
- **Data Format:** JSON

### Relevant Files

1. **`src/features/leave-request/services/persistence.ts`**

   - Contains import/export logic
   - Handles profile serialization/deserialization

2. **`src/features/leave-request/state/leaveRequest.store.ts`**

   - Defines the store schema and persisted fields
   - Uses `partialize` for selective persistence

3. **`src/features/leave-request/model/leaveRequest.schema.ts`**

   - Defines validation schema for form data

### Data Structure Changes

**Fields to Remove:**

- Employer ID
- Employer Name

**Fields to Update:**

- Company Name (should default to "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε")

**Additional Changes:**

- Any other fields added/modified in issue #011

## Potential Causes

### 1. Schema Drift

Form schema was updated but persistence logic was not updated to match, causing data inconsistency.

### 2. Missing Migration

No migration logic exists to handle profiles created with older schemas.

### 3. Incomplete Update

Import/export functionality may have been partially updated, leaving some fields unhandled.

## Suggested Solutions

### Short Term (Workaround)

1. **Manual Field Mapping:**
   - Users must manually re-enter data after importing old profiles
   - Limitations: Poor user experience, data loss

### Medium Term (Proper Fix)

1. **Update Persistence Schema:**

   - Modify `persistence.ts` to export/import only current fields
   - Remove deprecated fields from the serialized profile
   - Add any new fields to the export logic
   - Expected outcome: Profiles contain correct field set

2. **Set Default Values:**
   - Ensure Company Name defaults to "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε" on import
   - Validate imported data against current schema
   - Expected outcome: Consistent default behavior

### Long Term (Architectural)

1. **Versioned Profiles:**

   - Add version number to profile schema
   - Implement migration logic to handle schema changes
   - Benefits: Backward compatibility and smooth upgrades
   - Implementation: Store schema version, apply migrations on import

2. **Schema-Driven Persistence:**
   - Auto-generate import/export logic from form schema
   - Use Zod schema to validate and transform profiles
   - Benefits: Automatic synchronization between form and persistence

## Additional Notes

- This issue is blocked by #011 (User Info Changes) which defines the field changes
- Important for user experience and data portability
- Consider data migration strategy for existing users with old profiles

## Related Issues

- [#011 - User Info Changes](../closed/011-user-info-changes.md) - Defines the field changes that need to be reflected in import/export
- Feature: [email-sending-integration](docs/features/email-sending-integration/guide.md) - May use profile data

## References

- File: `src/features/leave-request/services/persistence.ts`
- File: `src/features/leave-request/state/leaveRequest.store.ts`
- File: `src/features/leave-request/model/leaveRequest.schema.ts`

