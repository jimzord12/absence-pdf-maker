# Leave Request PWA – Technical Design (Vertical Slice + Zustand)

> Version: 1.0
> Owner: Frontend Team
> Status: Draft for implementation

---

## 1. Overview

This project is a **static, frontend-only** leave request application built with **Vite + React + TypeScript**, designed to transform a leave-of-absence request form into a **downloadable PDF** that employees can send to HR.
The application remembers stable user details in the browser, works offline as a **PWA**, and does **not** require a backend or database.

The codebase follows a **vertical slice** (feature-first) structure: each feature owns its UI, validation, state, and services, with only generic UI primitives in a shared area.

---

## 2. Requirements

### 2.1 Functional requirements (Must have)

1. **Modern styling & animations**

   - Use a modern, popular styling approach (e.g., utility CSS or a component library).
   - Use a modern animation library for a **smooth enter animation** when the form appears (on app load or page mount).

2. **User details stored in the browser**

   - Persist stable user profile data (name, contact, employee data) locally so the user does not retype them for future requests.
   - No external database or backend; storage is strictly client-side.

3. **PWA & offline support**

   - App must behave as a Progressive Web App:
     - Installable on supported browsers.
     - Works offline after the first successful load.
   - Use service worker and manifest to cache the app shell and static assets.

4. **Import and export user details as JSON**

   - Allow the user to **download** their saved profile details to a JSON file.
   - Allow the user to **upload** a JSON file to restore their profile details (with validation and error handling).

5. **Capture user signature**

   - Provide a **canvas-based signature pad** in a modal (or dialog) where the user can draw a signature.
   - Use a well-known signature-pad React package.
   - Save the signature as an image (e.g., data URL) for use in the generated PDF.

6. **Configurable PDF template**

   - PDF layout and required fields must be defined via template configuration, not hard-coded logic.
   - It must be possible to change the document layout or required information by:
     - Adding/replacing template configuration files, and
     - Minimally touching the rendering pipeline.

7. **PDF generation UX**

   - When generating the PDF:
     - Show a **visually rich loading spinner / animation**.
     - Enforce a **minimum 2-second** loading duration, even if the actual generation is faster.
   - After generation, trigger a PDF download.

8. **Holiday-aware dates**

   - App must consume a JSON file containing an array of **ISO date strings** representing holidays for a specific country.
   - The Date Picker must:
     - Highlight holidays with a distinct style.
   - When computing total absence days:
     - Holidays inside the selected date range must be **deducted** from the counted days.

9. **Weekend-aware dates**
   - When computing total absence days:
     - Saturdays and Sundays inside the selected date range must be **deducted** from the counted days.

### 2.2 Non-functional requirements

- **Performance**

  - Quick first load (optimized static build).
  - Smooth animations without jank on modern browsers.

- **Usability**

  - Large, readable typography.
  - Clear input labels and validation messages.
  - Accessible: keyboard navigation and sensible focus states.

- **Privacy & security**
  - All data remains on-device unless the user exports JSON or downloads PDFs.
  - Provide a way to clear saved details.
  - No external tracking or analytics in v1.

---

## 3. Architecture

### 3.1 High-level

- Single-page application with client-side routing (or single route) built with React.
- **Vertical slice** feature module for `leave-request`, encapsulating:
  - UI components.
  - Validation schema and types.
  - State management (Zustand).
  - Services (PDF generation, persistence, holidays, absence calculation).

Shared pieces (buttons, inputs, modals, etc.) are placed under `shared/` so they can be reused by future features but remain implementation-agnostic.

### 3.2 Folder structure

```text
src/
├── main.tsx
├── vite-env.d.ts
├── app/
│   ├── App.tsx
│   ├── layout/
│   │   └── Shell.tsx (App shell: header, main container)
│   └── providers/
│       ├── StoreProvider.tsx
│       ├── ThemeProvider.tsx
│       └── PwaProvider.tsx (Optional HOC for PWA hooks)
├── shared/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   ├── Card.tsx
│   │   └── Alert.tsx
│   ├── lib/
│   │   ├── dates.ts (common date helpers)
│   │   └── file.ts (generic download/upload helpers)
│   └── styles/
│       ├── globals.css
│       └── theme.css
└── features/
    └── leave-request/
        ├── ui/
        │   ├── LeaveRequestPage.tsx
        │   ├── LeaveRequestForm.tsx
        │   ├── PersonalDetailsSection.tsx
        │   ├── EmploymentDetailsSection.tsx
        │   ├── LeaveDetailsSection.tsx
        │   ├── DateRangeField.tsx
        │   ├── HolidaysLegend.tsx
        │   ├── SignatureModal.tsx
        │   └── ReviewAndGenerate.tsx
        ├── model/
        │   ├── leaveRequest.schema.ts
        │   ├── leaveRequest.types.ts
        │   └── holidays.schema.ts
        ├── state/
        │   └── leaveRequest.store.ts (Zustand store and slices)
        └── services/
            ├── persistence.ts (JSON import/export + syncing)
            ├── absenceDays.ts (calculate total absence days)
            ├── holidays/
            │   ├── data/
            │   │   └── holidays.json (country-specific ISO dates)
            │   └── holidays.service.ts (load/normalize/check helpers)
            └── pdf/
                ├── templates/
                │   ├── template.types.ts
                │   └── default.template.ts
                └── pdf.service.ts (generic renderer using templates)

manifest.webmanifest
service-worker.ts (if manually customized; otherwise plugin-generated)
```

