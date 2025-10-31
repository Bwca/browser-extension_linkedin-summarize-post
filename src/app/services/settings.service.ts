import { Injectable, signal } from '@angular/core';

export interface AISettings {
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

const DEFAULT_SETTINGS: AISettings = {
  temperature: 0.8,
  topK: 3,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  settings = signal<AISettings>(DEFAULT_SETTINGS);

  constructor() {
    this.loadSettings();
  }

  async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get('aiSettings');
      if (result['aiSettings']) {
        this.settings.set(result['aiSettings']);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings(settings: AISettings): Promise<void> {
    try {
      console.log('Saving settings to chrome.storage:', settings);
      await chrome.storage.sync.set({ aiSettings: settings });
      this.settings.set(settings);
      console.log('Settings saved successfully');

      // Notify content script about settings change
      const tabs = await chrome.tabs.query({ url: 'https://www.linkedin.com/*' });
      console.log('Found LinkedIn tabs:', tabs.length);
      for (const tab of tabs) {
        if (tab.id) {
          console.log('Sending settings update to tab:', tab.id);
          chrome.tabs.sendMessage(tab.id, {
            type: 'SETTINGS_UPDATED',
            settings,
          });
        }
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async resetSettings(): Promise<void> {
    await this.saveSettings(DEFAULT_SETTINGS);
  }

  getDefaultPrompt(): string {
    return DEFAULT_SYSTEM_PROMPT;
  }

  getDefaultSettings(): AISettings {
    return { ...DEFAULT_SETTINGS };
  }
}
