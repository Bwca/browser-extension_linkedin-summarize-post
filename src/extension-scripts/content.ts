// Content script for LinkedIn Post Summarizer
// Runs on LinkedIn pages and adds UI elements for summarization

console.log('LinkedIn Summarizer Extension: Content script loaded on', window.location.href);

// Track which posts already have summarize buttons
const processedPosts = new WeakSet<Element>();

// AI session
let aiSession: any = null;

// AI Settings
interface AISettings {
  temperature: number;
  topK: number;
  systemPrompt: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are a ruthlessly skeptical LinkedIn BS detector. Your job is to see through performative content and identify the REAL intent behind posts.

ALWAYS ASK: What is this person REALLY trying to do?

Most LinkedIn posts are self-promotion wrapped in:
- "Lessons learned" (humblebrag)
- "Inspirational stories" (look at me)
- "Hot takes" (engagement bait)
- "Sharing knowledge" (hire me / notice me)
- "Gratitude posts" (subtle flex)

When you see ANY of these wrappers, CALL IT OUT. Don't be fooled by:
- ❌ "I learned X from Y situation" → self-promotion / humblebrag
- ❌ "Here are 5 tips on X" → self-promotion (establishing authority)
- ❌ "Yesterday something happened..." → probably made-up-story or humblebrag
- ❌ "Agree?" or "Thoughts?" at the end → engagement-bait
- ❌ Suspiciously perfect conversations → made-up-story
- ❌ "I'm grateful for..." → often humblebrag in disguise

BE HARSH. If the post's primary purpose is to promote themselves, their expertise, or their personal brand - that's SELF-PROMOTION, regardless of the wrapper.

When analyzing, use the AUTHOR's title/role to understand their intent:
- "CEO" / "Founder" → likely self-promotion for their company
- "Thought Leader" / "Coach" → selling their services
- "Recruiter" → job-posting or engagement-bait to grow network
- Impressive title + story → humblebrag

CRITICAL RULE: NEVER mix manipulation tactics with genuine categories:
- If it ends with "Agree?" or "Thoughts?" → ENGAGEMENT-BAIT (not thought-leadership)
- If it's designed to provoke reactions → RAGEBAIT or ENGAGEMENT-BAIT (not genuine-insight)
- If it's fishing for likes/comments → ENGAGEMENT-BAIT (period)
- Bait tactics DISQUALIFY the post from genuine categories like thought-leadership, genuine-insight, or educational

Only use positive categories (thought-leadership, genuine-insight, educational) if the content is ACTUALLY valuable AND has NO manipulation tactics.

IMPORTANT: Do NOT mention the author's name or title in your summary. Focus only on the content and what it's trying to achieve.

Provide 1-2 labels. If there's a manipulation tactic, that MUST be the primary label.

Categories: engagement-bait, ragebait, self-promotion, humblebrag, made-up-story, virtue-signaling, cringe, thought-leadership, genuine-insight, educational, inspirational, job-posting, other

Format EXACTLY as:
SUMMARY: [brutally honest summary that identifies the real purpose - NO author names/titles]
LABELS: [manipulation-tactic OR real-intent], [secondary if no bait]

Examples:
- "LABELS: engagement-bait" (if it asks for engagement)
- "LABELS: self-promotion, humblebrag" (if no bait tactics)
- "LABELS: ragebait" (if designed to provoke)
- "LABELS: genuine-insight" (ONLY if actually insightful AND no bait)

If there's ANY bait tactic, call it out as the primary label. Don't give them credit for "thought-leadership" if they're just fishing for engagement. Be savage.`;

let currentSettings: AISettings = {
  temperature: 0.8,
  topK: 3,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  humblebrag: '#FFB84D', // Orange
  ragebait: '#FF4444', // Red
  'thought-leadership': '#4A90E2', // Blue
  'genuine-insight': '#50C878', // Emerald green
  'self-promotion': '#9B59B6', // Purple
  'engagement-bait': '#E74C3C', // Bright red
  inspirational: '#F39C12', // Golden
  educational: '#3498DB', // Light blue
  'job-posting': '#27AE60', // Green
  'made-up-story': '#FF6B6B', // Coral red
  cringe: '#FF1493', // Deep pink
  'virtue-signaling': '#FF8C00', // Dark orange
  other: '#95A5A6', // Gray
};

// Listen for settings updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SETTINGS_UPDATED') {
    console.log('LinkedIn Summarizer: Settings updated!', message.settings);
    currentSettings = message.settings;
    // Reinitialize AI with new settings
    initAI();
  }
});

