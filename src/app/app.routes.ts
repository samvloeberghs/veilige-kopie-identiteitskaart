import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('../pages/home/home.component')
    },
    {
        path: 'over-ons',
        loadComponent: () => import('../pages/about/about.component')
    },
    {
        path: 'kopie-maken',
        loadComponent: () => import('../pages/make-copy/make-copy.component')
    },
];
