import { InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;

export const WINDOW = new InjectionToken<Window>('WINDOW');
export const URL_TOKEN = new InjectionToken<typeof URL>('URL', {
    factory: () => URL,
});

// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any
export function windowFactory(platformId: Object): Window | any | Object {
    if (isPlatformBrowser(platformId) && window) {
        return window;
    }
    if (isPlatformServer(platformId) && global) {
        return {
            ...global,
            scrollTo: (_x: number, _y: number) => void 0,
        };
    }
    return {
        scrollTo: (_x: number, _y: number) => void 0,
    };
}

export const providers = [
    {
        provide: WINDOW,
        useFactory: windowFactory,
        deps: [PLATFORM_ID],
    },
];