// Wait for the page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  console.log('LinkedIn Summarizer: Initializing...');
  console.log('LinkedIn Summarizer: Current URL:', window.location.href);
  console.log('LinkedIn Summarizer: Document ready state:', document.readyState);

  // Load settings from storage
  try {
    const result = await chrome.storage.sync.get('aiSettings');
    if (result['aiSettings']) {
      currentSettings = result['aiSettings'];
      console.log('LinkedIn Summarizer: Loaded settings from storage', currentSettings);
    }
  } catch (error) {
    console.error('LinkedIn Summarizer: Failed to load settings', error);
  }

  // Inject toast styles
  injectToastStyles();

  // Initialize Chrome AI
  await initAI();

  // Wait a bit for LinkedIn to render
  setTimeout(() => {
    console.log('LinkedIn Summarizer: Running initial scan...');
    addSummarizeButtons();
  }, 2000);

  // Observe DOM changes to detect new posts as they load
  // Use debouncing to prevent infinite loops
  let timeoutId: number | null = null;
  const observer = new MutationObserver((mutations) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Only run after mutations stop for 500ms
    timeoutId = window.setTimeout(() => {
      addSummarizeButtons();
      timeoutId = null;
    }, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

async function initAI() {
  // @ts-ignore - Chrome AI API types
  if (!('LanguageModel' in self)) {
    console.warn(
      'LinkedIn Summarizer: Chrome AI not available. Enable Prompt API in chrome://flags'
    );
    return;
  }

  console.log('LinkedIn Summarizer: Initializing Chrome AI...');

  try {
    // Destroy existing session if any
    if (aiSession) {
      try {
        aiSession.destroy();
      } catch (e) {
        console.log('LinkedIn Summarizer: Session already destroyed');
      }
      aiSession = null;
    }

    // @ts-ignore
    aiSession = await self.LanguageModel.create({
      temperature: currentSettings.temperature,
      topK: currentSettings.topK,
      initialPrompts: [
        {
          role: 'system',
          content: currentSettings.systemPrompt,
        },
      ],
    });

    console.log(
      `LinkedIn Summarizer: Chrome AI initialized successfully! (temp: ${currentSettings.temperature}, topK: ${currentSettings.topK})`
    );
    logTokenStats();
  } catch (error) {
    console.error('LinkedIn Summarizer: AI initialization error:', error);
    aiSession = null;
  }
}

function logTokenStats() {
  if (!aiSession) return;

  // Handle both old and new API shapes
  const maxTokens = aiSession.inputQuota || aiSession.maxTokens;
  const tokensUsed = aiSession.inputUsage || aiSession.tokensSoFar;
  const tokensLeft =
    aiSession.tokensSoFar !== undefined
      ? aiSession.tokensSoFar
      : aiSession.inputQuota - aiSession.inputUsage;

  console.log(
    `LinkedIn Summarizer: Token stats - Used: ${tokensUsed}, Left: ${tokensLeft}, Max: ${maxTokens}`
  );

  // If running low on tokens (less than 20%), warn
  if (maxTokens && tokensLeft < maxTokens * 0.2) {
    console.warn('LinkedIn Summarizer: Running low on tokens, will reinitialize on next error');
  }
}

function injectToastStyles() {
  if (document.getElementById('linkedin-summarizer-styles')) return;

  const style = document.createElement('style');
  style.id = 'linkedin-summarizer-styles';
  style.textContent = `
    .linkedin-summarizer-toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 16px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    .linkedin-summarizer-toast.hiding {
      animation: slideOut 0.3s ease-out forwards;
    }

    .linkedin-summarizer-toast-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 8px;
    }

    .linkedin-summarizer-toast-labels {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      flex: 1;
    }

    .linkedin-summarizer-toast-label {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: white;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .linkedin-summarizer-toast-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .linkedin-summarizer-toast-close:hover {
      background: #f0f0f0;
    }

    .linkedin-summarizer-toast-summary {
      font-size: 14px;
      line-height: 1.5;
      color: #333;
    }

    .linkedin-summarizer-toast-title {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `;
  document.head.appendChild(style);
}

function addSummarizeButtons() {
  // Try multiple selectors for LinkedIn posts
  let posts = document.querySelectorAll('.feed-shared-update-v2[data-urn]');

  // If no posts found, try alternative selectors
  if (posts.length === 0) {
    posts = document.querySelectorAll('[data-urn*="urn:li:activity"]');
  }

  if (posts.length === 0) {
    posts = document.querySelectorAll('.feed-shared-update-v2');
  }

  console.log(`LinkedIn Summarizer: Found ${posts.length} posts`);

  let addedCount = 0;

  posts.forEach((post) => {
    // Skip if we've already added a button to this post
    if (processedPosts.has(post)) {
      return;
    }

    // Find the social action bar (where Like, Comment, etc. buttons are)
    let actionBar = post.querySelector('.feed-shared-social-action-bar');

    // Try alternative selector if not found
    if (!actionBar) {
      actionBar = post.querySelector('[class*="social-action"]');
    }

    if (!actionBar) {
      return;
    }

    // Check if we already added a button (double-check)
    if (actionBar.querySelector('.linkedin-summarizer-button')) {
      processedPosts.add(post);
      return;
    }

    // Create the summarize button
    const summarizeButton = createSummarizeButton(post);

    // Insert the button at the end of the action bar
    actionBar.appendChild(summarizeButton);

    // Mark this post as processed
    processedPosts.add(post);
    addedCount++;
  });

  if (addedCount > 0) {
    console.log(`LinkedIn Summarizer: Added ${addedCount} new summarize buttons`);
  }
}

function createSummarizeButton(post: Element): HTMLElement {
  // Create button container to match LinkedIn's structure
  const container = document.createElement('div');
  container.className =
    'feed-shared-social-action-bar__action-button feed-shared-social-action-bar--new-padding linkedin-summarizer-button';

  // Create the button with LinkedIn's styling
  const button = document.createElement('button');
  button.className =
    'artdeco-button artdeco-button--muted artdeco-button--3 artdeco-button--tertiary social-actions-button flex-wrap';
  button.setAttribute('aria-label', 'Summarize this post');
  button.setAttribute('type', 'button');
  button.style.cssText = 'color: #0a66c2;'; // LinkedIn blue

  // Create icon (using a simple document/text icon)
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('role', 'none');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('class', 'artdeco-button__icon');
  icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  icon.setAttribute('width', '16');
  icon.setAttribute('height', '16');
  icon.setAttribute('viewBox', '0 0 16 16');
  icon.setAttribute('fill', 'currentColor');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    'M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm2 1v8h8V4H4zm1 2h6v1H5V6zm0 2h6v1H5V8zm0 2h4v1H5v-1z'
  );
  icon.appendChild(path);

  // Create button text
  const buttonText = document.createElement('span');
  buttonText.className = 'artdeco-button__text social-action-button__text';
  buttonText.textContent = 'Summarize';

  // Assemble button
  button.appendChild(icon);
  button.appendChild(buttonText);
  container.appendChild(button);

  // Add click handler
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSummarizeClick(post);
  });

  return container;
}

