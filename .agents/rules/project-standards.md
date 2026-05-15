---
trigger: always_on
---

* This is a Vite + React project using JavaScript
* Read DESIGN.md for the design system — all colors, fonts, spacing,
  and component patterns must come from there
* Generate CSS custom properties (variables) in src/styles/globals.css
  based on the DESIGN.md tokens
* Components go in src/components/ with each component in its own folder
* Page components go in src/pages/
* Use React Router for navigation between pages
* All data is placeholder/dummy — no API calls, no backend
* The HTML files in the workspace root are reference designs exported from
  our design tool — match their look and layout when building React components
* After making changes, always verify in the browser that the result
  visually matches the reference HTML files
* Never build an entire page as a single monolithic component — always
  follow the component breakdown specified by the user