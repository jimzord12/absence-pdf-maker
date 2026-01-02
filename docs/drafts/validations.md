To accommodate the recent changes in Greek identification documents, here is the research on current formats followed by the requested **Zod** schemas.

## 1. Identification Formats in Greece (2026)

### Greek Citizenship ID (Αστυνομική Ταυτότητα)

The ID card has transitioned into a "biometric" European-style credit card format (ID-1).

- **Old Format (Handwritten/Blue Paper):** \* **Structure:** 1 Greek letter followed by a dash and 6 digits (e.g., `Φ-123456`) **OR** 2 Greek letters followed by a dash and 6 digits (e.g., `ΑΒ-123456`).
- **Letters used:** Only Greek characters are used.

- **New Format (Biometric/Credit Card):** \* **Structure:** 2 Latin/Greek "shared" characters followed by a dash and 6 digits (e.g., `AB-123456`).
- **Letters used:** Only characters that look identical in both the Greek and Latin alphabets are permitted: **A, B, E, Z, H, I, K, M, N, O, P, T, Y, X**.

- **The "Personal Number" (Προσωπικός Αριθμός):** Since June 2025, a new 12-digit PIN is being added to IDs to replace AFM and AMKA, though the "ID Number" (described above) still exists as the document's primary serial identifier.

### Greek Passport (Διαβατήριο)

The passport format has remained consistent as it already followed international ICAO standards.

- **Structure:** 2 Capital Latin letters followed by 7 digits.
- **Example:** `AN1234567`.
- **Constraint:** No spaces or dashes are used in the passport number.

---

## 2. Zod Schemas

You can use the following schemas for your form. I have included a "smart" ID schema that handles both the old and new patterns.

### ID Card Schema

```typescript
import { z } from 'zod';

// regex for common Greek/Latin characters: A, B, E, Z, H, I, K, M, N, O, P, T, Y, X
const commonChars = 'ABEZHIKMNOPTYX';

const greekIdSchema = z.string().refine(
  val => {
    // New Format: 2 shared letters + dash + 6 up to 12 digits
    const newFormat = new RegExp(`^[${commonChars}]{2}-\\d{6,12}$`); // e.g., AB-123456 or AB-123456789012
    // Old Format: 1-2 Greek letters + dash + 6 digits
    const oldFormat = /^[Α-Ω]{1,2}-\d{6}$/; // e.g., Φ-123456 or ΑΒ-123456

    return newFormat.test(val) || oldFormat.test(val);
  },
  {
    message: 'Invalid ID format. Expected format like AB-123456 or Φ-123456.',
  }
);
```

### Passport Schema

```typescript
import { z } from 'zod';

const greekPassportSchema = z.string().regex(/^[A-Z]{2}\d{7}$/, {
  message:
    'Invalid Passport format. Must be 2 capital letters followed by 7 digits (e.g., AN1234567).',
});
```

---

### Implementation Tip

If your form needs to be flexible, users often forget the dash in ID cards. You might want to use `.transform()` to sanitize the input by removing spaces or ensuring the dash is present before validation.
