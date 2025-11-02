import { Component, signal, OnInit, effect, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettingsService, SettingsProfile, AISettings } from '../../services/settings.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, RouterLink, DatePipe],
  providers: [SettingsService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  // Current profile being edited
  temperature = 0.8;
  topK = 3;
  systemPrompt = '';
  profileName = '';

  // UI State
  saving = signal(false);
  message = signal('');
  isError = signal(false);
  loading = signal(true);

  // Profile management
  profiles!: Signal<SettingsProfile[]>; // Will be initialized in constructor
  activeProfileId!: Signal<string>; // Will be initialized in constructor
  editingProfile: SettingsProfile | null = null;
  showAddProfile = signal(false);
  showEditProfile = signal(false);
  showDeleteConfirm = signal<{ profile: SettingsProfile | null }>({ profile: null });
  previewProfile: SettingsProfile | null = null;

  constructor(private settingsService: SettingsService) {
    console.log('🔷 SettingsComponent constructor');

    // Initialize signals after settingsService is available
    this.profiles = this.settingsService.profiles;
    this.activeProfileId = this.settingsService.activeProfileId;

    // React to settings changes using Angular effect
    effect(() => {
      const currentSettings = this.settingsService.settings();
      console.log('🔄 Effect triggered - settings changed:', currentSettings);
      this.temperature = currentSettings.temperature;
      this.topK = currentSettings.topK;
      this.systemPrompt = currentSettings.systemPrompt;
      console.log('🔄 Component values updated:', {
        temperature: this.temperature,
        topK: this.topK,
        promptLength: this.systemPrompt.length,
      });
    });
  }

  get activeProfile(): SettingsProfile | undefined {
    return this.profiles().find((p) => p.id === this.activeProfileId());
  }

  get currentEditingProfile(): SettingsProfile | null {
    if (this.showEditProfile()) {
      return this.editingProfile;
    }
    return null;
  }

  async ngOnInit() {
    console.log('🔷 [POPUP OPENED] SettingsComponent ngOnInit - loading settings from storage');
    // ALWAYS reload from storage when popup opens
    await this.settingsService.loadSettings();
    console.log('🟢 [POPUP OPENED] Settings loaded from storage, hiding loading state');
    this.loading.set(false);
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

  resetPromptToDefault() {
    this.systemPrompt = this.settingsService.getDefaultPrompt();
  }

  // Profile management methods
  async switchToProfile(profileId: string) {
    try {
      this.message.set('');
      this.isError.set(false);
      await this.settingsService.switchToProfile(profileId);
      this.message.set('✓ Switched to profile successfully!');
      setTimeout(() => this.message.set(''), 3000);
    } catch (error) {
      console.error('Failed to switch profile:', error);
      this.message.set('Failed to switch profile. Please try again.');
      this.isError.set(true);
    }
  }

  previewProfileSettings(profile: SettingsProfile) {
    this.previewProfile = profile;
  }

  closePreview() {
    this.previewProfile = null;
  }

  startAddProfile() {
    this.profileName = '';
    this.temperature = 0.8;
    this.topK = 3;
    this.systemPrompt = this.settingsService.getDefaultPrompt();
    this.showAddProfile.set(true);
  }

  cancelAddProfile() {
    this.showAddProfile.set(false);
    this.profileName = '';
  }

  async saveNewProfile() {
    if (!this.profileName.trim()) {
      this.message.set('Profile name is required.');
      this.isError.set(true);
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.isError.set(false);

    try {
      const newSettings: AISettings = {
        temperature: this.temperature,
        topK: this.topK,
        systemPrompt: this.systemPrompt,
      };

      await this.settingsService.createProfile(this.profileName.trim(), newSettings);
      this.message.set('✓ Profile created successfully!');
      this.showAddProfile.set(false);
      this.profileName = '';

      setTimeout(() => this.message.set(''), 3000);
    } catch (error) {
      console.error('Failed to create profile:', error);
      this.message.set('Failed to create profile. Please try again.');
      this.isError.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  startEditProfile(profile: SettingsProfile) {
    this.editingProfile = profile;
    this.profileName = profile.name;
    this.temperature = profile.settings.temperature;
    this.topK = profile.settings.topK;
    this.systemPrompt = profile.settings.systemPrompt;
    this.showEditProfile.set(true);
  }

  cancelEditProfile() {
    this.showEditProfile.set(false);
    this.editingProfile = null;
    this.profileName = '';
  }

  async saveEditedProfile() {
    if (!this.editingProfile || !this.profileName.trim()) {
      this.message.set('Profile name is required.');
      this.isError.set(true);
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.isError.set(false);

    try {
      const updatedSettings: AISettings = {
        temperature: this.temperature,
        topK: this.topK,
        systemPrompt: this.systemPrompt,
      };

      await this.settingsService.updateProfile(this.editingProfile.id, {
        name: this.profileName.trim(),
        settings: updatedSettings,
      });

      this.message.set('✓ Profile updated successfully!');
      this.showEditProfile.set(false);
      this.editingProfile = null;
      this.profileName = '';

      setTimeout(() => this.message.set(''), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      this.message.set('Failed to update profile. Please try again.');
      this.isError.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  confirmDeleteProfile(profile: SettingsProfile) {
    this.showDeleteConfirm.set({ profile });
  }

  cancelDeleteProfile() {
    this.showDeleteConfirm.set({ profile: null });
  }

  async deleteProfile() {
    const profile = this.showDeleteConfirm().profile;
    if (!profile) return;

    this.saving.set(true);
    this.message.set('');
    this.isError.set(false);

    try {
      await this.settingsService.deleteProfile(profile.id);
      this.message.set('✓ Profile deleted successfully!');
      this.showDeleteConfirm.set({ profile: null });

      setTimeout(() => this.message.set(''), 3000);
    } catch (error) {
      console.error('Failed to delete profile:', error);
      this.message.set('Failed to delete profile. Please try again.');
      this.isError.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  isProfileActive(profile: SettingsProfile): boolean {
    return profile.id === this.activeProfileId();
  }

  duplicateProfile(profile: SettingsProfile) {
    this.profileName = `${profile.name} (Copy)`;
    this.temperature = profile.settings.temperature;
    this.topK = profile.settings.topK;
    this.systemPrompt = profile.settings.systemPrompt;
    this.showAddProfile.set(true);
  }
}