---

## 4. Domain model & validation

### 4.1 Entities

#### UserProfile

- `fullName: string`
- `email: string`
- `phone: string`
- `employeeId: string`
- `department: string`
- `position: string`

#### LeaveRequest

- `profile: UserProfile`
- `leaveType: "annual" | "sick" | "unpaid" | "other"`
- `startDate: Date`
- `endDate: Date`
- `reason?: string`
- `createdAt: Date`
- `signatureDataUrl?: string` (optional image data URL)

#### Holiday

- Represented as ISO date strings: `"YYYY-MM-DD"`.
- Loaded from JSON file.

### 4.2 Validation (Zod)

Create schemas in `leaveRequest.schema.ts`:

- `UserProfileSchema`
  - Non-empty strings for required fields.
  - Email format check.
- `LeaveRequestSchema`
  - Fields as above.
  - Refinements:
    - `startDate <= endDate`.
    - Optional `reason` with max length.

Create `HolidayListSchema` in `holidays.schema.ts`:

- Array of ISO date strings matching `/^\d{4}-\d{2}-\d{2}$/`.

RHF uses these schemas via a resolver, giving type safety and clear error messages.

---

## 5. State Management (Zustand) & Persistence

### 5.1 Store responsibilities

`leaveRequest.store.ts` is the **single feature store** for the `leave-request` vertical slice.

State slices:

- `profile` (persisted)
  - `fullName, email, phone, employeeId, department, position`
- `leaveDraft` (in-memory by default)
  - `leaveType, startDate, endDate, reason`
- `signature`
  - `signatureDataUrl` (in-memory; persistence optional and likely disabled in v1)
- `holidays`
  - `holidaySet: Set<string>` or `string[]` of ISO days loaded from JSON
- `ui`
  - `isSignatureModalOpen: boolean`
  - `isGeneratingPdf: boolean`
  - `lastGeneratedFileName?: string`

### 5.2 Persisted fields

Use Zustand’s `persist` functionality with a `partialize` function:

- Persist **only** `profile` and optional “user preferences” (like last-used leave type).
- Do **not** persist:
  - `leaveDraft` (dates and reasons).
  - `signatureDataUrl` (unless explicitly requested).

### 5.3 JSON import/export of user details

In `persistence.ts`:

- `exportProfileToJson()`

  - Reads the profile slice from the store.
  - Stringifies to JSON.
  - Triggers a download as `user-details.json`.

- `importProfileFromJson(file: File)`
  - Reads the file, parses JSON.
  - Validates against `UserProfileSchema`.
  - Writes valid data to the store.
  - Handles invalid data with a user-friendly error message.

---

## 6. Forms & Date Handling

### 6.1 Form structure (React Hook Form)

`LeaveRequestForm`:

- Uses RHF with Zod resolver.
- Form fields grouped into:
  - Personal details.
  - Employment details.
  - Leave details (type, dates, reason).
  - Signature (open modal button + “Signature captured” indicator).

RHF owns input registration, dirty/touched tracking, and validation errors.
Zustand is used to synchronize initial values and to keep some data accessible outside the form tree (e.g., for JSON export/import and PDF).

### 6.2 Date range field & holidays

`DateRangeField`:

- Displays a calendar component with:
  - Start and end date selection.
  - Highlighted holidays.

Holiday styling:

- Convert holiday ISO dates from the holiday service into `Date` objects.
- Pass them as a “holiday” modifier to the calendar component.
- Configure a custom style/class for `holiday` days (e.g., colored background, dot marker, or badge).

Legend:

- `HolidaysLegend` explains that highlighted days are holidays and do **not** count toward absence days.

---

## 7. Holidays & Absence Calculation

### 7.1 Holiday loading

`holidays.service.ts`:

- Imports `holidays.json` (country-specific) at build time.
- Validates via `HolidayListSchema`.
- Normalizes into:
  - `holidaySet: Set<string>` where keys are `"YYYY-MM-DD"`.

Helpers:

- `toIsoDay(date: Date): string` → `"YYYY-MM-DD"`.
- `isHoliday(date: Date): boolean` → `holidaySet.has(toIsoDay(date))`.
- `getHolidayDates(): Date[]` for styling in the calendar.

### 7.2 Absence days calculation

`absenceDays.ts`:

- `calculateAbsenceDays(startDate: Date, endDate: Date, holidaySet: Set<string>): { totalDays: number; holidayDays: number; weekendDays: number; absenceDays: number }`

Algorithm (inclusive range):

1. Compute `totalDays` as number of calendar days between `startDate` and `endDate`, inclusive.
2. For each day in the range:
   - Convert to ISO day.
   - If present in `holidaySet`, increment `holidayDays`.
   - Else if day is Saturday or Sunday, increment `weekendDays`.
