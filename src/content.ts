// Content script for LinkedIn Post Summarizer
// Runs on LinkedIn pages and adds UI elements for summarization

console.log(
  "LinkedIn Summarizer Extension: Content script loaded on",
  window.location.href
);

// Track which posts already have summarize buttons
const processedPosts = new WeakSet<Element>();

// AI session
let aiSession: any = null;

// Wait for the page to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

async function init() {
  console.log("LinkedIn Summarizer: Initializing...");
  console.log("LinkedIn Summarizer: Current URL:", window.location.href);
  console.log(
    "LinkedIn Summarizer: Document ready state:",
    document.readyState
  );

  // Initialize Chrome AI
  await initAI();

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

async function initAI() {
  // @ts-ignore - Chrome AI API types
  if (!("LanguageModel" in self)) {
    console.warn(
      "LinkedIn Summarizer: Chrome AI not available. Enable Prompt API in chrome://flags"
    );
    return;
  }

  console.log("LinkedIn Summarizer: Initializing Chrome AI...");

  try {
    // Destroy existing session if any
    if (aiSession) {
      try {
        aiSession.destroy();
      } catch (e) {
        console.log("LinkedIn Summarizer: Session already destroyed");
      }
      aiSession = null;
    }

    // @ts-ignore
    const { defaultTopK, defaultTemperature } =
      await self.LanguageModel.params();

    // @ts-ignore
    aiSession = await self.LanguageModel.create({
      temperature: defaultTemperature || 0.8,
      topK: defaultTopK || 3,
      initialPrompts: [
        {
          role: "system",
          content: `You are an expert at analyzing social media posts. When given a LinkedIn post, you should:
1. Provide a concise 2-3 sentence summary
2. Identify the tone/category from these options: humblebrag, ragebait, thought-leadership, genuine-insight, self-promotion, engagement-bait, inspirational, educational, job-posting, or other

Format your response EXACTLY as:
SUMMARY: [your summary here]
LABEL: [category]

Be direct and concise.`,
        },
      ],
    });

    console.log("LinkedIn Summarizer: Chrome AI initialized successfully!");
    logTokenStats();
  } catch (error) {
    console.error("LinkedIn Summarizer: AI initialization error:", error);
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
    console.warn(
      "LinkedIn Summarizer: Running low on tokens, will reinitialize on next error"
    );
  }
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

async function handleSummarizeClick(post: Element) {
  console.log("LinkedIn Summarizer: Summarize button clicked!");

  // Get the post URN for identification
  const postUrn = post.getAttribute("data-urn");
  console.log("Post URN:", postUrn);

  // Get the post text content
  const postContent = post.querySelector(".update-components-text");
  let postText = "";

  if (postContent) {
    postText = postContent.textContent?.trim() || "";
  }

  // If no content found with primary selector, try alternatives
  if (!postText) {
    const altContent = post.querySelector('[class*="commentary"]');
    if (altContent) {
      postText = altContent.textContent?.trim() || "";
    }
  }

  // Log the post content
  console.log("=== POST CONTENT START ===");
  console.log(postText);
  console.log("=== POST CONTENT END ===");
  console.log(`Content length: ${postText.length} characters`);

  // Check if AI is available
  if (!aiSession) {
    alert(
      "Chrome AI not available. Please enable Prompt API in chrome://flags"
    );
    return;
  }

  // Check if post has content
  if (!postText || postText.length < 10) {
    alert("No post content found to summarize.");
    return;
  }

  // Summarize with AI
  try {
    console.log("LinkedIn Summarizer: Sending to AI...");

    const prompt = `Analyze this LinkedIn post:\n\n${postText}`;
    const response = await aiSession.prompt(prompt);

    console.log("=== AI RESPONSE START ===");
    console.log(response);
    console.log("=== AI RESPONSE END ===");

    // Log token usage after each prompt
    logTokenStats();

    // Show the result in an alert (you can change this to a better UI later)
    alert(response);
  } catch (error) {
    console.error("LinkedIn Summarizer: AI error:", error);

    // If we hit token limit or session error, try to reinitialize
    const errorMessage = error instanceof Error ? error.message : "";
    if (
      errorMessage.includes("token") ||
      errorMessage.includes("session") ||
      errorMessage.includes("quota")
    ) {
      console.log(
        "LinkedIn Summarizer: Possible token limit reached, reinitializing AI..."
      );
      await initAI();

      // Retry the request with new session
      try {
        if (aiSession) {
          const retryPrompt = `Analyze this LinkedIn post:\n\n${postText}`;
          const retryResponse = await aiSession.prompt(retryPrompt);
          console.log("=== AI RESPONSE (RETRY) START ===");
          console.log(retryResponse);
          console.log("=== AI RESPONSE (RETRY) END ===");
          logTokenStats();
          alert(retryResponse);
          return;
        }
      } catch (retryError) {
        console.error("LinkedIn Summarizer: Retry failed:", retryError);
      }
    }

    alert(
      `Error: ${
        errorMessage || "Unknown error"
      }\n\nTry clicking the button again.`
    );
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);

  if (request.type === "ping") {
    sendResponse({ status: "alive" });
  }

  return true;
});
