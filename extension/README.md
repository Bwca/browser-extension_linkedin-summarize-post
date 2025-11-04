# FeedBurner

Cut through LinkedIn's BS with AI-powered analysis. See the real intent behind every post - from self-promotion and engagement bait to genuine insights. Uses Chrome's built-in AI for privacy-first, on-device analysis.

## ✨ What It Does

FeedBurner adds "Summarize" buttons to LinkedIn posts. Click one and get a brutally honest AI analysis that identifies:

- **Self-promotion** disguised as "thought leadership"
- **Engagement bait** like "Agree?" and "Thoughts?"
- **Humblebrags** and made-up success stories
- **Corporate buzzword** nonsense
- **Genuine insights** (when they exist!)

Each summary comes with unique, color-coded labels that perfectly capture the post's real intent.

## 🚀 Installation & Setup

### Requirements

- **Chrome 127+** (required for AI features)
- **Desktop Chrome** (extensions don't work on mobile)
- **Experimental AI features enabled** (see step 2)

### 1. Install from Chrome Web Store

[Install FeedBurner](https://chromewebstore.google.com/) _(link coming soon)_

### 2. Enable Chrome AI (Required)

**Important:** The extension requires Chrome's experimental AI features to be enabled:

1. Go to `chrome://flags` in your browser
2. Search for **"Prompt API for Gemini Nano"**
3. Set it to **"Enabled"**
4. Search for **"Optimization Guide on Device Model"**
5. Set it to **"Enabled BypassPerfRequirement"**
6. **Restart Chrome completely**
7. Wait 2-5 minutes for Chrome to download the AI model

**Note:** This extension uses Chrome's experimental Prompt API. The AI model runs entirely on your device - no data is sent to external servers. This extension is not affiliated with Google, Chrome, or any AI providers.

### 3. Start Using It

1. Go to [LinkedIn](https://www.linkedin.com/feed/)
2. Look for blue **"Summarize"** buttons on posts
3. Click to see the AI analysis
4. Use the extension icon to customize settings

## 🎯 How to Use

### Basic Usage

- Visit your LinkedIn feed
- Find posts with **"Summarize"** buttons
- Click to get instant AI analysis
- View the color-coded summary in a toast notification

### Understanding the Results

Each analysis includes:

- **One brutal sentence** summary
- **1-2 unique labels** created specifically for this post
- **Auto-generated colors** for easy visual scanning

### Customizing the AI

Click the extension icon to access settings:

- **Temperature** (0.0-1.0): Controls how "creative" vs "consistent" the AI is
- **Top K** (1-10): Limits word choice variety
- **System Prompt**: Completely customize how the AI analyzes posts

## 🎨 Dynamic Labels

The AI doesn't use predefined categories - it creates **unique, creative labels** for each post based on the content. Labels are automatically color-coded for easy visual scanning.

### How It Works

- AI analyzes each post individually
- Creates 1-2 unique labels per post (never reused)
- Labels are lowercase, hyphenated, and brutally honest
- Colors are generated automatically and consistently

**Note:** The AI creates completely unique labels for each post, so you'll see creative, savage descriptions that perfectly capture the post's intent!

## ⚙️ Advanced Settings

Access settings by clicking the extension icon:

### Temperature

- **Lower (0.1-0.3)**: More consistent, predictable analysis
- **Higher (0.7-0.9)**: More creative, varied interpretations
- **Default: 0.8** - Balanced approach

### Top K

- **Lower (1-3)**: More focused vocabulary
- **Higher (7-10)**: More diverse word choice
- **Default: 3** - Good balance

### Custom System Prompt

Want the AI to focus on specific patterns? Write your own prompt! The default is designed to be ruthlessly skeptical of LinkedIn posturing.

## 🔧 Troubleshooting

### Extension Not Working?

1. **Check Chrome AI is enabled** - Go to `chrome://flags` and verify both flags are set
2. **Restart Chrome completely** - Required after enabling AI flags
3. **Wait for model download** - First use may take 2-5 minutes
4. **Check permissions** - Extension needs `aiLanguageModel` and `tabs` permissions
5. **Refresh LinkedIn page** - Reload the page to see buttons

### Buttons Not Appearing?

- Make sure you're on `linkedin.com/feed/`
- Try scrolling down to load more posts
- Check if LinkedIn updated their layout (extension may need updating)

### AI Giving Weird Results?

- Try adjusting the **Temperature** setting
- The AI model processes everything locally - no internet required
- Results depend on Chrome's AI model quality

## 🔒 Privacy & Security

- All AI processing happens on your device
- Extension itself does not collect any data
- Settings stored locally in Chrome

The extension only reads LinkedIn post content to analyze it - no personal data collection whatsoever.

## ❓ FAQ

**Q: Does this work on mobile?**
A: No, Chrome extensions only work on desktop Chrome.

**Q: Can I use this on other sites?**
A: Currently only works on LinkedIn feed pages. The extension specifically looks for LinkedIn's DOM structure to extract post content.

**Q: Is the AI always right?**
A: The AI is trained to be ruthlessly skeptical, but it's still AI - use your judgment!

**Q: Does this slow down LinkedIn?**
A: Minimal impact - AI processing happens locally and only when you click summarize.

## 📝 License

MIT License

---

**Disclaimer:** This extension is not affiliated with LinkedIn, Google, Chrome, or any other companies. Use at your own risk.

**Made with ❤️ for LinkedIn users tired of the BS**
