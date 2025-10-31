# Setup Guide - LinkedIn Post Summarizer Extension

Complete setup instructions for developers and users.

## 📋 Prerequisites

- **Node.js** 18 or higher
- **npm** (comes with Node.js)
- **Chrome** 127 or higher
- **Git** (optional, for cloning)

## 🚀 Installation

### Step 1: Get the Code

```bash
# Clone the repository (or download ZIP)
cd linkedin-summarize-post

# Install dependencies
npm install
```

### Step 2: Build the Extension

```bash
npm run build
```

This command runs:

1. `ng build` - Compiles Angular popup app
2. `tsup` - Bundles extension scripts
3. Outputs to `dist/linkedin-summarize-post/`

**Build output:**

```
dist/linkedin-summarize-post/
├── browser/
│   ├── background.js         # Service worker
│   ├── content.js           # Content script
│   ├── index.html           # Popup HTML
│   ├── main-[hash].js      # Angular bundle
│   ├── styles-[hash].css   # Styles
│   └── manifest.json       # Extension manifest
```

### Step 3: Load Extension in Chrome

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (top right toggle)
4. Click **"Load unpacked"**
5. Select `dist/linkedin-summarize-post` folder
6. Extension should appear with name "LinkedIn Post Summarizer"

### Step 4: Enable Chrome AI (Critical!)

**The extension requires Chrome's built-in AI. Follow these steps carefully:**

1. Navigate to `chrome://flags/`
2. Search: **"Prompt API for Gemini Nano"**
   - Set to: **"Enabled"**
3. Search: **"Optimization Guide on Device Model"**
   - Set to: **"Enabled BypassPerfRequirement"**
4. **Restart Chrome** (required!)
5. Wait 2-5 minutes for model download

**Verify AI is ready:**

- Open DevTools on any page (F12)
- Run: `await window.ai.languageModel.create()`
- Should resolve (not throw error)

## ✅ Testing

### 1. Check Extension Loaded

- Go to `chrome://extensions/`
- Verify "LinkedIn Post Summarizer" is enabled
- No errors shown

### 2. Test on LinkedIn

