# Leave Request PWA - Implementation Tasks

## Task List

---

### 001-task-project-scaffolding

**Identifier:** `001-task-project-scaffolding`

**Description:**
Initialize the project with Vite + React + TypeScript, configure base tooling, and set up the development environment.

**Constraints:**

- Must use Vite as the build tool
- Must use TypeScript strict mode
- Use npm or yarn as package manager
- Project name should match the repo name

**Acceptance Criteria:**

- [ ] Vite project successfully created with React + TypeScript template
- [ ] Development server runs on `npm run dev`
- [ ] Build command `npm run build` produces static assets in `dist/`
- [ ] TypeScript strict mode enabled in `tsconfig.json`
- [ ] Base HTML template includes root div and proper meta tags

---

### 002-task-folder-structure

**Identifier:** `002-task-folder-structure`

**Description:**
Create the vertical slice folder structure as specified in the TDD, including app, shared, and features directories.

**Constraints:**

- Follow exact structure from TDD section 3.2
- Create placeholder files for each required module
- Maintain feature-first, vertical slice architecture

**Acceptance Criteria:**

- [ ] `src/app/` directory exists with `App.tsx`, `layout/`, `providers/`
- [ ] `src/shared/` directory exists with `ui/`, `lib/`, `styles/`
- [ ] `src/features/leave-request/` directory exists with `ui/`, `model/`, `state/`, `services/`
- [ ] All placeholder files created (Shell.tsx, providers, components, etc.)
- [ ] Directory structure matches TDD specification exactly

---

### 003-task-install-dependencies

**Identifier:** `003-task-install-dependencies`

**Description:**
Install and configure all required dependencies including React Hook Form, Zod, Zustand, jsPDF, date picker, signature pad, animation library, and PWA tools.

**Constraints:**

- Use the latest stable versions compatible with React 18+
- Prefer TypeScript-compatible packages
- Choose packages with active maintenance

**Acceptance Criteria:**

- [ ] React Hook Form and Zod resolver installed
- [ ] Zustand with persist middleware installed
- [ ] jsPDF installed for PDF generation
- [ ] Date picker library installed (react-day-picker or similar)
- [ ] Signature pad library installed (react-signature-canvas or similar)
- [ ] Animation library installed (framer-motion or similar)
- [ ] UI component library or utility CSS installed (Tailwind CSS or similar)
- [ ] Vite PWA plugin installed
- [ ] All dependencies listed in `package.json` with TypeScript types

---

### 004-task-shared-ui-components

**Identifier:** `004-task-shared-ui-components`

**Description:**
Create reusable UI primitive components (Button, Input, Select, Textarea, Modal, Spinner, Card, Alert) in the shared layer.

**Constraints:**

- Components must be generic and reusable
- Use TypeScript with proper prop types
- Support variants (primary, secondary, danger, etc.) where applicable
- Follow consistent design system patterns

**Acceptance Criteria:**

- [ ] `Button.tsx` supports variants (primary, secondary, ghost) and sizes
- [ ] `Input.tsx` supports text, email, phone, and has error state
- [ ] `Select.tsx` supports options and has error state
- [ ] `Textarea.tsx` supports multi-line input and error state
- [ ] `Modal.tsx` supports open/close state and backdrop click handling
- [ ] `Spinner.tsx` has a visually distinct loading animation
- [ ] `Card.tsx` provides consistent container styling
- [ ] `Alert.tsx` supports info, success, warning, error variants
- [ ] All components exported from `src/shared/ui/index.ts`

---

### 005-task-shared-utilities

**Identifier:** `005-task-shared-utilities`

**Description:**
Implement shared utility functions for date manipulation and file operations that will be used across features.

**Constraints:**

- Functions must be pure and testable
- Handle edge cases gracefully
- Use TypeScript with clear return types

**Acceptance Criteria:**

