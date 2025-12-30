Make a plan to implement dark mode support in the application. Consider the following aspects:
The main primary colors for dark mode should be light purple and dark purple.
Ensure that all text is easily readable against the dark backgrounds.
Follow best practices for accessibility, including sufficient color contrast.

Additionaly, add a toggle switch in the user settings to allow users to switch between light and dark modes.

The default mode should be light mode, but if the user has a system preference for dark mode, the application should respect that on the first load.

Finally, this setting should persist across sessions, so if a user selects dark mode, it should remain in dark mode on subsequent visits until they change it back to light mode. I think we use some Zustand feature for persisting settings somewhere.
