// Content script for LinkedIn Post Summarizer
// Runs on LinkedIn pages and adds UI elements for summarization

import { aiService } from './services/ai.service';
import { uiService } from './services/ui.service';
import { domService } from './services/dom.service';
import { handleSummarizeClick } from './summarize.handler';

console.log('LinkedIn Summarizer Extension: Content script loaded on', window.location.href);

// Listen for settings updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SETTINGS_UPDATED') {
    console.log('LinkedIn Summarizer: Settings updated!', message.settings);
    aiService.updateSettings(message.settings);
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
      aiService.updateSettings(result['aiSettings']);
      console.log('LinkedIn Summarizer: Loaded settings from storage');
    }
  } catch (error) {
    console.error('LinkedIn Summarizer: Failed to load settings', error);
  }

  // Inject toast styles
  uiService.injectToastStyles();

  // Initialize Chrome AI
  await aiService.initAI();

  // Wait a bit for LinkedIn to render
  setTimeout(() => {
    console.log('LinkedIn Summarizer: Running initial scan...');
    domService.addSummarizeButtons(handleSummarizeClick);
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
      domService.addSummarizeButtons(handleSummarizeClick);
      timeoutId = null;
    }, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);

  if (request.type === 'ping') {
    sendResponse({ status: 'alive' });
  }

  return true;
});
