import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
    standalone: true,
    imports: [RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, NgIf],
    selector: 'vki-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
    public mobileQuery: MediaQueryList;
    public showScanPreviewFront = false;
    public showScanPreviewBack = false;

    private _mobileQueryListener: () => void;

    constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

    public onFileSelected(event: Event, side: 'front' | 'back'): void {
        console.log((event.target as HTMLInputElement).files, side);
    }

    public handleScan(side: 'front' | 'back', command: 'cancel' | 'preview'): void {
        if (command === 'cancel') {
            this.showScanPreviewBack = false;
            this.showScanPreviewFront = false;
        }

        if (command === 'preview') {
            if(side === 'front') {
                this.showScanPreviewBack = false;
                this.showScanPreviewFront = true;
            }
            if(side === 'back') {
                this.showScanPreviewBack = true;
                this.showScanPreviewFront = false;
            }
            this.showPreview(side);
        }
    }

    private showPreview(side: 'front' | 'back'): void {
        setTimeout(() => {
            const player = document.getElementById(side) as HTMLVideoElement;
            const constraints = {
                video: {
                    advanced: [{
                        facingMode: 'environment',
                        aspectRatio: 16 / 9,
                        width: 1280,
                        height: 720,
                    }],
                }
            };

            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                player.srcObject = stream;
            });
        });
    }

}
