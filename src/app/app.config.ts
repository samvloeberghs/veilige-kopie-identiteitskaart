import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { providers as windowProviders } from '../services/window';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withComponentInputBinding(),
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled',
            }),
        ),
        provideAnimations(),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
        }),
        provideClientHydration(),
        windowProviders
    ],
};
