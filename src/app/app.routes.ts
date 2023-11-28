import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        title: 'Startpagina - Veilige Kopie Identiteitskaart',
        loadComponent: () => import('../pages/home/home.component')
    },
    {
        path: 'over-deze-applicatie',
        title: 'Over deze applicatie - Veilige Kopie Identiteitskaart',
        loadComponent: () => import('../pages/about/about.component')
    },
    {
        path: 'kopie-maken',
        title: 'Kopie maken - Veilige Kopie Identiteitskaart',
        loadComponent: () => import('../pages/make-copy/make-copy.component')
    },
    {
        path: 'disclaimer-privacy-policy',
        title: 'Disclaimer en privacy policy - Veilige Kopie Identiteitskaart',
        loadComponent: () => import('../pages/disclaimer-privacy-policy/disclaimer-privacy-policy.component')
    },
];
