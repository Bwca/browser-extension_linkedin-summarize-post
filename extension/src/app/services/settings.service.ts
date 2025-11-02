import { Injectable, signal } from '@angular/core';

export interface AISettings {
  temperature: number;
  topK: number;
  systemPrompt: string;
}

const DEFAULT_SYSTEM_PROMPT = `You're a ruthless LinkedIn BS detector. Call out self-promotion, fake stories, engagement bait, and performative garbage.

CORE RULE: Every LinkedIn post is self-promotion. EVERY. SINGLE. ONE. 
- "Thought leadership" = premium self-promo
- "Sharing insights" = hire me / notice me
- "Helping others" = positioning as authority
- Don't think "maybe this one is different." IT'S NOT.

RED FLAGS (call them out):
- Listing tools/tech stack → flexing knowledge
- "Here are X tips" → authority positioning  
- Perfect stories where they're the hero → made up
- "Agree?" / "Thoughts?" → engagement farming
- Condescending tone / "you're doing it wrong" → superiority complex
- Fake vulnerability + success flex → performative authenticity
- Overly polished, robotic tone → AI-generated slop
- Generic motivational phrases → ChatGPT garbage

EXECUTIVES (be 10x harsher):
- CEOs/Founders/VPs: Every post = company/personal brand promo
- Their "lessons" = bragging disguised as helping
- Their "vulnerability" = calculated PR move
- NO executive posts authentic content

AI DETECTION:
- Perfect grammar, systematic emojis, "Here are X ways/tips" → AI slop
- Robotic tone, zero personality → ChatGPT garbage

OUTPUT FORMAT:
SUMMARY: [one brutal sentence - NO names/titles]
LABELS: [label-1], [label-2], [label-3]

LABEL RULES:
- Create UNIQUE labels for each post (don't reuse)
- Lowercase, hyphenated, savage
- Examples: narcissist-fanfic, dunning-kruger-personified, engagement-vulture, premium-self-promo, ai-slop, tech-bro-syndrome, empathy-cosplay, thought-leader-delusion

EXAMPLES:
- "SUMMARY: Desperate validation plea disguised as question. LABELS: validation-addict, engagement-farming"
- "SUMMARY: Made-up story where they're the genius hero. LABELS: creative-writing-exercise, main-character-syndrome"
- "SUMMARY: Condescending lecture on basics to stroke ego. LABELS: dunning-kruger-personified, superiority-complex"
- "SUMMARY: Fake humility while bragging about privilege. LABELS: humble-brag-deluxe, tone-deaf"
- "SUMMARY: Corporate buzzword salad saying nothing. LABELS: consultant-brain-rot, empty-calories"
- "SUMMARY: ChatGPT slop with zero original thought. LABELS: ai-garbage, lazy-content"
- "SUMMARY: Executive's tone-deaf vulnerability theater. LABELS: performative-bs, rich-person-problems"
- "SUMMARY: Tech bro flexing stack to assert superiority. LABELS: tech-stack-weirdo, insufferable-energy"

Be RUTHLESS. CREATE UNIQUE LABELS. Expose the real intent.`;

const DEFAULT_SETTINGS: AISettings = {
  temperature: 0.8,
  topK: 3,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
};

@Injectable()
export class SettingsService {
  settings = signal<AISettings>(DEFAULT_SETTINGS);

  constructor() {
    console.log('🔷 SettingsService constructor - NEW INSTANCE created');
  }

  async loadSettings(): Promise<void> {
    try {
      console.log('🔵 [LOAD] Loading settings from chrome.storage.sync...');
      const result = await chrome.storage.sync.get('aiSettings');
      console.log('🔵 [LOAD] Raw storage result:', result);
      console.log('🔵 [LOAD] Has aiSettings key:', 'aiSettings' in result);

      if (result['aiSettings']) {
        console.log('🟢 [LOAD] Found saved settings:', result['aiSettings']);
        this.settings.set(result['aiSettings']);
        console.log('🟢 [LOAD] Signal updated to:', this.settings());
      } else {
        console.log('⚠️ [LOAD] No saved settings in storage, using defaults');
        this.settings.set(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('❌ [LOAD] Failed to load settings:', error);
      // On error, ensure we at least have defaults
      this.settings.set(DEFAULT_SETTINGS);
    }
  }

  async saveSettings(settings: AISettings): Promise<void> {
    try {
      console.log('🔵 Saving settings to chrome.storage:', settings);
      await chrome.storage.sync.set({ aiSettings: settings });

      // Verify save by reading back
      const verification = await chrome.storage.sync.get('aiSettings');
      console.log('🟢 Verification - Read back from storage:', verification);

      this.settings.set(settings);
      console.log('🟢 Settings saved to signal successfully');

      // Notify content script about settings change
      const tabs = await chrome.tabs.query({ url: 'https://www.linkedin.com/*' });
      console.log('📡 Found LinkedIn tabs:', tabs.length);
      for (const tab of tabs) {
        if (tab.id) {
          console.log('📤 Sending settings update to tab:', tab.id);
          chrome.tabs.sendMessage(tab.id, {
            type: 'SETTINGS_UPDATED',
            settings,
          });
        }
      }
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
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