- [ ] `src/shared/lib/dates.ts` contains date formatting and parsing utilities
- [ ] `src/shared/lib/dates.ts` includes `formatDate()`, `parseIsoDate()`, `toIsoString()`
- [ ] `src/shared/lib/file.ts` includes `downloadFile()` for triggering downloads
- [ ] `src/shared/lib/file.ts` includes `readFileAsText()` for file uploads
- [ ] All utility functions exported from `src/shared/lib/index.ts`

---

### 006-task-global-styles

**Identifier:** `006-task-global-styles`

**Description:**
Set up global CSS including design tokens, theme configuration, and base styles for the application.

**Constraints:**

- Use CSS variables for theme tokens (colors, spacing, typography)
- Ensure responsive design with mobile-first approach
- Include reset/normalize styles

**Acceptance Criteria:**

- [ ] `src/shared/styles/globals.css` imported in `main.tsx`
- [ ] CSS variables defined for colors (primary, secondary, error, etc.)
- [ ] CSS variables defined for spacing scale
- [ ] CSS variables defined for typography (font sizes, weights)
- [ ] Base reset styles applied to all elements
- [ ] Responsive breakpoints defined
- [ ] Global styles follow utility CSS or component library conventions

---

### 007-task-domain-models-and-schemas

**Identifier:** `007-task-domain-models-and-schemas`

**Description:**
Define TypeScript types and Zod validation schemas for UserProfile, LeaveRequest, and Holiday entities.

**Constraints:**

- Use Zod for runtime validation
- TypeScript types derived from Zod schemas where possible
- Include comprehensive validation rules

**Acceptance Criteria:**

- [ ] `UserProfileSchema` validates name, email, phone, employeeId, department, position
- [ ] `UserProfileSchema` includes email format validation
- [ ] `LeaveRequestSchema` validates all fields with refinements
- [ ] `LeaveRequestSchema` ensures `startDate <= endDate`
- [ ] `HolidayListSchema` validates array of ISO date strings
- [ ] TypeScript types exported in `leaveRequest.types.ts`
- [ ] All schemas exported and tested with sample data

---

### 008-task-zustand-store-setup

**Identifier:** `008-task-zustand-store-setup`

**Description:**
Create the Zustand store for the leave-request feature with slices for profile, leaveDraft, signature, holidays, and UI state. Configure persistence for profile data.

**Constraints:**

- Use Zustand with persist middleware
- Persist only profile data (not drafts or signature)
- Store follows vertical slice architecture

**Acceptance Criteria:**

- [ ] `leaveRequest.store.ts` created with state slices
- [ ] State includes profile, leaveDraft, signature, holidays, ui
- [ ] `persist` middleware configured with `partialize` for profile only
- [ ] Actions to update profile, leaveDraft, signature, holidays, ui
- [ ] Actions to reset form drafts
- [ ] Actions to toggle signature modal and PDF generation state
- [ ] Store hydration works on page load
- [ ] TypeScript types inferred from store

---

### 009-task-persistence-service

**Identifier:** `009-task-persistence-service`

**Description:**
Implement JSON import/export functionality for user profile data with validation and error handling.

**Constraints:**

- Export: read profile from store, stringify, trigger download as JSON
- Import: read file, parse, validate against schema, update store
- Handle errors gracefully with user-friendly messages

**Acceptance Criteria:**

- [ ] `exportProfileToJson()` function exports current profile to JSON file
- [ ] Downloaded file named `user-details.json`
- [ ] `importProfileFromJson(file)` reads and parses uploaded JSON
- [ ] Imported data validated against `UserProfileSchema`
- [ ] Invalid data throws error with descriptive message
- [ ] Valid data updates Zustand store
- [ ] Service exported from `src/features/leave-request/services/persistence.ts`

---

### 010-task-holiday-service

**Identifier:** `010-task-holiday-service`

**Description:**
Create the holiday loading service that imports holidays from JSON, validates them, and provides helper functions for checking holidays.

