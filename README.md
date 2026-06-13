# VTT Slicer

VTT Slicer is a browser app for preparing virtual tabletop maps for print. Upload an image, tune the output size and grid, preview the page slices, then export a PDF.

## Run Locally

Install dependencies:

```powershell
npm install
```

Start the web app:

```powershell
npm run dev
```

Vite will print a local address such as `http://localhost:5173/`. Open that address in a browser.

## Build For The Web

Create a production build:

```powershell
npm run build
```

The finished static site is written to `dist/`. You can host that folder with any static web host.

Preview the production build locally:

```powershell
npm run preview
```

## Deploy On Cloudflare Pages

This repo is ready for Cloudflare Pages using the GitHub integration.

In Cloudflare:

1. Go to **Workers & Pages**.
2. Choose **Create application**.
3. Choose **Pages**.
4. Choose **Import an existing Git repository**.
5. Connect the GitHub repo: `hayesjm/vtt_slicer`.
6. Use these build settings:

| Setting | Value |
| --- | --- |
| Framework preset | React or Vite |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node version | `22.16.0` |

Cloudflare will build and deploy the site automatically whenever changes are pushed to the production branch.

## Deploy On Cloudflare Workers

Cloudflare's newer Worker project setup uses `wrangler.jsonc` instead of a separate "build output directory" field. The `wrangler.jsonc` file in this repo tells Cloudflare to deploy `dist/` as static assets.

Use these settings on the Worker setup screen:

| Setting | Value |
| --- | --- |
| Project name | `vtt-slicer` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler versions upload` |
| Path | `/` |

Leave the extra environment variable fields blank unless you add features that need secrets later.
