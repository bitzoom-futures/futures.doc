# PDF Generation Guide

How to generate PDF versions of the guide `.md` files.

## Prerequisites

1. **Node.js** installed
2. **Playwright** installed in `/tmp`:

```bash
cd /tmp && npm install playwright
```

## Usage

The conversion script is at `/tmp/md_to_pdf.js`.

To generate a PDF, edit the last lines of the script to specify which `.md` file to convert:

```js
(async () => {
  await convert('WALLET_SETUP_GUIDE.md', 'WALLET_SETUP_GUIDE.pdf');
})();
```

Then run:

```bash
cd /tmp && node md_to_pdf.js
```

The PDF will be saved in this folder (`docs/guide/`).

## How It Works

1. Reads the `.md` file
2. Embeds all referenced images as base64 so Playwright can render them
3. Converts basic markdown syntax to HTML (the `.md` files are mostly HTML tables already)
4. Splits by `<hr>` -- the first part becomes a centered title page, each remaining part becomes a full-page section
5. Uses Playwright's `page.pdf()` to print as landscape A4, one section per page

## Available Guides

| Markdown | PDF |
|----------|-----|
| `USER_GUIDE.md` | `USER_GUIDE.pdf` |
| `WEB_USER_GUIDE.md` | `WEB_USER_GUIDE.pdf` |
| `WALLET_SETUP_GUIDE.md` | `WALLET_SETUP_GUIDE.pdf` |

## Generating All PDFs

To regenerate all PDFs at once, update the script to include all guides:

```js
(async () => {
  await convert('USER_GUIDE.md', 'USER_GUIDE.pdf');
  await convert('WEB_USER_GUIDE.md', 'WEB_USER_GUIDE.pdf');
  await convert('WALLET_SETUP_GUIDE.md', 'WALLET_SETUP_GUIDE.pdf');
})();
```

## Notes

- Screenshots must exist in the referenced paths (e.g., `wallet-screenshots/`, `web-screenshots/`) before generating
- The script inlines all images as base64, so the PDF is self-contained
- Output is landscape A4 with a purple-themed title page
- Images have **no border or shadow** (`border-radius: 0; box-shadow: none;`) -- do not add gray borders back
