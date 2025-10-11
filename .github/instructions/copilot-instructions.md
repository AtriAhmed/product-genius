---
applyTo: "**"
---

# INSTRUCTIONS.md

- Do not add a summaries and explanations of what you did, only mention crucial information.
- Do not run terminal commands. If something requires a shell command (install, delete, rename, build), mention it at the end with a note like:  
  _“You need to run `npm install <package>` manually.”_
- Do not declare new types in components. All shared types must go in `@/types/index.ts`.
- Always use Axios for HTTP requests.
- Always use Zod for validation in API routes and forms. Reuse schemas when possible.
- If a function will be reused across files (e.g., date formatting), put it in a utils file and import it where needed.
- Use types instead of interfaces.
- Before you start working, always say "read instructions file" to indicate that you read it.
- Be concise and focused. Do not add long explanations or summaries.