**Constraints:**

- Load holidays from `data/holidays.json` at build time
- Validate against `HolidayListSchema`
- Convert to Set for O(1) lookups
- Provide Date object list for calendar highlighting

**Acceptance Criteria:**

- [ ] `holidays.service.ts` loads and validates holidays from `data/holidays.json`
- [ ] `holidaySet` contains dates as "YYYY-MM-DD" strings
- [ ] `isHoliday(date: Date)` function returns true if date is a holiday
- [ ] `getHolidayDates()` returns array of Date objects
- [ ] Service exported from `src/features/leave-request/services/holidays/holidays.service.ts`

---

### 011-task-absence-calculator

**Identifier:** `011-task-absence-calculator`

**Description:**
Implement the absence days calculation service that computes total days, holidays, weekends, and actual absence days from a date range.

**Constraints:**

- Inclusive date range calculation
- Exclude Saturdays and Sundays
- Deduct holidays from the range
- Return breakdown of all day types

**Acceptance Criteria:**

- [ ] `calculateAbsenceDays(startDate, endDate, holidaySet)` function implemented
- [ ] Returns object with `{ totalDays, holidayDays, weekendDays, absenceDays }`
- [ ] `totalDays` includes all days in range (inclusive)
- [ ] `holidayDays` counts days in `holidaySet`
- [ ] `weekendDays` counts Saturdays and Sundays
- [ ] `absenceDays = totalDays - holidayDays - weekendDays`
- [ ] Service handles edge cases (single day range, same start/end)
- [ ] Service exported from `src/features/leave-request/services/absenceDays.ts`

---

### 012-task-date-utilities

**Identifier:** `012-task-date-utilities`

**Description:**
Implement date utility functions specifically for the leave-request feature including ISO conversion, date range validation, and weekend checking.

**Constraints:**

- Functions must handle timezones consistently
- Use UTC or local time consistently (document choice)
- Return immutable date objects

**Acceptance Criteria:**

- [ ] `toIsoDay(date: Date)` returns "YYYY-MM-DD" string
- [ ] `isWeekend(date: Date)` returns true for Saturday/Sunday
- [ ] `isValidDateRange(startDate, endDate)` validates `startDate <= endDate`
- [ ] `getDaysInRange(startDate, endDate)` returns array of all dates
- [ ] All functions handle invalid inputs gracefully
- [ ] Utilities exported from feature service or shared lib

---

### 013-task-signature-modal

**Identifier:** `013-task-signature-modal`

**Description:**
Create a modal component with a canvas-based signature pad where users can draw their signature, clear it, and save it as a data URL.

**Constraints:**

- Use signature-pad React package
- Provide clear signature area with enough space
- Include clear, undo, and save buttons
- Modal wraps the signature component

**Acceptance Criteria:**

- [ ] `SignatureModal.tsx` component created
- [ ] Uses shared Modal component
- [ ] Canvas signature pad renders and accepts drawing
- [ ] "Clear" button wipes signature canvas
- [ ] "Save" button saves signature as data URL to store
- [ ] "Cancel" button closes modal without saving
- [ ] Signature displays preview after capture
- [ ] Modal controlled by Zustand `isSignatureModalOpen` state

---

### 014-task-leave-request-form

**Identifier:** `014-task-leave-request-form`

**Description:**
Create the main form component using React Hook Form with Zod resolver, integrating all form sections and validation.

**Constraints:**

- Use React Hook Form with Zod resolver
- Sync initial values with Zustand store
- Handle form submission and validation
- Persist valid profile data to store

**Acceptance Criteria:**

- [ ] `LeaveRequestForm.tsx` created with React Hook Form setup
- [ ] Zod resolver configured with `LeaveRequestSchema`
- [ ] Form integrates PersonalDetailsSection, EmploymentDetailsSection, LeaveDetailsSection
- [ ] Form includes signature capture button
- [ ] Form submission validates and updates Zustand store
- [ ] Validation errors display for invalid fields
- [ ] Form shows calculated absence days
- [ ] Success/error messages handled

