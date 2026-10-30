// DOM Service for FeedBurner
// Handles button creation and DOM manipulation

class DOMService {
  private processedPosts = new WeakSet<Element>();

  public addSummarizeButtons(onSummarizeClick: (post: Element) => void): void {
    const posts = this.findPosts();

    let addedCount = 0;

    posts.forEach((post) => {
      // Skip if we've already added a button to this post
      if (this.processedPosts.has(post)) {
        return;
      }

      const actionBar = this.findActionBar(post);

      if (!actionBar) {
        return;
      }

      // Check if we already added a button (double-check)
      if (actionBar.querySelector('.linkedin-summarizer-button')) {
        this.processedPosts.add(post);
        return;
      }

      // Create the summarize button, borrowing the native Comment button's classes
      // so it matches LinkedIn's current (hashed) styling
      const nativeButton = actionBar.querySelector<HTMLElement>('[aria-label="Comment"]');
      const summarizeButton = this.createSummarizeButton(
        post,
        onSummarizeClick,
        nativeButton?.className
      );

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

  // LinkedIn's current feed: hashed class names, so rely on structure, roles and aria-labels.
  // Legacy class-based selectors are kept as fallbacks in case the old markup comes back.
  private findPosts(): Element[] {
    // Every post card (feed, profile, activity) is a list item with its own Comment control
    // (a link rather than a button in profile previews), but the surrounding list differs
    // per page, so start from the Comment controls
    const commentButtons = document.querySelectorAll('[aria-label="Comment"]');
    const posts = new Set<Element>();
    commentButtons.forEach((button) => {
      const post = button.closest('[role="listitem"]');
      if (post) {
        posts.add(post);
      }
    });
    if (posts.size > 0) {
      return Array.from(posts);
    }

    const legacySelectors = [
      '.feed-shared-update-v2[data-urn]',
      '[data-urn*="urn:li:activity"]',
      '.feed-shared-update-v2',
    ];
    for (const selector of legacySelectors) {
      const legacyPosts = document.querySelectorAll(selector);
      if (legacyPosts.length > 0) {
        return Array.from(legacyPosts);
      }
    }

    return [];
  }

  private findActionBar(post: Element): Element | null {
    // New markup: Like / Comment / Repost / Send share one parent
    const commentButton = post.querySelector('[aria-label="Comment"]');
    if (commentButton?.parentElement) {
      return commentButton.parentElement;
    }

    return (
      post.querySelector('.feed-shared-social-action-bar') ||
      post.querySelector('[class*="social-action"]')
    );
  }

  public createSummarizeButton(
    post: Element,
    onClick: (post: Element) => void,
    nativeClassName?: string
  ): HTMLElement {
    // Create button container to match the platform's structure
    const container = document.createElement('div');
    container.className =
      'feed-shared-social-action-bar__action-button feed-shared-social-action-bar--new-padding linkedin-summarizer-button';

    // Create the button with platform styling
    const button = document.createElement('button');
    button.className =
      nativeClassName ||
      'artdeco-button artdeco-button--muted artdeco-button--3 artdeco-button--tertiary social-actions-button flex-wrap';
    button.setAttribute('aria-label', 'Summarize this post');
    button.setAttribute('type', 'button');
    button.style.cssText = 'color: #0a66c2; display: inline-flex; align-items: center; gap: 4px;'; // LinkedIn blue

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
    // Get the post URN for identification (legacy markup only)
    const postUrn = post.getAttribute('data-urn');

    // Get author information
    let authorName =
      post.querySelector('.update-components-actor__title')?.textContent?.trim() || '';
    let authorTitle =
      post.querySelector('.update-components-actor__description')?.textContent?.trim() || '';

    // New markup: the post's control menu is labelled "Open control menu for post by <author>"
    if (!authorName) {
      const menuLabel =
        post
          .querySelector('[aria-label^="Open control menu for post by "]')
          ?.getAttribute('aria-label') || '';
      authorName = menuLabel.replace('Open control menu for post by ', '').trim();
    }

    // New markup: the header block is labelled "<author> Verified Profile 3rd+" etc.,
    // and the author's title sits in the next sibling of its first branching ancestor
    if (authorName && !authorTitle) {
      let node = post.querySelector(`div[aria-label^="${CSS.escape(authorName)}"]`);
      while (node && node !== post && node.parentElement?.childElementCount === 1) {
        node = node.parentElement;
      }
      authorTitle = node?.nextElementSibling?.textContent?.trim() || '';
    }

    // Get the post text content
    let postText = '';
    const contentSelectors = [
      '[data-testid="expandable-text-box"]',
      '.update-components-text',
      '[class*="commentary"]',
    ];
    for (const selector of contentSelectors) {
      postText = post.querySelector(selector)?.textContent?.trim() || '';
      if (postText) {
        break;
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
