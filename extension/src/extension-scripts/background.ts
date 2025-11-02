// Background service worker for FeedBurner
// Handles extension background tasks and message passing

console.log('FeedBurner Extension: Background script loaded');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Background received message:', request);

  // Handle different message types here
  if (request.type === 'summarizePost') {
    // TODO: Implement post summarization logic
    console.log('Summarize post request received');
    sendResponse({ success: true, message: 'Feature not yet implemented' });
  }

  return true; // Keep the message channel open for async responses
});

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    console.log('First time installation');
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});