---

### 015-task-leave-request-page

**Identifier:** `015-task-leave-request-page`

**Description:**
Create the page component that wraps the form and manages overall layout, header, and page-level state.

**Constraints:**

- Page acts as container for the feature
- Include header with title and actions
- Responsive layout for mobile/desktop
- Load holidays and initial data on mount

**Acceptance Criteria:**

- [ ] `LeaveRequestPage.tsx` created as page container
- [ ] Page includes header with app title
- [ ] Form rendered within page layout
- [ ] Holidays loaded from service on page mount
- [ ] Page styled with max-width and centering
- [ ] Responsive single-column on mobile, multi-column on desktop
- [ ] Review and generate section included

---

### 016-task-personal-details-section

**Identifier:** `016-task-personal-details-section`

**Description:**
Create the personal details form section with fields for name, email, and phone using shared UI components.

**Constraints:**

- Use shared Input components
- Bind to React Hook Form
- Show validation errors
- Pre-populate from Zustand store if available

**Acceptance Criteria:**

- [ ] `PersonalDetailsSection.tsx` created
- [ ] Fields: fullName (text), email (email type), phone (tel type)
- [ ] Fields registered with React Hook Form
- [ ] Email field validates email format
- [ ] Validation errors display below fields
- [ ] Initial values loaded from Zustand profile
- [ ] Section styled with Card component
- [ ] Field labels clear and descriptive

---

### 017-task-employment-details-section

**Identifier:** `017-task-employment-details-section`

**Description:**
Create the employment details form section with fields for employee ID, department, and position.

**Constraints:**

- Use shared Input components
- Bind to React Hook Form
- Pre-populate from Zustand store if available
- Match personal details styling

**Acceptance Criteria:**

- [ ] `EmploymentDetailsSection.tsx` created
- [ ] Fields: employeeId (text), department (text), position (text)
- [ ] Fields registered with React Hook Form
- [ ] Validation errors display below fields
- [ ] Initial values loaded from Zustand profile
- [ ] Section styled with Card component
- [ ] Consistent styling with PersonalDetailsSection

---

### 018-task-leave-details-section

**Identifier:** `018-task-leave-details-section`

**Description:**
Create the leave details form section with leave type selector, date range picker, and reason textarea.

**Constraints:**

- Use shared Select for leave type
- Integrate DateRangeField for date selection
- Use shared Textarea for reason
- Display calculated absence days

**Acceptance Criteria:**

- [ ] `LeaveDetailsSection.tsx` created
- [ ] Leave type dropdown with options: annual, sick, unpaid, other
- [ ] DateRangeField component integrated
- [ ] Reason textarea with optional validation
- [ ] Calculated absence days displayed (weekends and holidays excluded)
- [ ] Fields registered with React Hook Form
- [ ] Validation errors displayed
- [ ] Section styled with Card component

---

### 019-task-date-range-field

**Identifier:** `019-task-date-range-field`

**Description:**
Create a date range picker component that displays a calendar, allows selecting start and end dates, highlights holidays, and updates absence calculation.

**Constraints:**

- Use date picker library (react-day-picker or similar)
- Highlight holidays with distinct style
- Validate date range (start <= end)
- Update absence days calculation on change

**Acceptance Criteria:**

- [ ] `DateRangeField.tsx` component created
- [ ] Calendar displays with start and end date selection
- [ ] Holidays highlighted with distinct style (e.g., colored background)
- [ ] Holiday dates passed from holiday service
- [ ] Date range validation enforced (start <= end)
- [ ] Absence days updated via Zustand store on date change
- [ ] Weekends visually distinguished
- [ ] Clear visual feedback for selected range

---

### 020-task-holidays-legend

**Identifier:** `020-task-holidays-legend`

