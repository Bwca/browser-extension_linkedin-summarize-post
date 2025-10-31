# LinkedIn Post Summarizer Extension

A browser extension that uses Chrome's built-in AI to summarize and analyze LinkedIn posts, helping you cut through the BS and identify the real intent behind posts.

## Features

- 🤖 **AI-Powered Analysis** - Uses Chrome's Prompt API (Gemini Nano) for on-device analysis
- 🏷️ **Smart Labeling** - Identifies post types: self-promotion, humblebrag, engagement-bait, made-up-story, cringe, virtue-signaling, and more
- 🎨 **Color-Coded Categories** - Visual badges with distinct colors for each category
- 📝 **Concise Summaries** - Get the essence of long posts without reading them
- 🔍 **Context-Aware** - Considers author's title and role to better understand intent
- 🎯 **Multiple Labels** - Posts are often a mix - the AI identifies both primary and secondary purposes

## Development

### Prerequisites

- Node.js and npm
- Chrome browser with AI features enabled

### Setup

```bash
cd linkedin-summarize-post
npm install
```

### Build

```bash
npm run build
```

This will:
1. Build the Angular popup application
2. Bundle extension scripts using tsup
3. Output everything to `dist/linkedin-summarize-post/`

### Load Extension in Chrome

1. Build the project: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `dist/linkedin-summarize-post` folder

### Enable Chrome AI

To use the AI features:

1. Open `chrome://flags`
2. Search for **"Prompt API for Gemini Nano"**
3. Set it to **"Enabled"**
4. Search for **"Optimization Guide on Device Model"**
5. Set it to **"Enabled BypassPerfRequirement"**
6. **Restart Chrome**
7. Chrome will download the AI model in the background (may take a few minutes)

## Project Structure

```
linkedin-summarize-post/
├── src/
│   ├── app/                    # Angular popup application
│   │   ├── app.ts
│   │   ├── app.html
│   │   └── app.scss
│   ├── extension-scripts/      # Extension content & background scripts
│   │   ├── background.ts       # Background service worker
│   │   └── content.ts          # Content script (runs on LinkedIn)
│   ├── manifest.json           # Extension manifest
│   ├── index.html              # Popup HTML
│   └── main.ts                 # Angular bootstrap
├── dist/                       # Build output (generated)
├── tsup.config.ts              # Extension scripts bundler config
├── angular.json                # Angular configuration
└── package.json
```

## How It Works

1. The content script (`content.ts`) runs on LinkedIn pages
2. It detects posts and adds "Summarize" buttons
3. When clicked, it extracts post content and author information
4. Sends to Chrome's AI with a specialized prompt to analyze intent
5. Displays results in a beautiful toast notification with color-coded labels

## Categories

- 🟠 **Humblebrag** - Disguised showing off
- 🔴 **Ragebait** - Designed to make you angry
- 🔵 **Thought Leadership** - Genuine industry insights
- 🟢 **Genuine Insight** - Actually useful information
- 🟣 **Self Promotion** - Marketing themselves or their company
- 🔴 **Engagement Bait** - "Agree?" "Thoughts?" tactics
- 🟡 **Inspirational** - Motivational content
- 💙 **Educational** - Teaching something useful
- 🟢 **Job Posting** - Recruiting
- 🌸 **Made-Up Story** - Fabricated narratives
- 💖 **Cringe** - Awkward or embarrassing
- 🟠 **Virtue Signaling** - Performative morality

## License

ISC

## Credits

Inspired by the structure of [CursIt Extension](https://github.com/volodymir-yepishev/cursit)
