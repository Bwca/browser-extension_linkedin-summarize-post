# LinkedIn Post Summarizer Extension

A Chrome extension that uses Chrome's built-in AI (Gemini Nano) to analyze LinkedIn posts and cut through the BS. Get brutally honest summaries and labels that identify the real intent behind every post.

## ✨ Features

- 🤖 **On-Device AI** - Uses Chrome's Prompt API (Gemini Nano) for privacy-first analysis
- 🎯 **Ruthless Detection** - Identifies self-promotion, humblebrags, engagement-bait, made-up stories, and more
- 🏷️ **Smart Labeling** - Multiple labels per post (e.g., "engagement-bait, self-promotion")
- 🎨 **Color-Coded Toasts** - Visual notifications with category-specific colors
- ⚙️ **Customizable Settings** - Adjust AI parameters (temperature, topK) and system prompt
- 📝 **Context-Aware** - Considers author's title and role for better analysis
- 🔄 **Persistent Settings** - Settings sync across devices via Chrome storage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Chrome 127+ (with built-in AI support)

### Installation

```bash
# Install dependencies
npm install

# Build the extension
npm run build
```

### Load in Chrome

1. Build the project: `npm run build`
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top right)
4. Click **"Load unpacked"**
5. Select `dist/linkedin-summarize-post` folder

### Enable Chrome AI

**Required for the extension to work:**

1. Navigate to `chrome://flags`
2. Search for **"Prompt API for Gemini Nano"**
3. Set to **"Enabled"**
4. Search for **"Optimization Guide on Device Model"**
5. Set to **"Enabled BypassPerfRequirement"**
6. **Restart Chrome**
7. Wait 2-5 minutes for Chrome to download the AI model

### Usage

1. Go to [LinkedIn Feed](https://www.linkedin.com/feed/)
2. Look for **"Summarize"** buttons on posts
3. Click to see AI analysis with brutally honest labels
4. Open extension popup to customize AI settings

## 📂 Project Structure

```
linkedin-summarize-post/
├── src/
│   ├── app/                          # Angular popup application
│   │   ├── pages/
│   │   │   ├── home/                 # Home page component
│   │   │   └── settings/             # Settings page component
│   │   ├── services/
│   │   │   └── settings.service.ts   # Settings management
│   │   ├── app.ts                    # Root component
│   │   ├── app.routes.ts             # Angular routes
│   │   └── app.html                  # Root template
│   ├── extension-scripts/            # Extension scripts (tsup)
│   │   ├── background.ts             # Background service worker
│   │   └── content.ts                # Content script (LinkedIn)
│   ├── manifest.json                 # Extension manifest
│   ├── index.html                    # Popup HTML
│   └── main.ts                       # Angular bootstrap
├── dist/                             # Build output
├── angular.json                      # Angular configuration
├── tsup.config.ts                    # Extension bundler config
└── package.json
```

## 🎨 Categories

The AI detects these categories with color-coded badges:

- 🔴 **Engagement-Bait** - "Agree?" "Thoughts?" tactics
- 🔴 **Ragebait** - Designed to provoke anger
- 🟣 **Self-Promotion** - Marketing themselves/company
- 🟠 **Humblebrag** - Disguised showing off
- 🌸 **Made-Up Story** - Fabricated narratives
- 🟠 **Virtue Signaling** - Performative morality
- 💖 **Cringe** - Awkward or embarrassing
- 🔵 **Thought Leadership** - Genuine insights
- 🟢 **Genuine Insight** - Actually useful
- 💙 **Educational** - Teaching value
- 🟡 **Inspirational** - Motivational
- 🟢 **Job Posting** - Recruiting

## ⚙️ Settings

Open the extension popup to configure:

- **Temperature** (0.0-1.0) - Controls AI randomness
- **Top K** (1-10) - Limits vocabulary selection  
- **System Prompt** - Customize AI behavior

Settings persist across sessions and sync across devices.

## 🛠️ Development

### Build Commands

```bash
# Production build
npm run build

# Development mode (Angular only)
ng serve

# Watch mode
ng build --watch
```

### Architecture

- **Angular 19** - Popup UI with routing
- **TypeScript** - Type-safe development
- **Tsup** - Extension script bundling
- **SCSS** - Styling with nesting
- **Chrome Storage API** - Settings persistence
- **Chrome AI API** - On-device analysis

### Making Changes

1. Modify files in `src/`
2. Run `npm run build`
3. Reload extension in `chrome://extensions/`
4. Reload LinkedIn page

## 🤖 How It Works

1. **Content Script Injection** - `content.ts` runs on LinkedIn pages
2. **Button Injection** - Adds "Summarize" buttons to each post
3. **Content Extraction** - Captures post text and author context
4. **AI Analysis** - Sends to Chrome AI with specialized prompt
5. **Smart Labeling** - AI identifies manipulation tactics vs genuine content
6. **Toast Display** - Shows color-coded summary with labels

### AI Prompt Strategy

The AI is instructed to:
- Be ruthlessly skeptical
- See through performative wrappers
- Prioritize manipulation tactics (bait > genuine content)
- Never mix bait with thought-leadership
- Consider author's role for context
- Provide 1-2 labels per post

## 🔒 Privacy

- **100% On-Device** - All AI processing happens locally
- **No External APIs** - No data sent to servers
- **Chrome Storage Only** - Settings stored locally
- **No Analytics** - No tracking whatsoever

## 📝 License

ISC

## 🙏 Credits

Project structure inspired by [CursIt Extension](https://github.com/volodymir-yepishev/cursit)