**Description:**
Create a legend component that explains holiday highlighting in the date picker and how holidays affect absence day calculations.

**Constraints:**

- Simple, clear visual explanation
- Positioned near date picker
- Consistent with app styling

**Acceptance Criteria:**

- [ ] `HolidaysLegend.tsx` component created
- [ ] Explains holiday highlighting in calendar
- [ ] States that holidays don't count toward absence days
- [ ] Visual indicator (color swatch or icon) matches holiday style
- [ ] Positioned near DateRangeField
- [ ] Text is concise and clear
- [ ] Consistent with app typography

---

### 021-task-review-and-generate

**Identifier:** `021-task-review-and-generate`

**Description:**
Create a review section that displays form summary, provides JSON export/import buttons, and includes the generate PDF button with loading state.

**Constraints:**

- Show summary of all form data
- Export user details as JSON
- Import JSON to restore profile
- Generate PDF with loading animation (min 2 seconds)
- Clear profile option

**Acceptance Criteria:**

- [ ] `ReviewAndGenerate.tsx` component created
- [ ] Displays summary of profile and leave details
- [ ] "Export Profile" button downloads JSON
- [ ] "Import Profile" button allows JSON file upload
- [ ] "Clear Profile" button removes stored data
- [ ] "Generate PDF" button triggers PDF generation
- [ ] Loading spinner shown during generation (min 2 seconds)
- [ ] Error handling for import/export
- [ ] Success message after PDF download

---

### 022-task-pdf-template-types

**Identifier:** `022-task-pdf-template-types`

**Description:**
Define TypeScript types and interfaces for PDF templates including TemplateField, TemplateSection, and TemplateDefinition.

**Constraints:**

- Types must support flexible layouts
- Include page settings, fonts, margins
- Support sections and field positioning

**Acceptance Criteria:**

- [ ] `TemplateField` type defined with label, value mapping, position
- [ ] `TemplateSection` type defined with title, fields, layout metadata
- [ ] `TemplateDefinition` type defined with page settings, fonts, sections, optional logo
- [ ] Types support A4, portrait/landscape
- [ ] Types support custom fonts and sizes
- [ ] Types support coordinate-based positioning or flex-like layouts
- [ ] All types exported from `src/features/leave-request/services/pdf/templates/template.types.ts`

---

### 023-task-default-pdf-template

**Identifier:** `023-task-default-pdf-template`

**Description:**
Create the default PDF template that implements the TemplateDefinition interface with a standard company leave request layout.

**Constraints:**

- Follow TemplateDefinition interface
- Include sections for profile, employment, leave details, dates, signature
- Professional layout with proper spacing

**Acceptance Criteria:**

- [ ] `default.template.ts` exports a TemplateDefinition
- [ ] Template includes header with company placeholder
- [ ] Profile section (name, email, phone, employeeId, department, position)
- [ ] Leave details section (leave type, dates, reason, calculated days)
- [ ] Signature section with signature image placement
- [ ] Professional spacing and typography
- [ ] Fields map to LeaveRequest data structure
- [ ] Template exported for use in PDF service

---

### 024-task-pdf-generation-service

**Identifier:** `024-task-pdf-generation-service`

**Description:**
Implement the PDF generation service that uses jsPDF to render leave request documents based on template definitions.

**Constraints:**

- Use jsPDF or similar library
- Accept template definition and data as inputs
- Generate PDF as Blob or trigger download
- Include signature image if present

**Acceptance Criteria:**

- [ ] `generateLeaveRequestPdf(data, template)` function implemented
- [ ] Creates A4 PDF document with template settings
- [ ] Renders sections and fields according to template
- [ ] Draws signature image if `signatureDataUrl` present
- [ ] Generates filename: `LeaveRequest_<EmployeeId>_<YYYY-MM-DD>.pdf`
- [ ] Returns Blob or triggers download
- [ ] Service exported from `src/features/leave-request/services/pdf/pdf.service.ts`
- [ ] Handles errors gracefully

