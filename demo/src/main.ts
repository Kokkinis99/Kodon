import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideKodonToast } from '../../src/lib/provide-toast';

bootstrapApplication(AppComponent, {
  providers: [
    provideKodonToast({
      placement: 'bottom-end',
      duration: 5000,
      maxToasts: 5,
      gap: 14
    })
  ]
}).catch(err => console.error(err));
