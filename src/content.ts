// Content script for LinkedIn Post Summarizer
// Runs on LinkedIn pages and adds UI elements for summarization

console.log(
  "LinkedIn Summarizer Extension: Content script loaded on",
  window.location.href
);

// Track which posts already have summarize buttons
const processedPosts = new WeakSet<Element>();

// Wait for the page to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function init() {
  console.log("LinkedIn Summarizer: Initializing...");
  console.log("LinkedIn Summarizer: Current URL:", window.location.href);
  console.log(
    "LinkedIn Summarizer: Document ready state:",
    document.readyState
  );

  // Wait a bit for LinkedIn to render
  setTimeout(() => {
    console.log("LinkedIn Summarizer: Running initial scan...");
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

function addSummarizeButtons() {
  // Try multiple selectors for LinkedIn posts
  let posts = document.querySelectorAll(".feed-shared-update-v2[data-urn]");

  // If no posts found, try alternative selectors
  if (posts.length === 0) {
    posts = document.querySelectorAll('[data-urn*="urn:li:activity"]');
  }

  if (posts.length === 0) {
    posts = document.querySelectorAll(".feed-shared-update-v2");
  }

  console.log(`LinkedIn Summarizer: Found ${posts.length} posts`);

  let addedCount = 0;

  posts.forEach((post) => {
    // Skip if we've already added a button to this post
    if (processedPosts.has(post)) {
      return;
    }

    // Find the social action bar (where Like, Comment, etc. buttons are)
    let actionBar = post.querySelector(".feed-shared-social-action-bar");

    // Try alternative selector if not found
    if (!actionBar) {
      actionBar = post.querySelector('[class*="social-action"]');
    }

    if (!actionBar) {
      return;
    }

    // Check if we already added a button (double-check)
    if (actionBar.querySelector(".linkedin-summarizer-button")) {
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
    console.log(
      `LinkedIn Summarizer: Added ${addedCount} new summarize buttons`
    );
  }
}

function createSummarizeButton(post: Element): HTMLElement {
  // Create button container to match LinkedIn's structure
  const container = document.createElement("div");
  container.className =
    "feed-shared-social-action-bar__action-button feed-shared-social-action-bar--new-padding linkedin-summarizer-button";

  // Create the button with LinkedIn's styling
  const button = document.createElement("button");
  button.className =
    "artdeco-button artdeco-button--muted artdeco-button--3 artdeco-button--tertiary social-actions-button flex-wrap";
  button.setAttribute("aria-label", "Summarize this post");
  button.setAttribute("type", "button");
  button.style.cssText = "color: #0a66c2;"; // LinkedIn blue

  // Create icon (using a simple document/text icon)
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("role", "none");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("class", "artdeco-button__icon");
  icon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  icon.setAttribute("width", "16");
  icon.setAttribute("height", "16");
  icon.setAttribute("viewBox", "0 0 16 16");
  icon.setAttribute("fill", "currentColor");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm2 1v8h8V4H4zm1 2h6v1H5V6zm0 2h6v1H5V8zm0 2h4v1H5v-1z"
  );
  icon.appendChild(path);

  // Create button text
  const buttonText = document.createElement("span");
  buttonText.className = "artdeco-button__text social-action-button__text";
  buttonText.textContent = "Summarize";

  // Assemble button
  button.appendChild(icon);
  button.appendChild(buttonText);
  container.appendChild(button);

  // Add click handler
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSummarizeClick(post);
  });

  return container;
}

function handleSummarizeClick(post: Element) {
  console.log("LinkedIn Summarizer: Summarize button clicked!");

  // Get the post URN for identification
  const postUrn = post.getAttribute("data-urn");
  console.log("Post URN:", postUrn);

  // Get the post text content
  const postContent = post.querySelector(".update-components-text");
  if (postContent) {
    console.log("Post content:", postContent.textContent?.trim());
  }

  // Show alert as requested
  alert("SUMMARIZE");

  // TODO: Send message to background script to actually summarize
  // chrome.runtime.sendMessage({
  //   type: 'summarizePost',
  //   postUrn: postUrn,
  //   content: postContent?.textContent?.trim()
  // });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);

  if (request.type === "ping") {
    sendResponse({ status: "alive" });
  }

  return true;
});
