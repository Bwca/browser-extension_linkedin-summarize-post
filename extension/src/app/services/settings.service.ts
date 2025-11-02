import { Injectable, signal } from '@angular/core';

export interface AISettings {
  temperature: number;
  topK: number;
  systemPrompt: string;
}

export interface SettingsProfile {
  id: string;
  name: string;
  settings: AISettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsStorage {
  profiles: SettingsProfile[];
  activeProfileId: string;
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
  // Current active settings (derived from active profile)
  settings = signal<AISettings>(DEFAULT_SETTINGS);

  // All profiles
  profiles = signal<SettingsProfile[]>([]);

  // Active profile ID
  activeProfileId = signal<string>('');

  constructor() {
    console.log('🔷 SettingsService constructor - NEW INSTANCE created');
  }

  async loadSettings(): Promise<void> {
    try {
      console.log('🔵 [LOAD] Loading settings from chrome.storage.sync...');

      const result = await chrome.storage.sync.get('settingsProfiles');
      console.log('🔵 [LOAD] Storage result:', result);

      if (result['settingsProfiles']) {
        console.log('🟢 [LOAD] Found existing profiles');
        const storage: SettingsStorage = result['settingsProfiles'];
        this.profiles.set(storage.profiles);
        this.activeProfileId.set(storage.activeProfileId);

        // Set active settings from active profile
        const activeProfile = storage.profiles.find((p) => p.id === storage.activeProfileId);
        if (activeProfile) {
          this.settings.set(activeProfile.settings);
          console.log('🟢 [LOAD] Active profile loaded:', activeProfile.name);
        } else {
          console.log('⚠️ [LOAD] Active profile not found, using defaults');
          this.settings.set(DEFAULT_SETTINGS);
        }
      } else {
        console.log('⚠️ [LOAD] No settings found, creating default profile');
        await this.createDefaultProfile();
      }
    } catch (error) {
      console.error('❌ [LOAD] Failed to load settings:', error);
      // On error, ensure we at least have defaults
      this.settings.set(DEFAULT_SETTINGS);
    }
  }

  async saveSettings(settings: AISettings): Promise<void> {
    // For backward compatibility in the UI, this updates the active profile
    const activeId = this.activeProfileId();
    if (activeId) {
      await this.updateProfile(activeId, { settings });
    } else {
      // If no active profile, create one
      await this.createProfile('Custom Profile', settings);
    }
  }

  private async createDefaultProfile(): Promise<void> {
    const now = new Date();
    const defaultProfile: SettingsProfile = {
      id: 'default',
      name: 'Default Profile',
      settings: DEFAULT_SETTINGS,
      createdAt: now,
      updatedAt: now,
    };

    const storage: SettingsStorage = {
      profiles: [defaultProfile],
      activeProfileId: 'default',
    };

    await chrome.storage.sync.set({ settingsProfiles: storage });

    // Update signals
    this.profiles.set([defaultProfile]);
    this.activeProfileId.set('default');
    this.settings.set(DEFAULT_SETTINGS);
  }

  async createProfile(name: string, settings: AISettings): Promise<SettingsProfile> {
    const now = new Date();
    const id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newProfile: SettingsProfile = {
      id,
      name,
      settings: { ...settings },
      createdAt: now,
      updatedAt: now,
    };

    const currentProfiles = this.profiles();
    const updatedProfiles = [...currentProfiles, newProfile];

    const storage: SettingsStorage = {
      profiles: updatedProfiles,
      activeProfileId: this.activeProfileId(),
    };

    await chrome.storage.sync.set({ settingsProfiles: storage });

    this.profiles.set(updatedProfiles);

    return newProfile;
  }

  async updateProfile(
    profileId: string,
    updates: Partial<Pick<SettingsProfile, 'name' | 'settings'>>
  ): Promise<void> {
    const currentProfiles = this.profiles();
    const profileIndex = currentProfiles.findIndex((p) => p.id === profileId);

    if (profileIndex === -1) {
      throw new Error(`Profile with id ${profileId} not found`);
    }

    const currentProfile = currentProfiles[profileIndex]!;
    const updatedProfile: SettingsProfile = {
      id: currentProfile.id,
      name: updates.name ?? currentProfile.name,
      settings: updates.settings ?? currentProfile.settings,
      createdAt: currentProfile.createdAt,
      updatedAt: new Date(),
    };

    const updatedProfiles = [...currentProfiles];
    updatedProfiles[profileIndex] = updatedProfile;

    const storage: SettingsStorage = {
      profiles: updatedProfiles,
      activeProfileId: this.activeProfileId(),
    };

    await chrome.storage.sync.set({ settingsProfiles: storage });

    this.profiles.set(updatedProfiles);

    // If this was the active profile, update the settings signal
    if (profileId === this.activeProfileId()) {
      this.settings.set(updatedProfile.settings);
      await this.notifyContentScripts(updatedProfile.settings);
    }
  }

  async deleteProfile(profileId: string): Promise<void> {
    const currentProfiles = this.profiles();
    const filteredProfiles = currentProfiles.filter((p) => p.id !== profileId);

    if (filteredProfiles.length === currentProfiles.length) {
      throw new Error(`Profile with id ${profileId} not found`);
    }

    let newActiveId = this.activeProfileId();

    // If we deleted the active profile, switch to the first remaining profile or create default
    if (profileId === this.activeProfileId()) {
      if (filteredProfiles.length > 0) {
        newActiveId = filteredProfiles[0]!.id;
      } else {
        // If no profiles left, create default
        await this.createDefaultProfile();
        return;
      }
    }

    const storage: SettingsStorage = {
      profiles: filteredProfiles,
      activeProfileId: newActiveId,
    };

    await chrome.storage.sync.set({ settingsProfiles: storage });

    this.profiles.set(filteredProfiles);
    this.activeProfileId.set(newActiveId);

    // Update settings signal to active profile
    const activeProfile = filteredProfiles.find((p) => p.id === newActiveId);
    if (activeProfile) {
      this.settings.set(activeProfile.settings);
      await this.notifyContentScripts(activeProfile.settings);
    }
  }

  async switchToProfile(profileId: string): Promise<void> {
    const currentProfiles = this.profiles();
    const profile = currentProfiles.find((p) => p.id === profileId);

    if (!profile) {
      throw new Error(`Profile with id ${profileId} not found`);
    }

    const storage: SettingsStorage = {
      profiles: currentProfiles,
      activeProfileId: profileId,
    };

    await chrome.storage.sync.set({ settingsProfiles: storage });

    this.activeProfileId.set(profileId);
    this.settings.set(profile.settings);

    await this.notifyContentScripts(profile.settings);
  }

  getActiveProfile(): SettingsProfile | undefined {
    const profiles = this.profiles();
    const activeId = this.activeProfileId();
    return profiles.find((p) => p.id === activeId);
  }

  async resetSettings(): Promise<void> {
    const activeId = this.activeProfileId();
    if (activeId) {
      await this.updateProfile(activeId, { settings: DEFAULT_SETTINGS });
    }
  }

  private async notifyContentScripts(settings: AISettings): Promise<void> {
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
  }

  getDefaultPrompt(): string {
    return DEFAULT_SYSTEM_PROMPT;
  }

  getDefaultSettings(): AISettings {
    return { ...DEFAULT_SETTINGS };
  }
}
