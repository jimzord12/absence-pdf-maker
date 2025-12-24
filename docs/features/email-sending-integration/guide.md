Integrating EmailJS into a modern Vite + React + TypeScript environment allows you to handle email delivery without a dedicated backend server. This guide uses the latest `@emailjs/browser` SDK and best practices for TypeScript types and environment security.[1][2][3]

### Prerequisites and Setup

Before coding, create an EmailJS account and configure your delivery pipeline.[4]

- **Create Service:** Add an "Email Service" (e.g., Gmail or Outlook) and connect your account.[5][6]
- **Define Template:** Create an Email Template with placeholders like `{{from_name}}` and `{{message}}` to match your form fields.[5]
- **Install SDK:** Run the command `npm install @emailjs/browser` in your Vite project directory.[1]
- **Environment Variables:** Create a `.env` file in your root folder to store your public identifiers.[7]
  ```env
  VITE_EMAILJS_SERVICE_ID=your_service_id
  VITE_EMAILJS_TEMPLATE_ID=your_template_id
  VITE_EMAILJS_PUBLIC_KEY=your_public_key
  ```

### TypeScript Form Implementation

Using `useRef` with a specific `HTMLFormElement` type ensures type safety when interacting with the DOM for form submissions.[3][8]

```tsx
import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

const ContactForm: React.FC = () => {
  const form = useRef<HTMLFormElement | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.current) return;

    setIsSending(true);

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        alert('Message sent successfully!');
        form.current?.reset();
      })
      .catch(error => {
        console.error('Failed to send email:', error.text);
      })
      .finally(() => setIsSending(false));
  };

  return (
    <form ref={form} onSubmit={sendEmail}>
      <input type="text" name="user_name" placeholder="Name" required />
      <input type="email" name="user_email" placeholder="Email" required />
      <textarea name="message" placeholder="Your Message" required />
      <button type="submit" disabled={isSending}>
        {isSending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
};
```

### Direct SDK Method

If you prefer not to use a physical form ref, you can send dynamic data directly using the `send` method with a custom data object.[3]

- **Data Interface:** Define a TypeScript interface like `interface ContactData { to_name: string; from_name: string; message: string; }` to validate your payload.[4][3]
- **Call Method:** Use `emailjs.send(serviceID, templateID, templateParams, publicKey)` to trigger the email with any JSON data.[3]
- **Global Init:** For better performance, you can initialize the SDK once at the top level of your app using `emailjs.init(publicKey)`.[9][3]

### Best Practices for Vite

Vite requires specific prefixes for environment variables to ensure they are bundled correctly for the client.[7]

- **Variable Prefix:** Always use the `VITE_` prefix for your variables, or they will be ignored by Vite's build process.[7]
- **Ref Initialization:** Always initialize `useRef<HTMLFormElement>(null)` with `null` to avoid "property 'ref' does not exist" TypeScript errors.[8]
- **Client Visibility:** Remember that these keys will be visible in the browser's "Network" tab, so enable **reCAPTCHA** in the EmailJS dashboard for production apps.[10][7]

[1](https://www.emailjs.com/docs/sdk/installation/)
[2](https://github.com/emailjs-com/emailjs-sdk)
[3](https://mailtrap.io/blog/typescript-send-email/)
[4](https://dev.to/donsmog/how-to-use-emailjs-for-a-contact-us-page-287p)
[5](https://dev.to/wilsonsiaw/tutorial-react-emailjs-36bl)
[6](https://www.youtube.com/watch?v=wWiTouBHibs)
[7](https://mailtrap.io/blog/emailjs-react/)
[8](https://www.youtube.com/watch?v=QmBEbRiLGaw)
[9](https://www.npmjs.com/package/@emailjs/browser)
[10](https://www.emailjs.com)
[11](https://www.emailjs.com/docs/examples/reactjs/)
[12](https://react.email/docs/introduction)
[13](https://github.com/emailjs-com/emailjs-sdk/blob/main/README.md)
[14](https://dapoadedire.hashnode.dev/setting-up-emailjs-with-a-react-app)
[15](https://www.reddit.com/r/reactjs/comments/1o80f1j/emailjs_react_tutorial_with_code_snippets_2025/)
[16](https://www.emailjs.com/docs/)
[17](https://www.youtube.com/watch?v=7Iw3jThgD34)
[18](https://sendlayer.com/blog/how-to-send-emails-with-react/)
[19](https://www.npmjs.com/package/@emailjs/browser?activeTab=readme)
[20](https://stackoverflow.com/questions/71727710/using-emailjs-in-reactnot-typescript)
