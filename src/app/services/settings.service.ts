import { Injectable, signal } from '@angular/core';

export interface AISettings {
  temperature: number;
  topK: number;
}

const DEFAULT_SETTINGS: AISettings = {
  temperature: 0.8,
  topK: 3,
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
      await chrome.storage.sync.set({ aiSettings: settings });
      this.settings.set(settings);

      // Notify content script about settings change
      const tabs = await chrome.tabs.query({ url: 'https://www.linkedin.com/*' });
      for (const tab of tabs) {
        if (tab.id) {
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
}
