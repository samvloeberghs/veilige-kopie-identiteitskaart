import { isPlatformBrowser } from '@angular/common';
import { ApplicationRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, first, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UpdateService {
    readonly #swUpdate = inject(SwUpdate);
    readonly #applicationRef = inject(ApplicationRef);
    readonly #platformId = inject(PLATFORM_ID);
    readonly currentVersionSignal = signal('local-dev');
    readonly newVersionAvailableSignal = signal(false);

    constructor() {
        if (isPlatformBrowser(this.#platformId)) {
            this.#checkForUpdates();
            this.#startPeriodCheckForUpdates();
        }
    }

    #checkForUpdates(): void {
        this.#swUpdate.versionUpdates.subscribe(evt => {
            switch (evt.type) {
                case 'NO_NEW_VERSION_DETECTED':
                    this.currentVersionSignal.set(evt.version.hash);
                    break;
                case 'VERSION_READY':
                    this.currentVersionSignal.set(evt.currentVersion.hash);
                    this.newVersionAvailableSignal.set(true);
                    break;
                case 'VERSION_INSTALLATION_FAILED':
                    console.log(`Failed to install app version '${ evt.version.hash }': ${ evt.error }`);
                    break;
            }
        });
    }

    #startPeriodCheckForUpdates(): void {
        // Allow the app to stabilize first, before starting
        // polling for updates with `interval()`.
        const appIsStable$ = this.#applicationRef.isStable.pipe(first(isStable => isStable === true));
        // const everySixHours$ = interval(6 * 60 * 60 * 1000);
        const everySixHours$ = interval(1 * 60 * 1000); // every minute for testing
        const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

        everySixHoursOnceAppIsStable$.subscribe(async () => {
            try {
                await this.#swUpdate.checkForUpdate();
            } catch (err) {
                console.warn('Failed to check for updates:', err);
            }
        });
    }
}