---

### 025-task-styling-and-animations

**Identifier:** `025-task-styling-and-animations`

**Description:**
Implement responsive styling, form enter animation, and loading spinner with smooth transitions.

**Constraints:**

- Modern styling approach (utility CSS or component library)
- Smooth enter animation on form mount (250-400ms)
- Visually rich custom spinner for PDF generation
- Responsive layout (mobile single-column, desktop multi-column)

**Acceptance Criteria:**

- [ ] App uses modern styling solution consistently
- [ ] Form has fade-in + upward motion animation on mount
- [ ] Animation duration 250-400ms, smooth and jank-free
- [ ] Loading spinner is custom animation (not default browser loader)
- [ ] Responsive layout: single column on mobile, two-column grouping on desktop
- [ ] Max-width container with centering
- [ ] Clear visual hierarchy with cards for sections
- [ ] Large, readable typography
- [ ] Focus states on interactive elements

---

### 026-task-pwa-configuration

**Identifier:** `026-task-pwa-configuration`

**Description:**
Configure PWA features including manifest file, service worker registration, and offline support.

**Constraints:**

- App must be installable on supported browsers
- Must work offline after first load
- Use Vite PWA plugin
- Include app icons

**Acceptance Criteria:**

- [ ] `manifest.webmanifest` created with name, icons, start_url, display: standalone
- [ ] App icons (192x192, 512x512) included
- [ ] Service worker configured via Vite PWA plugin
- [ ] App caches shell and static assets
- [ ] App works offline (form accessible, PDF generation works)
- [ ] Install prompt surfaces when supported
- [ ] Theme color and background color consistent with app theme
- [ ] PWA manifest linked in HTML

---

### 027-task-integration-tests

**Identifier:** `027-task-integration-tests`

**Description:**
Write integration tests for key user flows: new user journey, returning user, JSON import/export, holiday highlighting and counting.

**Constraints:**

- Use appropriate testing framework (Vitest, Playwright, etc.)
- Test end-to-end user flows
- Cover happy paths and error cases

**Acceptance Criteria:**

- [ ] New user journey test: fill form, select dates, sign, generate PDF
- [ ] Returning user test: form loads with prefilled profile from localStorage
- [ ] JSON export test: export profile, verify file content
- [ ] JSON import test: clear profile, import JSON, verify fields restored
- [ ] JSON import error test: import invalid JSON, show error message
- [ ] Holiday highlighting test: range containing 0, 1, multiple holidays
- [ ] Holiday counting test: verify absence days exclude holidays and weekends
- [ ] All tests pass consistently

---

### 028-task-unit-tests

**Identifier:** `028-task-unit-tests`

**Description:**
Write unit tests for Zod schemas, holiday system, and PDF service smoke tests.

**Constraints:**

- Test schemas with valid and invalid data
- Test holiday loading, validation, and helpers
- Smoke test PDF service without file output

**Acceptance Criteria:**

- [ ] `UserProfileSchema` tests: valid and invalid profile data
- [ ] `LeaveRequestSchema` tests: valid requests, date ordering validation
- [ ] `HolidayListSchema` tests: valid ISO dates, invalid formats
- [ ] Holiday system tests: loading holidays.json, isHoliday behavior
- [ ] Absence calculator tests: no holidays, holidays at start/end
- [ ] PDF service smoke test: runs without throwing with template and data
- [ ] All tests pass consistently
- [ ] Good test coverage (>80% for core logic)

---

### 029-task-accessibility

**Identifier:** `029-task-accessibility`

**Description:**
Ensure the application is accessible with keyboard navigation, screen reader support, and proper contrast.

**Constraints:**

- WCAG AA compliance where feasible
- All interactive elements keyboard accessible
- Proper ARIA labels and roles
- Sufficient color contrast

**Acceptance Criteria:**

