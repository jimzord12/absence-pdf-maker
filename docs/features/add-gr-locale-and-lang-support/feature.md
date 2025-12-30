Blocks: docs/issues/draft/009-Change-DatePicker-Format.md

# Greek Locale and Language Support

The primary users are Greeks, thus adding Greek ('gr') locale and language support is essential for better user experience.

The applicaiton should however support both Greek and English languages, allowing users to switch between them as needed. Greek being the default language.

Use the Zustand store to manage the current locale and language settings across the application. This is vital as other Components, such as DatePickers, will rely on this setting to display dates in the correct format.