1. Navigate to [LinkedIn Feed](https://www.linkedin.com/feed/)
2. Look for **"Summarize"** buttons on posts
3. Click a button
4. Should see toast notification with summary and labels

### 3. Test Popup

1. Click extension icon in toolbar
2. Should see home page
3. Click "Configure AI Settings"
4. Adjust sliders and save
5. Settings should persist after closing/reopening

### 4. Check Console Logs

**Right-click extension popup → Inspect**

You should see:

```
🔷 SettingsService constructor - NEW INSTANCE created
🔷 [POPUP OPENED] SettingsComponent ngOnInit - loading settings from storage
🔵 [LOAD] Loading settings from chrome.storage.sync...
🟢 [LOAD] Found saved settings: {...}
```

## 🛠️ Development Workflow

### Making Changes

**To modify popup UI:**

1. Edit files in `src/app/`
2. Run `npm run build`
3. Reload extension in `chrome://extensions/`

**To modify content script:**

1. Edit `src/extension-scripts/content.ts`
2. Run `npm run build`
3. Reload extension + refresh LinkedIn page

### Project Structure

```
src/
├── app/                              # Angular popup
│   ├── pages/
│   │   ├── home/                    # Home page
│   │   │   ├── home.component.ts
│   │   │   ├── home.component.html
│   │   │   └── home.component.scss
│   │   └── settings/                # Settings page
│   │       ├── settings.component.ts
│   │       ├── settings.component.html
│   │       └── settings.component.scss
│   ├── services/
│   │   └── settings.service.ts      # Component-scoped service
│   ├── app.ts                       # Root component
│   ├── app.html                     # Router outlet
│   ├── app.routes.ts                # Route definitions
│   └── app.scss                     # Global styles
├── extension-scripts/
│   ├── background.ts                # Background service worker
│   └── content.ts                   # Runs on LinkedIn pages
├── manifest.json                    # Extension manifest
├── index.html                       # Popup bootstrap
└── main.ts                          # Angular entry point
```

### Key Files Explained

**`manifest.json`**

- Defines extension metadata and permissions
- Specifies content script matches
- Points to background worker

**`content.ts`** (2000+ lines)

- Detects LinkedIn posts
- Injects "Summarize" buttons
- Manages Chrome AI session
- Displays toast notifications
- Handles settings updates

**`background.ts`**

- Background service worker
- Currently minimal (logging only)

**`settings.service.ts`**

- Component-scoped (not singleton)
- Manages AI settings (temperature, topK, prompt)
- Persists to `chrome.storage.sync`
- Broadcasts changes to content script

## 🔧 Configuration

### Build Configuration

**`angular.json`**

- Output path: `dist/linkedin-summarize-post`
- Includes `manifest.json` as asset

**`tsup.config.ts`**

- Bundles extension scripts
- Output: `dist/linkedin-summarize-post/browser/`

**`tsconfig.app.json`**

- Excludes `extension-scripts/` from Angular compilation
- Includes Chrome types

### Extension Settings

**Configurable via popup:**

- Temperature (0.0-1.0)
- Top K (1-10)
- System Prompt (full AI instructions)

**Default Settings:**

```typescript
{
  temperature: 0.8,
  topK: 3,
  systemPrompt: "You are a ruthlessly skeptical..."
}
```

## 🐛 Troubleshooting

### Extension won't load

**Problem:** Error in `chrome://extensions/`

**Solutions:**

- Verify you built: `npm run build`
- Load correct folder: `dist/linkedin-summarize-post/`
- Check manifest.json is valid JSON
- Look for TypeScript errors in build output

### AI doesn't work

**Problem:** "Chrome AI not available" in console

**Solutions:**

- Enable flags (see Step 4)
- Restart Chrome completely
- Wait for model download (5-10 mins)
- Check: `chrome://components/` → "Optimization Guide On Device Model"

### Settings don't persist

**Problem:** Settings reset after closing popup

**Solutions:**

- Check DevTools console for storage errors
- Verify `storage` permission in manifest.json
- Look for save/load logs in console
- Try `chrome.storage.sync.clear()` in DevTools

### Changes not reflected

**Problem:** Code changes don't appear

**Solutions:**

- Run `npm run build` after changes
- Click refresh icon in `chrome://extensions/`
- Hard reload LinkedIn page (Ctrl+Shift+R)
- Clear browser cache

### TypeScript errors

**Problem:** Build fails with type errors

**Solutions:**

- Ensure `@types/chrome` is installed
- Check `tsconfig.app.json` excludes extension scripts
- Run `npm install` again
- Clear `node_modules` and reinstall

## 📊 Performance

- **Extension Size:** ~500KB (uncompressed)
- **Memory Usage:** ~50MB (with AI loaded)
- **AI Model:** ~22MB download
- **Build Time:** ~10-15 seconds

## 🔐 Security

- All AI processing is on-device
- No external API calls
- No telemetry or tracking
- Settings stored locally in Chrome
- No permissions beyond `activeTab` and `storage`

## 📝 Next Steps

1. **Customize AI Prompt**

   - Open popup → Settings → Edit System Prompt
   - Adjust detection strategy
   - Save and test

2. **Add Features**

   - Modify `src/app/` for popup features
   - Edit `content.ts` for LinkedIn features
   - Update routes in `app.routes.ts`

3. **Publish**
   - Test thoroughly
   - Create icons (16x16, 48x48, 128x128)
   - Zip `dist/` folder
   - Submit to Chrome Web Store

## 📚 Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Chrome AI API](https://developer.chrome.com/docs/ai/built-in-apis)
- [Angular Docs](https://angular.dev)
- [TypeScript Docs](https://www.typescriptlang.org/)

---

**Need help?** Open an issue or check console logs for detailed error messages.
