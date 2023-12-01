import { inject, Injectable } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { JsonLdService, SeoSocialShareData, SeoSocialShareService } from 'ngx-seo';

import { BehaviorSubject, Observable } from 'rxjs';
import { SeoRouteData } from '../models/seo-route-data.model';

const BASE_URL = `https://veilige-kopie-identiteitskaart.be`;

@Injectable({
  providedIn: 'root',
})
export class RouteHelper {
  readonly #router = inject(Router);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #seoSocialShareService = inject(SeoSocialShareService);
  readonly #jsonLdService = inject(JsonLdService);

  readonly currentUrl$: Observable<string>;
  readonly #currentUrl = new BehaviorSubject<string>('');

  constructor(
  ) {
    this.#setupRouting();
    this.currentUrl$ = this.#currentUrl.asObservable();
  }

  #setupRouting() {
    this.#router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.#activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary'),
    ).subscribe((route: ActivatedRoute) => {
      const seo: any = route.snapshot.data['seo'] as SeoRouteData;
      this.#currentUrl.next(this.#router.routerState.snapshot.url);
      if (seo) {
        const jsonLd = this.#jsonLdService.getObject('Website', {
          name: seo.title,
          url: BASE_URL + this.#router.routerState.snapshot.url,
        });
        this.#jsonLdService.setData(jsonLd);
        const seoData: SeoSocialShareData = {
          title: seo.title,
          description: seo.description,
          image: BASE_URL + seo.shareImg,
          url: BASE_URL + this.#router.routerState.snapshot.url,
          type: 'website',
        };
        this.#seoSocialShareService.setData(seoData);
      }
    });
  }

}
