// DOM Service for FeedBurner
// Handles button creation and DOM manipulation

class DOMService {
  private processedPosts = new WeakSet<Element>();

  public addSummarizeButtons(onSummarizeClick: (post: Element) => void): void {
    // Try multiple selectors for posts
    let posts = document.querySelectorAll('.feed-shared-update-v2[data-urn]');

    // If no posts found, try alternative selectors
    if (posts.length === 0) {
      posts = document.querySelectorAll('[data-urn*="urn:li:activity"]');
    }

    if (posts.length === 0) {
      posts = document.querySelectorAll('.feed-shared-update-v2');
    }

    console.log(`FeedBurner: Found ${posts.length} posts`);

    let addedCount = 0;

    posts.forEach((post) => {
      // Skip if we've already added a button to this post
      if (this.processedPosts.has(post)) {
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
        this.processedPosts.add(post);
        return;
      }

      // Create the summarize button
      const summarizeButton = this.createSummarizeButton(post, onSummarizeClick);

      // Insert the button at the end of the action bar
      actionBar.appendChild(summarizeButton);

      // Mark this post as processed
      this.processedPosts.add(post);
      addedCount++;
    });

    if (addedCount > 0) {
      console.log(`FeedBurner: Added ${addedCount} new summarize buttons`);
    }
  }

  public createSummarizeButton(post: Element, onClick: (post: Element) => void): HTMLElement {
    // Create button container to match the platform's structure
    const container = document.createElement('div');
    container.className =
      'feed-shared-social-action-bar__action-button feed-shared-social-action-bar--new-padding linkedin-summarizer-button';

    // Create the button with platform styling
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
      onClick(post);
    });

    return container;
  }

  public extractPostData(post: Element): {
    authorName: string;
    authorTitle: string;
    postText: string;
    postUrn?: string;
  } {
    // Get the post URN for identification
    const postUrn = post.getAttribute('data-urn');

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

    const result: { authorName: string; authorTitle: string; postText: string; postUrn?: string } = { authorName, authorTitle, postText };
    if (postUrn) {
      result.postUrn = postUrn;
    }
    return result;
  }
}

// Export a singleton instance for backward compatibility
export const domService = new DOMService();