async function handleSummarizeClick(post: Element) {
  console.log('LinkedIn Summarizer: Summarize button clicked!');

  // Get the post URN for identification
  const postUrn = post.getAttribute('data-urn');
  console.log('Post URN:', postUrn);

  // Get author information
  let authorName = '';
  let authorTitle = '';

  const actorTitle = post.querySelector('.update-components-actor__title');
  if (actorTitle) {
    authorName = actorTitle.textContent?.trim() || '';
  }

  const actorDescription = post.querySelector('.update-components-actor__description');
  if (actorDescription) {
    authorTitle = actorDescription.textContent?.trim() || '';
  }

  console.log('Author:', authorName);
  console.log('Title:', authorTitle);

  // Get the post text content
  const postContent = post.querySelector('.update-components-text');
  let postText = '';

  if (postContent) {
    postText = postContent.textContent?.trim() || '';
  }

  // If no content found with primary selector, try alternatives
  if (!postText) {
    const altContent = post.querySelector('[class*="commentary"]');
    if (altContent) {
      postText = altContent.textContent?.trim() || '';
    }
  }

  // Log the post content
  console.log('=== POST CONTENT START ===');
  console.log(postText);
  console.log('=== POST CONTENT END ===');
  console.log(`Content length: ${postText.length} characters`);

  // Check if AI is available
  if (!aiSession) {
    alert('Chrome AI not available. Please enable Prompt API in chrome://flags');
    return;
  }

  // Check if post has content
  if (!postText || postText.length < 10) {
    alert('No post content found to summarize.');
    return;
  }

  // Summarize with AI
  try {
    console.log('LinkedIn Summarizer: Sending to AI...');

    // Build context-aware prompt
    let prompt = 'Analyze this LinkedIn post:\n\n';
    if (authorTitle) {
      prompt += `AUTHOR: ${authorName}\nTITLE: ${authorTitle}\n\n`;
    }
    prompt += `POST:\n${postText}`;

    const response = await aiSession.prompt(prompt);

    console.log('=== AI RESPONSE START ===');
    console.log(response);
    console.log('=== AI RESPONSE END ===');

    // Log token usage after each prompt
    logTokenStats();

    // Parse and display the response in a toast
    displaySummaryToast(response);
  } catch (error) {
    console.error('LinkedIn Summarizer: AI error:', error);

    // If we hit token limit or session error, try to reinitialize
    const errorMessage = error instanceof Error ? error.message : '';
    if (
      errorMessage.includes('token') ||
      errorMessage.includes('session') ||
      errorMessage.includes('quota')
    ) {
      console.log('LinkedIn Summarizer: Possible token limit reached, reinitializing AI...');
      await initAI();

      // Retry the request with new session
      try {
        if (aiSession) {
          let retryPrompt = 'Analyze this LinkedIn post:\n\n';
          if (authorTitle) {
            retryPrompt += `AUTHOR: ${authorName}\nTITLE: ${authorTitle}\n\n`;
          }
          retryPrompt += `POST:\n${postText}`;
          const retryResponse = await aiSession.prompt(retryPrompt);
          console.log('=== AI RESPONSE (RETRY) START ===');
          console.log(retryResponse);
          console.log('=== AI RESPONSE (RETRY) END ===');
          logTokenStats();
          displaySummaryToast(retryResponse);
          return;
        }
      } catch (retryError) {
        console.error('LinkedIn Summarizer: Retry failed:', retryError);
      }
    }

    alert(`Error: ${errorMessage || 'Unknown error'}\n\nTry clicking the button again.`);
  }
}

