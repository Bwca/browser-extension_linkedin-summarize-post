// AI Service for LinkedIn Post Summarizer
// Handles AI session initialization, token management, and AI interactions

interface AISettings {
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
LABELS: [label-1], [label-2]  (maximum 2 labels)

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
- "SUMMARY: Tech bro flexing stack to assert superiority. LABELS: tech-stack-wanker, insufferable-energy"

Be RUTHLESS. CREATE UNIQUE LABELS. Expose the real intent.`;

class AIService {
  private aiSession: any = null;
  private settings: AISettings;

  constructor(
    settings: AISettings = {
      temperature: 0.8,
      topK: 3,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
    }
  ) {
    this.settings = settings;
  }

  public updateSettings(newSettings: AISettings): void {
    this.settings = newSettings;
    // Reinitialize AI with new settings
    this.initAI();
  }

  public getSettings(): AISettings {
    return this.settings;
  }

  public async initAI(): Promise<void> {
    // @ts-ignore - Chrome AI API types
    if (!('LanguageModel' in self)) {
      console.warn(
        'LinkedIn Summarizer: Chrome AI not available. Enable Prompt API in chrome://flags'
      );
      return;
    }

    console.log('LinkedIn Summarizer: Initializing Chrome AI...');

    try {
      // Destroy existing session if any
      if (this.aiSession) {
        try {
          this.aiSession.destroy();
        } catch (e) {
          console.log('LinkedIn Summarizer: Session already destroyed');
        }
        this.aiSession = null;
      }

      // @ts-ignore
      this.aiSession = await self.LanguageModel.create({
        temperature: this.settings.temperature,
        topK: this.settings.topK,
        initialPrompts: [
          {
            role: 'system',
            content: this.settings.systemPrompt,
          },
        ],
      });

      console.log(
        `LinkedIn Summarizer: Chrome AI initialized successfully! (temp: ${this.settings.temperature}, topK: ${this.settings.topK})`
      );
      this.logTokenStats();
    } catch (error) {
      console.error('LinkedIn Summarizer: AI initialization error:', error);
      this.aiSession = null;
    }
  }

  public logTokenStats(): void {
    if (!this.aiSession) return;

    // Handle both old and new API shapes
    const maxTokens = this.aiSession.inputQuota || this.aiSession.maxTokens;
    const tokensUsed = this.aiSession.inputUsage || this.aiSession.tokensSoFar;
    const tokensLeft =
      this.aiSession.tokensSoFar !== undefined
        ? this.aiSession.tokensSoFar
        : this.aiSession.inputQuota - this.aiSession.inputUsage;

    console.log(
      `LinkedIn Summarizer: Token stats - Used: ${tokensUsed}, Left: ${tokensLeft}, Max: ${maxTokens}`
    );

    // If running low on tokens (less than 20%), warn
    if (maxTokens && tokensLeft < maxTokens * 0.2) {
      console.warn('LinkedIn Summarizer: Running low on tokens, will reinitialize on next error');
    }
  }

  public async summarizePost(
    postText: string,
    authorName?: string,
    authorTitle?: string
  ): Promise<string> {
    if (!this.aiSession) {
      throw new Error('Chrome AI not available. Please enable Prompt API in chrome://flags');
    }

    console.log('LinkedIn Summarizer: Sending to AI...');

    // Build context-aware prompt
    let prompt = 'Analyze this LinkedIn post:\n\n';
    if (authorTitle) {
      prompt += `AUTHOR: ${authorName}\nTITLE: ${authorTitle}\n\n`;
    }
    prompt += `POST:\n${postText}`;

    const response = await this.aiSession.prompt(prompt);

    console.log('=== AI RESPONSE START ===');
    console.log(response);
    console.log('=== AI RESPONSE END ===');

    // Log token usage after each prompt
    this.logTokenStats();

    return response;
  }

  public async retrySummarizePost(
    postText: string,
    authorName?: string,
    authorTitle?: string
  ): Promise<string> {
    if (!this.aiSession) {
      throw new Error('AI session not available for retry');
    }

    let retryPrompt = 'Analyze this LinkedIn post:\n\n';
    if (authorTitle) {
      retryPrompt += `AUTHOR: ${authorName}\nTITLE: ${authorTitle}\n\n`;
    }
    retryPrompt += `POST:\n${postText}`;

    const retryResponse = await this.aiSession.prompt(retryPrompt);
    console.log('=== AI RESPONSE (RETRY) START ===');
    console.log(retryResponse);
    console.log('=== AI RESPONSE (RETRY) END ===');
    this.logTokenStats();

    return retryResponse;
  }

  public isReady(): boolean {
    return this.aiSession !== null;
  }
}

// Export a singleton instance for backward compatibility
export const aiService = new AIService();
