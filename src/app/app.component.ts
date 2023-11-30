import { ChangeDetectorRef, Component, effect, inject, OnDestroy, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs';
import { UpdateService } from '../services/update.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, NgIf],
    selector: 'vki-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
    readonly #changeDetectorRef = inject(ChangeDetectorRef);
    readonly #media = inject(MediaMatcher);
    readonly #router = inject(Router);
    readonly #updateService = inject(UpdateService);
    readonly #matSnackBar = inject(MatSnackBar);

    #mobileQueryListener!: () => void;

    readonly currentVersionSignal = this.#updateService.currentVersionSignal;
    mobileQuery!: MediaQueryList;

    @ViewChild('sideNav')
    private readonly sideNav!: MatSidenav;

    constructor() {
        this.#setupMobileQueryListener();
        this.#setupRouteListener();
        this.#setupUpdateListener();
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this.#mobileQueryListener);
    }

    #setupMobileQueryListener(): void {
        this.mobileQuery = this.#media.matchMedia('(max-width: 600px)');
        this.#mobileQueryListener = () => this.#changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this.#mobileQueryListener);
    }

    #setupRouteListener(): void {
        this.#router.events.pipe(
            filter((event) => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.sideNav?.close();
            window.scrollTo(0,0);
        });
    }

    #setupUpdateListener(): void {
        effect(() => {
            const newVersionAvailable = this.#updateService.newVersionAvailableSignal();
            if (newVersionAvailable) {
                const snackBarRef = this.#matSnackBar.open('Nieuwe versie beschikbaar', 'Vernieuwen');
                snackBarRef.onAction().subscribe(() => {
                    document.location.reload();
                });
            }
        });
    }

}
