# Review & QA Notes

- The Error for the Toast Notification about `exceedsAllowance` needs to updated to a more user-friendly message. Likely something along the lines of "You have exceeded your Leave Days allowance.". Also, create a greel version as well.

- The `Leave Allowance (Days)` field in the `personal-details-heading` form should be optional. Only apply the validation if the field is filled out. (Obviously, when implemented write unit tests.)

- All Components must have the `aria-label` attribute to allow the developers to easily identify them via the ChromeDevTools Elements tab.

- The PWA Install modal would use a better design. Surely better spacing. What is most important is that we do not want to annoy the user with the modal.

- Regarding the Holidays styling on React Date Pickers, they should be more prominent. Use a different light background color depending on the theme. I do like that fact the the number is bold.

- In Dark mode, the Start and Finish date cells on the React Date Picker have very low contrast. Please improve the contrast. An easy fix might be to make the number a darker color.

- In Dark mode, the primary color is a purple shade. This color does not have enough contrast against the dark background. Please select a different lighter shade color for better contrast.

- The `PDF Language:` dropdown label (for change the generated PDF language) has not Dark mode styling. Thus is almost invisible in Dark mode. Please fix. The same goes for the `Language:` dropdown responsible for changing the app language.

- Remove the `Reset Form` Buttom from the end of the page and place it inside the `review-actions-heading` next to the other 3 action buttons.

- Write E2E happy path tests for the App. The tests should also contain checks for accessibility using axe-core. And also contain the optional fields like (Leave Allowance Days).
