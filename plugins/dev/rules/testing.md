---
paths:
  - "**/*.test.*"
  - "**/*.spec.*"
---

# Testing rule

- One behaviour per test; name tests after the behaviour, not the method.
- Arrange / Act / Assert, separated by a blank line.
- No network or clock in unit tests — inject them.
