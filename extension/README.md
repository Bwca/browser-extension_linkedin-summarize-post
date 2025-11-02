# FeedBurner

Cut through LinkedIn's BS with AI-powered analysis. See the real intent behind every post - from self-promotion and engagement bait to genuine insights. Uses Chrome's built-in AI for privacy-first, on-device analysis.

## ✨ What It Does

FeedBurner adds "Summarize" buttons to LinkedIn posts. Click one and get a brutally honest AI analysis that identifies:

- **Self-promotion** disguised as "thought leadership"
- **Engagement bait** like "Agree?" and "Thoughts?"
- **Humblebrags** and made-up success stories
- **Corporate buzzword** nonsense
- **Genuine insights** (when they exist!)

Each summary comes with color-coded labels so you can quickly spot manipulation tactics vs. actual value.

## 🚀 Installation & Setup

### 1. Install from Chrome Web Store

[Install FeedBurner](https://chromewebstore.google.com/) _(link coming soon)_

### 2. Enable Chrome AI (Required)

The extension uses Chrome's built-in AI model - you need to enable it first:

1. Go to `chrome://flags` in your browser
2. Search for **"Prompt API for Gemini Nano"**
3. Set it to **"Enabled"**
4. Search for **"Optimization Guide on Device Model"**
5. Set it to **"Enabled BypassPerfRequirement"**
6. **Restart Chrome**
7. Wait 2-5 minutes for Chrome to download the AI model

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
- **2-3 labels** identifying the post type
- **Color coding** for quick visual scanning

### Customizing the AI

Click the extension icon to access settings:

- **Temperature** (0.0-1.0): Controls how "creative" vs "consistent" the AI is
- **Top K** (1-10): Limits word choice variety
- **System Prompt**: Completely customize how the AI analyzes posts

## 🎨 Label Categories

The AI detects these patterns with specific colors:

| Label                  | Color     | What It Means                           |
| ---------------------- | --------- | --------------------------------------- |
| **Engagement-Bait**    | 🔴 Red    | "Agree?" "Thoughts?" click tactics      |
| **Ragebait**           | 🔴 Red    | Designed to provoke emotional responses |
| **Self-Promotion**     | 🟣 Purple | Marketing disguised as sharing          |
| **Humblebrag**         | 🟠 Orange | Subtle showing off                      |
| **Made-Up Story**      | 🌸 Pink   | Fabricated narratives                   |
| **Virtue Signaling**   | 🟠 Orange | Performative morality                   |
| **Cringe**             | 💖 Pink   | Awkward or embarrassing                 |
| **Thought Leadership** | 🔵 Blue   | Genuine industry insights               |
| **Genuine Insight**    | 🟢 Green  | Actually useful information             |
| **Educational**        | 💙 Blue   | Teaching real value                     |
| **Inspirational**      | 🟡 Yellow | Authentic motivation                    |
| **Job Posting**        | 🟢 Green  | Legitimate recruiting                   |

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
2. **Restart Chrome** - Required after enabling AI flags
3. **Wait for model download** - First use may take a few minutes
4. **Refresh LinkedIn** - Reload the page to see buttons

### Buttons Not Appearing?

- Make sure you're on `linkedin.com/feed/`
- Try scrolling down to load more posts
- Check if LinkedIn updated their layout (extension may need updating)

### AI Giving Weird Results?

- Try adjusting the **Temperature** setting
- The AI model processes everything locally - no internet required
- Results depend on Chrome's AI model quality

## 🔒 Privacy & Security

**100% Private & Local:**

- All AI processing happens on your device
- No data sent to external servers
- No analytics or tracking
- Settings stored locally in Chrome
- Nothing leaves your computer

The extension only reads LinkedIn post content to analyze it - no personal data collection whatsoever.

## ❓ FAQ

**Q: Does this work on mobile?**
A: No, Chrome extensions only work on desktop Chrome.

**Q: Can I use this on other sites?**
A: Currently only works on LinkedIn feed pages.

**Q: Is the AI always right?**
A: The AI is trained to be ruthlessly skeptical, but it's still AI - use your judgment!

**Q: Can I customize the labels?**
A: You can modify the system prompt to change how the AI categorizes posts.

**Q: Does this slow down LinkedIn?**
A: Minimal impact - AI processing happens locally and only when you click summarize.

## 📝 License

ISC License

---

**Made with ❤️ for LinkedIn users tired of the BS**
