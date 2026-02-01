import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideKodonToast } from '../../src/lib/provide-toast';

bootstrapApplication(AppComponent, {
  providers: [
    provideKodonToast({
      placement: 'bottom-end',
      duration: 4000,
      gap: 14
    })
  ]
}).catch(err => console.error(err));
