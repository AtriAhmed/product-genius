---
applyTo: "**/*.ts"
---

Backend API rules:

- Data-fetching API routes that return multiple items (with pagination) must always return the following structure:
  ```json
  {
    "data": [],
    "total": 0,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
  ```
