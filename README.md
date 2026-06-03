# SOA GATE Static Demo

This folder is a front-end-only clone of the CS4GATE website for GitHub Pages.

## License

Copyright (c) 2026 Sk Owashif Ahamed. All rights reserved.

This project is provided for viewing and portfolio purposes only. No permission is granted to copy, modify, distribute, or use this code without written permission from the copyright holder. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

It uses:

- HTML, CSS, and JavaScript only
- `static-data.js` for seeded courses, questions, users, and theme settings
- `static-api.js` to emulate the original PHP API in the browser
- `static-question-pages.js` to keep question-library and course pages synchronized with browser data
- `localStorage` for users, progress, bookmarks, comments, notes, admin edits, and design settings

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@cs4gate.demo` | `admin123` |
| Free student | `free@cs4gate.demo` | `free123` |
| Paid student | `paid@cs4gate.demo` | `paid123` |

## Run Locally

Open this folder with any static web server. Do not open the HTML files directly with `file://`, because browser storage and navigation behavior can differ.

Example:

```powershell
cd github-pages-clone
npx serve .
```

## Deploy To GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this folder to the repository root.
3. Open repository **Settings > Pages**.
4. Set the source to **Deploy from a branch**.
5. Select the branch and `/ (root)` folder.

## Static Demo Limits

- Data is stored per browser/device in `localStorage`.
- Admin edits do not change files in the GitHub repository.
- New questions appear in dynamic dashboards, search, interactive question views, and course/library pages, but the browser cannot create new permanent SEO HTML files in the repository.
- Email sending and real password recovery are simulated.
- Uploaded media cannot be published as new repository files from the browser.
- Demo passwords are intentionally visible in `static-data.js`; this clone is not a secure production authentication system.

Reset all demo data from the browser console:

```js
CS4StaticDemo.reset()
```
