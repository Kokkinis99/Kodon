import { provideZoneChangeDetection } from "@angular/core";
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideKodonToast } from '../../src/lib/provide-toast';
import { PromoComponent } from './promo.component';

bootstrapApplication(PromoComponent, {
  providers: [provideZoneChangeDetection(),provideKodonToast({ placement: 'bottom-center', duration: 60_000, maxToasts: 4 })]
}).catch(err => console.error(err));