- [ ] All inputs and buttons keyboard navigable
- [ ] Modals close with Escape key
- [ ] Date picker keyboard accessible
- [ ] Signature modal keyboard accessible
- [ ] Screen reader labels on all form fields
- [ ] ARIA labels on interactive elements
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus order logical and consistent

---

### 030-task-build-and-deployment

**Identifier:** `030-task-build-and-deployment`

**Description:**
Configure production build, ensure static assets are optimized, and document deployment requirements.

**Constraints:**

- Production build must be optimized
- Static assets properly output to dist/
- Service worker scope correct
- HTTPS ready

**Acceptance Criteria:**

- [ ] `npm run build` produces static assets in `dist/`
- [ ] Build is optimized (minified, tree-shaken)
- [ ] Service worker and manifest included in dist/
- [ ] Build output tested locally (served via static server)
- [ ] All paths and assets load correctly in production build
- [ ] Deployment documented (hosting, HTTPS, headers)
- [ ] Content-Type headers specified for JS, CSS, JSON
- [ ] Service worker scope is correct

---

## Summary

Total Tasks: 30

### Task Categories

- **Infrastructure & Setup:** Tasks 001-003
- **Shared Layer:** Tasks 004-006
- **Domain & State:** Tasks 007-009
- **Holidays & Logic:** Tasks 010-012
- **Form Features:** Tasks 013-021
- **PDF Generation:** Tasks 022-024
- **UX & PWA:** Tasks 025-026
- **Testing & Quality:** Tasks 027-030

### Task Dependencies

Tasks are numbered sequentially to indicate build order. Each task should be completed before moving to the next one to ensure dependencies are available when needed.

---

### 031-task-tailwind-installation

**Identifier:** `031-task-tailwind-installation`

**Description:**
Install TailwindCSS, PostCSS, and autoprefixer as development dependencies for the project.

**Constraints:**

- Use npm for package installation
- Install latest stable versions compatible with Vite
- Include types where available

**Acceptance Criteria:**

- [ ] `tailwindcss` package installed
- [ ] `postcss` package installed
- [ ] `autoprefixer` package installed
- [ ] All packages listed in `package.json` devDependencies
- [ ] No installation errors or conflicts

---

### 032-task-tailwind-configuration

**Identifier:** `032-task-tailwind-configuration`

**Description:**
Configure TailwindCSS with PostCSS and integrate existing design tokens from globals.css into Tailwind theme configuration.

**Constraints:**

- Use existing CSS variables for theme configuration
- Maintain current color scheme and spacing scale
- Configure content paths for all source files
- Use PostCSS with Tailwind and autoprefixer

**Acceptance Criteria:**

- [ ] `tailwind.config.js` created with theme configuration
- [ ] `postcss.config.js` created with Tailwind and autoprefixer plugins
- [ ] Colors from globals.css migrated to Tailwind theme
- [ ] Spacing scale from globals.css migrated to Tailwind theme
- [ ] Typography scale from globals.css migrated to Tailwind theme
- [ ] Border radius from globals.css migrated to Tailwind theme
- [ ] Content paths configured for `src/**/*.{js,jsx,ts,tsx}`
- [ ] Configuration preserves existing design tokens

---

### 033-task-tailwind-css-import

**Identifier:** `033-task-tailwind-css-import`

**Description:**
Replace existing CSS imports with Tailwind directives and ensure proper setup in main entry point.

**Constraints:**

- Replace globals.css with Tailwind directives
- Keep essential CSS (custom animations, accessibility utilities)
- Update main.tsx to import new CSS file

**Acceptance Criteria:**

- [ ] `src/index.css` updated with `@tailwind base`, `@tailwind components`, `@tailwind utilities`
- [ ] Custom animations (fadeInUp, pulse-dot) preserved in Tailwind layer
- [ ] Accessibility utilities (sr-only, focus-visible) preserved in Tailwind layer
- [ ] Container utility class preserved
- [ ] globals.css replaced with Tailwind version
- [ ] main.tsx imports updated CSS file correctly
- [ ] No duplicate CSS rules

