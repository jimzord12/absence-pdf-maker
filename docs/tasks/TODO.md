# Feature Obeservations

## Issue #00: General Observations

### Bad Points

Currently many of the Section share the same name which makes it hard to identify them and even harder for me to tell you for which one the changes are for. For example:

- Personal Details: This name is used for both the Form Section and the Read-only Summary Section. When I say "Personal Details" I do not know if you refer to the Form or the Summary.
- Leave Details: This name is used for both the Form Section and the Date Range Summary Section. When I say "Leave Details" I do not know if you refer to the Form or the Summary.

#### Error Handling

- You should use "react-toastify" to show error messages to the user. For example, when the PDF generation fails, you should show a toast notification with the error message instead of briefly showing a red box ontop of the "Personal Details" Summary section. This will improve the user experience by providing immediate feedback on errors.

## Issue #01: Import, Export & Clear Profile

### Good Points

- Minor issues generally work as expected. The Import, Export and Clear buttons function correctly.

### Bad Points

- The Export does not include the Signature data. When I export my profile after signing, the signature is not included in the exported JSON file. Convert it into a base64 string and include it in the export. Here is an example:
- The Clear does remove the data from the Read-only Summary, but it does not reset the form fields. After clearing, the form fields still show the previous data. Make sure to reset the form fields to empty state after clearing the profile.
- The Import similarly does not update the Form fields only the Read-only Summary. After importing a profile, the form fields remain empty. Make sure to populate the form fields with the imported data.

```json
{
  "fullName": "Dimitrios Stamatakis",
  "email": "mscres-72@uniwa.gr",
  "phone": "+306944144015",
  "employeeId": "EMP-1234",
  "department": "Engineering",
  "position": "Full-Stack Dev",
  "fathersName": "LALALALALALALALALALALALLAALAL",
  "identityNumber": "1111111111111111111111111111111111111",
  "companyName": "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε"
  // Add signature field here ->  "signature": "data:image/png;base64,iVBORw0KGgoAAAANS
}
```

## Issue #02: Personal Details Section Form

### Good Points

- The form is well-structured into logical sections, making it easy to navigate.
- You correctly insert by Default the Company Name "ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε" in the Employment Details section, reducing user effort.

### Bad Points

- Validation is missing or not working at all. There should be Validation for every single field. For the Identity Number (ADT) use the web to find out the Greek requirements for that field. Note that there multiple types. The validation must be made with zod and zod react-hook-form integration. The trigger should be onBlur for each field, and onSubmit for the entire form. The onSubmit logic should be done when the user tries to generate the PDF.

## Issue #03: Employment Details Section Form

### Bad Points

- Add some reasonable validation for the fields in this section. For example, the Company Name should not be empty, the Position should not be empty, etc.

## Issue #04: Leave Details Section Form

### Bad Points

- The `src/features/leave-request/ui/DateRangeField.tsx` is not utilizing the `data/holidays.json` to show holidays.
- The Service for calculating the business days excluding weekends and holidays is missing, also does NOT utilize the `data/holidays.json` file. You need to implement this service to correctly calculate the number of business days between the selected start and end dates, excluding weekends and holidays.
- There should be a way for the user to clear the selected dates in the Date Range Picker. Currently, once dates are selected, there is no option to clear them and start over. Add a clear button in the some row as "Holidays legend" to allow users to easily reset their date selection.

### Good Points

- The Date Range Summary dynamically updates as I select different start and end dates, providing immediate feedback on the selected range.

## Signature

### Good Points

- To my suprise, the Signature Modal works perfectly. The signature is captured and displayed correctly in the Read-only Summary. And it also persists across page reloads. I do not know if it is correctly embedded in the generated PDF, as I could not generate one yet, but at least this part works flawlessly.

## Issue #05: Locale Support

### Good Points

- The UI Component exists, and it correctly defaults to Greek locale.

### Bad Points

- I cannot switch to English locale. When I press it the drop down appears, but when I select English nothing happens. The locale remains Greek.

## Issue #06: Personal Details Read-only Summary Section

### Good Points

- I like the UI design

### Bad Points

- The text does NOT wrap. So if I enter a long name or email, it overflows outside the container. Make sure the text wraps correctly within the container boundaries. Just apply the Tailwind CSS class for text wrapping.

## Issue #07: PDF Generation

### Bad Points

- It just NOT WORKS! This is the CORE feature of the application, and it is broken. When I try to generate a PDF, I get an error about missing fonts. Please fix this ASAP. The UI displayed error: `Failed to download PDF: Unknown font format`. The console only shows 2 warnings: `Invalid ' ' string child outside <Text> component` and `Cannot read properties of undefined (reading 'isBuffer')`.
