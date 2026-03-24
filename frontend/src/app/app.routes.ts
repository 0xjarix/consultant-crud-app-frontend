import { Routes } from '@angular/router';

import { ConsultantsPageComponent } from './features/consultants/consultants-page.component';

export const routes: Routes = [
  {
    path: '',
    component: ConsultantsPageComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