3. `absenceDays = totalDays - holidayDays - weekendDays`.

Notes:

- Weekends: Saturdays and Sundays are excluded from the absence count.
- Future enhancement: add configuration to support different non-working day patterns (e.g., Friday-Saturday weekends).

---

## 8. PDF Generation (Template-based)

### 8.1 Template design

In `pdf/templates/template.types.ts` define:

- `TemplateField` (label, value mapping, position).
- `TemplateSection` (title, fields, layout metadata).
- `TemplateDefinition`:
  - Page settings (A4, orientation).
  - Font sizes, margins.
  - Sections (profile, employment, leave details, dates, signature area).
  - Optional logo or header configuration.

`default.template.ts` exports a `TemplateDefinition` implementing the default company layout.

### 8.2 PDF service

`pdf.service.ts`:

- `generateLeaveRequestPdf(data: LeaveRequest, template: TemplateDefinition): Promise<Blob | void>`
  - Uses jsPDF (or similar) to:
    - Create document.
    - Render sections and fields based on template coordinates.
    - Draw signature image (if `signatureDataUrl` present).
  - Produces a Blob or triggers `doc.save(fileName)`.

File naming:

- `LeaveRequest_<EmployeeId>_<YYYY-MM-DD>.pdf`.

### 8.3 Template swapping

To change layout:

- Create a new template file, e.g. `newCompany.template.ts`, implementing `TemplateDefinition`.
- Switch the active template via:
  - Configuration value, or
  - Simple map in `pdf.service.ts`.

This design ensures minimal changes when the corporate document changes.

---

## 9. UX & Animations

### 9.1 Styling

- Use a modern styling solution (e.g., utility CSS with a design system approach).
- Design principles:
  - Centered content with a maximum width.
  - Clear hierarchy using cards for sections.
  - Responsive layout:
    - Single column on mobile.
    - Two-column grouping for desktop where appropriate.

### 9.2 Form enter animation

- Wrap the main form container (`LeaveRequestForm`) in an animated wrapper.
- On mount:
  - Fade in + slight upward motion.
- Keep animation duration short and smooth (e.g., 250–400 ms).

### 9.3 PDF generation loading UX

- When the user clicks “Generate PDF”:
  1. Validate form; if invalid, show errors and do not proceed.
  2. Set `isGeneratingPdf = true` in the Zustand store.
  3. Show a modal or overlay with a **custom spinner** (unique animation, not the default loader).
  4. Run both:
     - PDF generation.
     - A `delay(2000)` timer.
  5. After both complete:
     - Trigger download (if not already).
     - Set `isGeneratingPdf = false`.
     - Close modal.

---

## 10. PWA & Offline Support

### 10.1 Manifest

`manifest.webmanifest`:

- `name`, `short_name` with company branding.
- `icons` (192x192, 512x512 at least).
- `start_url: "/"`.
- `display: "standalone"`.
- `theme_color` and `background_color` consistent with app theme.

### 10.2 Service Worker

- Use a PWA integration for Vite to generate a service worker that:
  - Caches the app shell and static assets.
  - Serves cached assets when offline.
- Offline behavior:
  - User can open the app and access the form and saved profile without network.
  - PDF generation still works offline as it is purely client-side.

### 10.3 Install prompt

- Optionally surface an “Install App” button in the UI if the browser exposes the install event.

---

## 11. Testing & Quality

### 11.1 Unit tests

- Zod schemas:
  - Valid and invalid profile data.
  - Valid and invalid leave requests (date ordering).
- Holiday system:
  - Loading and validating `holidays.json`.
  - `isHoliday` behavior.
  - `calculateAbsenceDays` with:
    - No holidays.
    - Holidays at start/end.
- PDF service:
  - At least smoke tests to ensure it can run with template and data without throwing.

### 11.2 Integration / E2E scenarios

- New user journey:
  - Fill form, select dates, sign, generate PDF.
- Returning user:
  - Form loads with prefilled profile from local storage.
- JSON export/import:
  - Export profile.
  - Clear profile.
  - Import JSON, verify fields.
- Holiday highlighting and counting:
  - Range containing 0, 1, and multiple holidays.

### 11.3 Accessibility checks

- Keyboard-only navigation:
  - Inputs, buttons, modals, date picker, signature modal.
- Screen reader labels for fields and buttons.
- Contrast checks.

---

## 12. Build & Deployment

### 12.1 Build

- Use Vite’s production build command.
- Produce static assets under `dist/`.

### 12.2 Deployment

- Host `dist/` on static hosting (e.g., object storage + CDN or static site host).
- Ensure HTTPS and correct headers:
  - `Content-Type` for JS, CSS, JSON.
  - Service worker scope is correct.

---

## 13. Future Enhancements

- Multiple country holiday files with a selection mechanism.
- Multi-language support for UI and PDF content.
- Integration with internal HR systems via API (for submission, not PDF-only).
- Role-based templates (different layouts for different departments or contract types).

---
