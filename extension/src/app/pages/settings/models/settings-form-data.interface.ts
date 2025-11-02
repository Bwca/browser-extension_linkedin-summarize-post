import { FormControl } from '@angular/forms';

export interface SettingsFormData {
  temperature: FormControl<number>;
  topK: FormControl<number>;
  systemPrompt: FormControl<string>;
}
