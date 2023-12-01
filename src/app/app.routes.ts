import { Route } from '@angular/router';
import { SeoRouteData } from '../models/seo-route-data.model';

export const appRoutes: Route[] = [
    {
        path: '',
        title: 'Startpagina - Veilige Kopie Identiteitskaart',
        data: {
            seo: {
                title: 'Veilige Kopie Identiteitskaart',
                description: 'Gebruik onze tool ter aanmaken van een kopie van uw identiteitskaart, of ander waardevol document, door het toevoegen van een watermerk en/of uitwissen van gevoelige of onnodig te delen informatie.',
                shareImg: '/assets/share/veilige-kopie-identiteitskaart.png',
            } as SeoRouteData
        },
        loadComponent: () => import('../pages/home/home.component')
    },
    {
        path: 'over-deze-applicatie',
        title: 'Over deze applicatie - Veilige Kopie Identiteitskaart',
        data: {
            seo: {
                title: 'Over deze applicatie - Veilige Kopie Identiteitskaart',
                description: 'Lees meer over de oorsprong, inspiratie en geboorte van de applicatie.',
                shareImg: '/assets/share/veilige-kopie-identiteitskaart.png',
            } as SeoRouteData
        },
        loadComponent: () => import('../pages/about/about.component')
    },
    {
        path: 'kopie-maken',
        title: 'Kopie maken - Veilige Kopie Identiteitskaart',
        data: {
            seo: {
                title: 'Kopie maken - Veilige Kopie Identiteitskaart',
                description: 'Uw gegevens zijn veilig. Er worden geen cookies gebruikt en al uw data wordt lokaal verwerkt in de applicatie waardoor er niets wordt verstuurd naar een server.',
                shareImg: '/assets/share/veilige-kopie-identiteitskaart.png',
            } as SeoRouteData
        },
        loadComponent: () => import('../pages/make-copy/make-copy.component')
    },
    {
        path: 'disclaimer-privacy-policy',
        title: 'Disclaimer & privacy policy - Veilige Kopie Identiteitskaart',
        data: {
            seo: {
                title: 'Disclaimer & Privacy Policy - Veilige Kopie Identiteitskaart',
                description: 'De applicatie werkt ondere andere door het toevoegen van een watermerk over de kopies van de identiteitskaart of ander document. Deze techniek beperkt het gebruik van deze kopies bij een eventueel datalek of malafide verkoop van gegevens, maar sluit het zeker niet uit.',
                shareImg: '/assets/share/veilige-kopie-identiteitskaart.png',
            } as SeoRouteData
        },
        loadComponent: () => import('../pages/disclaimer-privacy-policy/disclaimer-privacy-policy.component')
    },
];
