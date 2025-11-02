import { Component, signal, OnInit, effect, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettingsService, SettingsProfile, AISettings } from '../../services/settings.service';
import { DatePipe } from '@angular/common';
import { SettingsFormData } from './models/settings-form-data.interface';
import { ProfileFormData } from './models/profile-form-data.interface';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  providers: [SettingsService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  // Modern dependency injection using inject()
  private settingsService = inject(SettingsService);

  // UI State
  saving = signal(false);
  message = signal('');
  isError = signal(false);
  loading = signal(true);

  // Profile management
  profiles = this.settingsService.profiles;
  activeProfileId = this.settingsService.activeProfileId;
  editingProfile: SettingsProfile | null = null;
  showAddProfile = signal(false);
  showEditProfile = signal(false);
  showDeleteConfirm = signal<{ profile: SettingsProfile | null }>({ profile: null });
  previewProfile: SettingsProfile | null = null;

  // Strongly typed reactive forms using constructors
  settingsForm = new FormGroup<SettingsFormData>({
    temperature: new FormControl(0.8, {
      validators: [Validators.required, Validators.min(0), Validators.max(1)],
      nonNullable: true,
    }),
    topK: new FormControl(3, {
      validators: [Validators.required, Validators.min(1), Validators.max(10)],
      nonNullable: true,
    }),
    systemPrompt: new FormControl('', {
      validators: [Validators.required, Validators.minLength(10)],
      nonNullable: true,
    }),
  });

  profileForm = new FormGroup<ProfileFormData>({
    name: new FormControl('', {
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
      nonNullable: true,
    }),
    temperature: new FormControl(0.8, {
      validators: [Validators.required, Validators.min(0), Validators.max(1)],
      nonNullable: true,
    }),
    topK: new FormControl(3, {
      validators: [Validators.required, Validators.min(1), Validators.max(10)],
      nonNullable: true,
    }),
    systemPrompt: new FormControl('', {
      validators: [Validators.required, Validators.minLength(10)],
      nonNullable: true,
    }),
  });

  constructor() {
    console.log('🔷 SettingsComponent constructor');

    // React to settings changes using Angular effect
    effect(() => {
      const currentSettings = this.settingsService.settings();
      console.log('🔄 Effect triggered - settings changed:', currentSettings);

      // Update the form with current settings
      this.settingsForm.patchValue({
        temperature: currentSettings.temperature,
        topK: currentSettings.topK,
        systemPrompt: currentSettings.systemPrompt,
      });

      console.log('🔄 Settings form updated with current values');
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
    const formValue = this.settingsForm.getRawValue();
    return (
      formValue.temperature === defaults.temperature &&
      formValue.topK === defaults.topK &&
      formValue.systemPrompt === defaults.systemPrompt
    );
  }

  async onSave() {
    if (this.settingsForm.invalid) {
      this.message.set('Please fix the form errors before saving.');
      this.isError.set(true);
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.isError.set(false);

    try {
      const formValue = this.settingsForm.getRawValue();
      await this.settingsService.saveSettings({
        temperature: formValue.temperature,
        topK: formValue.topK,
        systemPrompt: formValue.systemPrompt,
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
    const defaultPrompt = this.settingsService.getDefaultPrompt();
    this.settingsForm.patchValue({ systemPrompt: defaultPrompt });
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
    this.profileForm.reset({
      name: '',
      temperature: 0.8,
      topK: 3,
      systemPrompt: this.settingsService.getDefaultPrompt(),
    });
    this.showAddProfile.set(true);
  }

  cancelAddProfile() {
    this.showAddProfile.set(false);
    this.profileForm.reset();
  }

  async saveNewProfile() {
    if (this.profileForm.invalid) {
      this.message.set('Please fix the form errors before creating the profile.');
      this.isError.set(true);
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.isError.set(false);

    try {
      const formValue = this.profileForm.getRawValue();
      const newSettings: AISettings = {
        temperature: formValue.temperature,
        topK: formValue.topK,
        systemPrompt: formValue.systemPrompt,
      };

      await this.settingsService.createProfile(formValue.name.trim(), newSettings);
      this.message.set('✓ Profile created successfully!');
      this.showAddProfile.set(false);
      this.profileForm.reset();

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
    this.profileForm.patchValue({
      name: profile.name,
      temperature: profile.settings.temperature,
      topK: profile.settings.topK,
      systemPrompt: profile.settings.systemPrompt,
    });
    this.showEditProfile.set(true);
  }

  cancelEditProfile() {
    this.showEditProfile.set(false);
    this.editingProfile = null;
    this.profileForm.reset();
  }

  async saveEditedProfile() {
    if (!this.editingProfile || this.profileForm.invalid) {
      this.message.set('Please fix the form errors before updating the profile.');
      this.isError.set(true);
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.isError.set(false);

    try {
      const formValue = this.profileForm.getRawValue();
      const updatedSettings: AISettings = {
        temperature: formValue.temperature,
        topK: formValue.topK,
        systemPrompt: formValue.systemPrompt,
      };

      await this.settingsService.updateProfile(this.editingProfile!.id, {
        name: formValue.name.trim(),
        settings: updatedSettings,
      });

      this.message.set('✓ Profile updated successfully!');
      this.showEditProfile.set(false);
      this.editingProfile = null;
      this.profileForm.reset();

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
    this.profileForm.patchValue({
      name: `${profile.name} (Copy)`,
      temperature: profile.settings.temperature,
      topK: profile.settings.topK,
      systemPrompt: profile.settings.systemPrompt,
    });
    this.showAddProfile.set(true);
  }
}