---

### 034-task-tailwind-shared-components-migration

**Identifier:** `034-task-tailwind-shared-components-migration`

**Description:**
Migrate all shared UI components (Button, Input, Select, Textarea, Modal, Spinner, Card, Alert) to use Tailwind utility classes instead of inline styles.

**Constraints:**

- Preserve all component variants and functionality
- Use Tailwind utility classes for all styling
- Remove inline style objects where possible
- Maintain component prop interfaces

**Acceptance Criteria:**

- [ ] `Button.tsx` uses Tailwind utilities for variants and sizes
- [ ] `Input.tsx` uses Tailwind utilities for styling and error states
- [ ] `Select.tsx` uses Tailwind utilities for styling and error states
- [ ] `Textarea.tsx` uses Tailwind utilities for styling and error states
- [ ] `Modal.tsx` uses Tailwind utilities for backdrop and content styling
- [ ] `Spinner.tsx` uses Tailwind utilities for animation
- [ ] `Card.tsx` uses Tailwind utilities for container styling
- [ ] `Alert.tsx` uses Tailwind utilities for variants (info, success, warning, error)
- [ ] All components maintain previous functionality
- [ ] No inline style objects remain (except for dynamic values)

---

### 035-task-tailwind-cleanup-globals

**Identifier:** `035-task-tailwind-cleanup-globals`

**Description:**
Clean up and remove redundant CSS from globals.css that is now handled by Tailwind, keeping only necessary custom styles.

**Constraints:**

- Remove styles now covered by Tailwind
- Keep custom animations and utilities
- Keep reduced motion media query
- Maintain accessibility utilities

**Acceptance Criteria:**

- [ ] Duplicate CSS variables removed (colors, spacing, typography now in Tailwind)
- [ ] Reset styles removed (Tailwind Preflight handles this)
- [ ] Custom animations (fadeInUp, pulse-dot) preserved
- [ ] Accessibility utilities (sr-only, focus-visible) preserved
- [ ] Container utility preserved
- [ ] Reduced motion media query preserved
- [ ] File is clean and well-documented
- [ ] No unused CSS rules remain

---

### 036-task-tailwind-validation-and-testing

**Identifier:** `036-task-tailwind-validation-and-testing`

**Description:**
Run tests and verify that the TailwindCSS migration is complete and all functionality works correctly.

**Constraints:**

- All existing tests must pass
- Styling must match previous appearance
- Responsive behavior must work correctly
- No console errors related to styling

**Acceptance Criteria:**

- [ ] `npm run test` passes with all tests
- [ ] `npm run lint` passes without new errors
- [ ] `npm run typecheck` passes
- [ ] Development server starts without errors
- [ ] All components render with correct styling
- [ ] Responsive layout works on mobile and desktop
- [ ] Animations work smoothly
- [ ] Form validation displays correctly
- [ ] Modals open and close properly
- [ ] No CSS conflicts or missing styles
- [ ] Application works as expected visually

---

## Summary

Total Tasks: 36 (including 6 new TailwindCSS tasks)

### Task Categories

- **Infrastructure & Setup:** Tasks 001-003
- **Shared Layer:** Tasks 004-006
- **Domain & State:** Tasks 007-009
- **Holidays & Logic:** Tasks 010-012
- **Form Features:** Tasks 013-021
- **PDF Generation:** Tasks 022-024
- **UX & PWA:** Tasks 025-026
- **Testing & Quality:** Tasks 027-030
- **TailwindCSS Migration:** Tasks 031-036

### Task Dependencies

Tasks are numbered sequentially to indicate build order. Each task should be completed before moving to the next one to ensure dependencies are available when needed.

TailwindCSS migration tasks (031-036) should be completed in sequence to ensure proper setup and testing.
