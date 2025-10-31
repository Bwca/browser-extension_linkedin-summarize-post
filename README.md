# LinkedIn Post Summarizer Extension

A browser extension to summarize LinkedIn posts.

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

This will compile the TypeScript files and output them to the `dist` folder.

### Development Mode

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

### Load the Extension

1. Run `npm run build` to create the `dist` folder (this automatically copies all necessary files)
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder
6. Navigate to LinkedIn to see the extension in action

## Structure

```
├── src/
│   ├── background.ts      # Background service worker
│   ├── content.ts         # Content script (runs on LinkedIn pages)
│   ├── manifest.json      # Extension manifest
│   ├── popup.html         # Popup UI
│   └── icons/             # Extension icons (add your own)
├── scripts/
│   └── post-build.js      # Script to copy static files after build
├── dist/                  # Build output (generated)
├── tsup.config.ts         # Build configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

## Loading in Browser

After building, you can load the extension:

**Chrome/Edge:**
1. Navigate to `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder

The extension will now appear in your browser and will activate on LinkedIn pages.

## Next Steps

- Add icon files (16x16, 48x48, 128x128 PNG images to `src/icons/`)
- Implement post detection logic in `content.ts`
- Add summarization functionality
- Create UI for displaying summaries
- Connect to an AI API for actual summarization

