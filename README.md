# FeedBurner - AI-Powered LinkedIn Post Analysis

**Burn through LinkedIn's BS with brutally honest AI analysis. See the real intent behind every post - from self-promotion and engagement bait to genuine insights.**

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue.svg)](https://chrome.google.com/webstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()

## ✨ What FeedBurner Does

FeedBurner adds "Summarize" buttons to LinkedIn posts in your feed. Click one and get an instant AI-powered analysis that cuts through the corporate jargon and identifies:

- **Self-promotion** disguised as "thought leadership"
- **Engagement bait** like "Agree?" and "Thoughts?"
- **Humblebrags** and made-up success stories
- **Corporate buzzword** nonsense
- **Genuine insights** (when they actually exist!)

Each summary comes with unique, color-coded labels that perfectly capture the post's real intent - no generic categories, just creative, savage descriptions tailored to each post.

## 🚀 Key Features

### 🎯 Ruthless Analysis

Detects hidden agendas, self-promotion, and engagement farming with surgical precision.

### 🏷️ Unique Labels

AI creates custom, never-repeated labels for each post - lowercase, hyphenated, and brutally honest.

### ⚡ Instant Summaries

Click "Summarize" on any LinkedIn post for immediate AI analysis in a toast notification.

### 🎨 Dynamic Colors

Automatically generated color-coding for easy visual scanning of post types.

### ⚙️ Customizable AI

Full control over AI behavior:

- **Temperature** (0.0-1.0): Creative vs consistent analysis
- **Top K** (1-10): Word choice variety
- **Custom system prompts**: Design your own analysis style

## 📋 Requirements

- **Chrome 127+** (required for AI features)
- **Desktop Chrome only** (extensions don't work on mobile)
- **Experimental AI features enabled** in Chrome flags

## 🛠️ Installation

### From Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "FeedBurner"
3. Click "Add to Chrome"

### Manual Installation (Development)

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Bwca/browser-extension_linkedin-summarize-post.git
   cd browser-extension_linkedin-summarize-post
   ```

2. **Install dependencies:**

   ```bash
   cd extension
   npm install
   ```

3. **Build the extension:**

   ```bash
   npm run build
   ```

4. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked" and select the `extension/dist/linkedin-summarize-post/browser` folder

### Enable Chrome AI Features

**IMPORTANT:** You must enable experimental AI features in Chrome:

1. Go to `chrome://flags`
2. Search for "Prompt API for Gemini Nano" and enable it
3. Search for "Optimization Guide on Device Model" and enable it
4. **Restart Chrome completely**
5. **Wait 2-5 minutes** for Chrome to download the AI model

## 🎯 How to Use

1. Navigate to your LinkedIn feed (`linkedin.com/feed/`)
2. Look for blue "Summarize" buttons on posts
3. Click to get instant AI analysis
4. Customize AI settings via the extension icon for different analysis styles

## 💡 Pro Tips

- **For consistent results**: Use Temperature 0.3 + Top K 1
- **For creative analysis**: Use Temperature 1.0 + Top K 8
- **Create multiple profiles**: One for "gentle" feedback, another for "ruthless" criticism
- **The AI creates unique labels**: No generic categories - each post gets custom, savage descriptions

## 🔧 Troubleshooting

### Buttons not appearing?

- Ensure you're on `linkedin.com/feed/`
- Try scrolling to load more posts
- Check if LinkedIn updated their layout

### AI not working?

- Verify Chrome AI flags are enabled
- Restart Chrome completely after enabling flags
- Wait for the AI model to download (2-5 minutes)

### Weird results?

- Adjust Temperature and Top K settings
- Try creating a custom system prompt
- Remember: the AI is trained to be ruthlessly skeptical!

## 🔒 Privacy & Data Processing

- **Extension doesn't collect data** - Only reads post content you explicitly choose to analyze
- **Processed by Google's AI** - Uses Chrome's Prompt API with Gemini Nano model
- **No control over Google's processing** - We cannot guarantee what Google does with the data
- **Settings stored locally** - Your preferences stay on your device
- **Open source transparency** - Review the code to see exactly what data is processed

## 🛠️ Development

### Tech Stack

- **Frontend**: Angular 20
- **Build Tool**: Angular CLI + tsup
- **Chrome Extension**: Manifest V3
- **AI**: Chrome Prompt API (Gemini Nano)

### Available Scripts

```bash
# Development server
npm start

# Build for production
npm run build

# Build and watch for changes
npm run watch

# Run tests
npm test
```

### Project Structure

```
extension/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── home/          # About page
│   │   │   └── settings/      # Main settings popup
│   │   └── services/          # Angular services
│   ├── extension-scripts/      # Background and content scripts
│   └── manifest.json          # Extension manifest
├── dist/                      # Built extension (after npm run build)
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Reporting Issues

- [🐛 Report bugs](https://github.com/Bwca/browser-extension_linkedin-summarize-post/issues)
- [💡 Suggest features](https://github.com/Bwca/browser-extension_linkedin-summarize-post/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Made with ❤️ for LinkedIn users tired of the endless stream of corporate posturing and engagement bait.

---

**Disclaimer:** This extension is not affiliated with LinkedIn or Google. Use at your own risk.
