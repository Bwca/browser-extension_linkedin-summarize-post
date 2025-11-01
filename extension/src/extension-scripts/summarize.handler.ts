// Summarize handler for FeedBurner
// Handles the click event for summarize buttons

import { aiService } from './services/ai.service';
import { uiService } from './services/ui.service';
import { domService } from './services/dom.service';

export async function handleSummarizeClick(post: Element) {
  console.log('FeedBurner: Summarize button clicked!');

  // Extract post data using the DOM service
  const { authorName, authorTitle, postText, postUrn } = domService.extractPostData(post);

  console.log('Post URN:', postUrn);
  console.log('Author:', authorName);
  console.log('Title:', authorTitle);

  // Log the post content
  console.log('=== POST CONTENT START ===');
  console.log(postText);
  console.log('=== POST CONTENT END ===');
  console.log(`Content length: ${postText.length} characters`);

  // Check if AI is available
  if (!aiService.isReady()) {
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
    const response = await aiService.summarizePost(postText, authorName, authorTitle);

    // Parse and display the response in a toast
    uiService.displaySummaryToast(response);
  } catch (error) {
    console.error('FeedBurner: AI error:', error);

    // If we hit token limit or session error, try to reinitialize
    const errorMessage = error instanceof Error ? error.message : '';
    if (
      errorMessage.includes('token') ||
      errorMessage.includes('session') ||
      errorMessage.includes('quota')
    ) {
      console.log('FeedBurner: Possible token limit reached, reinitializing AI...');
      await aiService.initAI();

      // Retry the request with new session
      try {
        const retryResponse = await aiService.retrySummarizePost(postText, authorName, authorTitle);
        uiService.displaySummaryToast(retryResponse);
        return;
      } catch (retryError) {
        console.error('FeedBurner: Retry failed:', retryError);
      }
    }

    alert(`Error: ${errorMessage || 'Unknown error'}\n\nTry clicking the button again.`);
  }
}