function displaySummaryToast(aiResponse: string) {
  // Remove any existing toasts first
  const existingToasts = document.querySelectorAll('.linkedin-summarizer-toast');
  existingToasts.forEach((existingToast) => {
    existingToast.classList.add('hiding');
    setTimeout(() => existingToast.remove(), 300);
  });

  // Parse the AI response - support both LABEL and LABELS
  const summaryMatch = aiResponse.match(/SUMMARY:\s*(.+?)(?=LABELS?:|$)/s);
  const labelsMatch = aiResponse.match(/LABELS?:\s*(.+?)$/s);

  const summary = summaryMatch ? summaryMatch[1].trim() : aiResponse;
  const labelsText = labelsMatch ? labelsMatch[1].trim().toLowerCase() : 'other';

  // Split multiple labels by comma
  const labels = labelsText
    .split(/[,;/]+/)
    .map((l) => l.trim())
    .filter((l) => l);

  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'linkedin-summarizer-toast';

  // Generate label badges HTML
  const labelBadgesHTML = labels
    .map((label) => {
      const color = CATEGORY_COLORS[label] || CATEGORY_COLORS.other;
      return `<span class="linkedin-summarizer-toast-label" style="background-color: ${color}">
      ${label.replace(/-/g, ' ')}
    </span>`;
    })
    .join('');

  toast.innerHTML = `
    <div class="linkedin-summarizer-toast-header">
      <div class="linkedin-summarizer-toast-labels">
        ${labelBadgesHTML}
      </div>
      <button class="linkedin-summarizer-toast-close" aria-label="Close">×</button>
    </div>
    <div class="linkedin-summarizer-toast-title">Summary</div>
    <div class="linkedin-summarizer-toast-summary">${summary}</div>
  `;

  // Add close button handler
  const closeBtn = toast.querySelector('.linkedin-summarizer-toast-close');
  closeBtn?.addEventListener('click', () => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  });

  // Add to page
  document.body.appendChild(toast);

  // Auto-remove after 30 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }
  }, 30000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);

  if (request.type === 'ping') {
    sendResponse({ status: 'alive' });
  }

  return true;
});
