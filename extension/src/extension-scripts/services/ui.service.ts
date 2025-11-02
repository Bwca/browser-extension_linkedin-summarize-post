// UI Service for FeedBurner
// Handles toast styling, creation, management, and label colors

class UIService {
  private stylesInjected = false;

  public injectToastStyles(): void {
    if (this.stylesInjected || document.getElementById('linkedin-summarizer-styles')) return;

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
    this.stylesInjected = true;
  }

  // Generate a consistent color for any label based on its text
  public getLabelColor(label: string): string {
    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate vibrant colors with high contrast for white text
    // Using very dark backgrounds ensures excellent readability of white text
    const hue = Math.abs(hash % 360);
    const saturation = 65 + (Math.abs(hash) % 25); // 65-90% - vibrant colors with good saturation
    const lightness = 25 + (Math.abs(hash >> 8) % 15); // 25-40% - much darker for better contrast

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  public displaySummaryToast(aiResponse: string): void {
    // Remove any existing toasts first
    const existingToasts = document.querySelectorAll('.linkedin-summarizer-toast');
    existingToasts.forEach((existingToast) => {
      existingToast.classList.add('hiding');
      setTimeout(() => existingToast.remove(), 300);
    });

    // Parse the AI response - support both LABEL and LABELS
    const summaryMatch = aiResponse.match(/SUMMARY:\s*(.+?)(?=LABELS?:|$)/s);
    const labelsMatch = aiResponse.match(/LABELS?:\s*(.+?)$/s);

    const summary = summaryMatch && summaryMatch[1] ? summaryMatch[1].trim() : aiResponse;
    const labelsText = labelsMatch && labelsMatch[1] ? labelsMatch[1].trim().toLowerCase() : 'other';

    // Split multiple labels by comma and limit to 2
    const labels = labelsText
      .split(/[,;/]+/)
      .map((l) => l.trim())
      .filter((l) => l)
      .slice(0, 2); // Limit to 2 labels for AI

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'linkedin-summarizer-toast';

    // Generate label badges HTML
    const labelBadgesHTML = labels
      .map((label) => {
        const color = this.getLabelColor(label);
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
}

// Export a singleton instance for backward compatibility
export const uiService = new UIService();
