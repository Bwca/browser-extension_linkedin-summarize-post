# LinkedIn Summarizer Extension - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Extension

```bash
npm run build
```

This command:
- Builds the Angular popup app
- Bundles the extension scripts with tsup
- Outputs everything to `dist/linkedin-summarize-post/browser/`

### 3. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the folder: `dist/linkedin-summarize-post/browser/`

### 4. Enable Chrome AI (Required)

For the AI features to work:

1. Navigate to `chrome://flags`
2. Search for **"Prompt API for Gemini Nano"**
3. Set to **"Enabled"**
4. Search for **"Optimization Guide on Device Model"**  
5. Set to **"Enabled BypassPerfRequirement"**
6. **Restart Chrome**
7. Wait for Chrome to download the AI model (happens automatically in background)

### 5. Test It!

1. Go to [LinkedIn](https://www.linkedin.com/feed/)
2. Look for "Summarize" buttons on posts
3. Click one to see the AI analysis in a toast notification

## Development

### Watch Mode (Angular only)

```bash
npm run watch
```

This watches the Angular app but you'll need to manually rebuild extension scripts.

### File Structure

```
src/
├── app/                      # Angular popup application
│   ├── app.ts               # Main component
│   ├── app.html             # Template
│   └── app.scss             # Styles
├── extension-scripts/        # Extension scripts (bundled by tsup)
│   ├── background.ts        # Service worker
│   └── content.ts           # Content script (LinkedIn page)
├── manifest.json            # Extension manifest
└── index.html               # Popup HTML
```

### Build Output

```
dist/linkedin-summarize-post/browser/
├── background.js            # Bundled service worker
├── content.js               # Bundled content script  
├── manifest.json            # Extension manifest
├── index.html               # Angular app HTML
├── main-XXXXXXXX.js        # Angular app JS
└── styles-XXXXXXXX.css     # Angular app CSS
```

## Troubleshooting

### Extension doesn't load
- Make sure you built the project: `npm run build`
- Load the `dist/linkedin-summarize-post/browser/` folder (not the root project folder)
- Check for errors in `chrome://extensions/`

### AI doesn't work
- Verify Chrome flags are enabled (see step 4 above)
- Restart Chrome after enabling flags
- Wait a few minutes for the AI model to download
- Check console for "Chrome AI initialized successfully!"

### Changes not reflected
- Run `npm run build` after making changes
- Click the refresh icon on the extension in `chrome://extensions/`
- Reload the LinkedIn page

## Next Steps

- Customize the Angular popup in `src/app/`
- Modify AI behavior in `src/extension-scripts/content.ts`
- Adjust categories and colors
- Add more features!

