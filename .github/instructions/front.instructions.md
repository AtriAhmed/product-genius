---
applyTo: "**/*.tsx"
---

Next.js frontend rules:

- Pages should only use SSR data fetching if required. Do not add `"use client"` to pages. Pages should call components that may be client-side instead.
- Client-side data fetching should use **SWR** that calls an API route. Always implement **pagination** using the Shadcn pagination component.
- Components should be created in the **same folder as the page** that uses them.
- For shared forms (e.g., "Create" and "Edit"), declare **one reusable form component**. Pass an object prop representing the item to edit; if the object exists, the form is in edit mode, otherwise it's in create mode.
- Forms must always use **Zod** and **React Hook Form**.
- Always use translations with `useTranslations("namespace")`. Translation files are in `@/i18n/messages/en`.
