import { FormControl } from '@angular/forms';

export interface ProfileFormData {
  name: FormControl<string>;
  temperature: FormControl<number>;
  topK: FormControl<number>;
  systemPrompt: FormControl<string>;
}
