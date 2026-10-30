// Content script for FeedBurner
// Runs on supported pages and adds UI elements for summarization

import { aiService } from './services/ai.service';
import { uiService } from './services/ui.service';
import { domService } from './services/dom.service';
import { handleSummarizeClick } from './summarize.handler';

// Types for settings profiles (mirroring the main app)
interface AISettings {
  temperature: number;
  topK: number;
  systemPrompt: string;
}

interface SettingsProfile {
  id: string;
  name: string;
  settings: AISettings;
}

console.log('FeedBurner Extension: Content script loaded on', window.location.href);

// Listen for settings updates
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === 'SETTINGS_UPDATED') {
    console.log('FeedBurner: Settings updated!', message.settings);
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
  console.log('FeedBurner: Initializing...');
  console.log('FeedBurner: Current URL:', window.location.href);
  console.log('FeedBurner: Document ready state:', document.readyState);

  // Load settings from storage
  try {
    const result = await chrome.storage.sync.get('settingsProfiles');
    if (result['settingsProfiles']) {
      const { profiles, activeProfileId } = result['settingsProfiles'];
      const activeProfile = profiles.find((p: SettingsProfile) => p.id === activeProfileId);
      if (activeProfile) {
        aiService.updateSettings(activeProfile.settings);
        console.log('FeedBurner: Loaded active profile settings from storage');
      }
    }
  } catch (error) {
    console.error('FeedBurner: Failed to load settings', error);
  }

  // Inject toast styles
  uiService.injectToastStyles();

  // Observe DOM changes to detect new posts as they load.
  // Throttle rather than debounce: the feed mutates constantly (videos, timestamps),
  // so a debounce could keep resetting and never add any buttons.
  let timeoutId: number | null = null;
  const observer = new MutationObserver((_mutations) => {
    if (timeoutId) {
      return;
    }

    timeoutId = window.setTimeout(() => {
      domService.addSummarizeButtons(handleSummarizeClick);
      timeoutId = null;
    }, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  domService.addSummarizeButtons(handleSummarizeClick);

  // Initialize Chrome AI last: create() can stay pending while the model downloads,
  // and that must not block the buttons from appearing
  await aiService.initAI();
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Content script received message:', request);

  if (request.type === 'ping') {
    sendResponse({ status: 'alive' });
  }

  return true;
});
