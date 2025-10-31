import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  temperature = 0.8;
  topK = 3;
  systemPrompt = '';
  saving = signal(false);
  message = signal('');
  isError = signal(false);
  showResetConfirm = signal(false);

  constructor(private settingsService: SettingsService) {
    const currentSettings = this.settingsService.settings();
    this.temperature = currentSettings.temperature;
    this.topK = currentSettings.topK;
    this.systemPrompt = currentSettings.systemPrompt;
  }

  get isUsingDefaults(): boolean {
    const defaults = this.settingsService.getDefaultSettings();
    return (
      this.temperature === defaults.temperature &&
      this.topK === defaults.topK &&
      this.systemPrompt === defaults.systemPrompt
    );
  }

  onTemperatureChange() {
    this.temperature = Math.round(this.temperature * 10) / 10;
  }

  onTopKChange() {
    this.topK = Math.round(this.topK);
  }

  async onSave() {
    this.saving.set(true);
    this.message.set('');
    this.isError.set(false);

    try {
      await this.settingsService.saveSettings({
        temperature: this.temperature,
        topK: this.topK,
        systemPrompt: this.systemPrompt,
      });
      this.message.set('✓ Settings saved and AI reinitialized!');

      setTimeout(() => {
        this.message.set('');
      }, 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.message.set('Failed to save settings. Please try again.');
      this.isError.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  confirmReset() {
    this.showResetConfirm.set(true);
  }

  cancelReset() {
    this.showResetConfirm.set(false);
  }

  async onReset() {
    this.showResetConfirm.set(false);
    this.saving.set(true);
    this.message.set('');
    this.isError.set(false);

    try {
      await this.settingsService.resetSettings();
      const defaultSettings = this.settingsService.settings();
      this.temperature = defaultSettings.temperature;
      this.topK = defaultSettings.topK;
      this.systemPrompt = defaultSettings.systemPrompt;
      this.message.set('✓ Settings reset to defaults and AI reinitialized!');

      setTimeout(() => {
        this.message.set('');
      }, 3000);
    } catch (error) {
      console.error('Failed to reset settings:', error);
      this.message.set('Failed to reset settings. Please try again.');
      this.isError.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  resetPromptToDefault() {
    this.systemPrompt = this.settingsService.getDefaultPrompt();
  }
}
