import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: '', component: SettingsComponent },
  { path: 'about', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' },
];
