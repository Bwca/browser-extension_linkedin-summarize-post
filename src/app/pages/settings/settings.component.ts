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
  saving = signal(false);
  message = signal('');
  isError = signal(false);

  constructor(private settingsService: SettingsService) {
    const currentSettings = this.settingsService.settings();
    this.temperature = currentSettings.temperature;
    this.topK = currentSettings.topK;
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
      });
      this.message.set('✓ Settings saved successfully!');

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

  async onReset() {
    this.saving.set(true);
    this.message.set('');
    this.isError.set(false);

    try {
      await this.settingsService.resetSettings();
      const defaultSettings = this.settingsService.settings();
      this.temperature = defaultSettings.temperature;
      this.topK = defaultSettings.topK;
      this.message.set('✓ Settings reset to defaults!');

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
}
