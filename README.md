# Horizon Web Demo Generator

A browser-based tool for building Horizon sales demos. Upload a prepared website or app screenshot, place Horizon embed hotspots over blank areas, paste Horizon code snippets, preview live, and export a deployment-ready ZIP.

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B — GitHub import

1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) → Import the repo.
3. Framework preset: **Vite** (auto-detected).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**.

No environment variables required. The app is fully static.

---

## Project structure

```
horizon-demo-generator/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── vercel.json          # SPA rewrite rule
└── src/
    ├── main.tsx
    ├── App.tsx           # Main component — all state & event handlers
    ├── types.ts          # TypeScript interfaces
    ├── utils.ts          # Pure utilities (slug, height, clamp)
    └── components/
        ├── TopBar.tsx        # Top bar with mode tabs + action buttons
        ├── HotspotBox.tsx    # Single hotspot — edit & preview modes
        ├── RightPanel.tsx    # Hotspot settings panel
        ├── ExportModal.tsx   # Brand slug input + ZIP export
        └── EmbedBox.tsx      # Executes pasted HTML+script embed code
```

---

## How it works

### Web Demo mode
1. Upload a prepared website screenshot (PNG/JPG — blank areas already cut in Figma).
2. Click **Add Hotspot** — a draggable rectangle appears over the screenshot.
3. Drag to position, drag the east/west handles to adjust width.
4. Select **Entry Point Type**: Rectangle Row (550 px ref height) or Circle Row (240 px ref height). Height is locked and scales with screenshot width from a 1920 px reference.
5. Paste the Horizon embed snippet into **Horizon Embed Code**.
6. Click **Preview** to see the live embed render.
7. Click **Export HTML** → enter a brand slug → download `{slug}.zip`.

### App Demo mode
Same workflow, but the screenshot is shown inside a CSS phone frame (390 × auto). Hotspots are positioned relative to the phone screen area.

### Exported ZIP structure
```
{slug}.zip
└── {slug}/
    ├── index.html   ← fully self-contained, no backend needed
    └── assets/      ← placeholder for any manual assets
```

Deploy by extracting the ZIP and placing the folder at:
```
public/demo/{slug}/
```

Live URL: `https://horizonexp.com/demo/{slug}/`

---

## Key implementation notes

### Embed code execution (EmbedBox.tsx)
`dangerouslySetInnerHTML` does not execute `<script>` tags. EmbedBox uses a `useEffect` to parse the pasted HTML, re-create every `<script>` tag imperatively, and append it — so both external `src` scripts and inline scripts execute correctly.

### Hotspot height locking
Heights are derived from `getLockedHeight(type, imgW)` in `utils.ts`:

| Type            | Reference height | Reference width |
|-----------------|-----------------|-----------------|
| Rectangle Row   | 550 px          | 1920 px         |
| Circle Row      | 240 px          | 1920 px         |

Actual locked height = `referenceHeight × (uploadedImageWidth / 1920)`.

### Drag/resize
Global `mousemove`/`mouseup` listeners are set up once in `useEffect([]))`. They write to `dsRef` (drag state ref) and call `setDemos` with a functional updater — no stale closure issues. Only east and west resize handles are exposed; height is never resizable.

### Export format
Hotspot positions are stored as pixel coordinates relative to the uploaded image and exported as CSS percentages (`left/top/width/height`) so the demo scales with the screenshot at any viewport width.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| react, react-dom | UI |
| jszip | In-browser ZIP generation |
| vite + @vitejs/plugin-react | Dev server + build |
| typescript | Type safety |
