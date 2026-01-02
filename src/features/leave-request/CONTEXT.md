# Leave Request Feature Context

## Overview

This feature handles the creation, validation, and PDF generation of leave requests.

## Domain Rules

- **Absence Calculation**: Must exclude weekends and public holidays (loaded from `data/holidays.json`).
- **Date Range**: `startDate` must be less than or equal to `endDate`.
- **PDF Generation**: Uses `@react-pdf/renderer`. Fonts must be registered to support Greek characters.

## State Management

- Uses `useLeaveRequestStore` from `state/leaveRequest.store.ts`.
- Persists `profile` and `signature` data, but NOT `leaveDraft`.

## UI Components

- `LeaveRequestForm`: Main entry point for the form.
- `DateRangeField`: Custom calendar integration using `react-day-picker`.
- `ReviewAndGenerate`: Handles the final review and PDF trigger.
