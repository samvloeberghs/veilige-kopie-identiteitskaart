import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { DOCUMENT, NgIf } from '@angular/common';
import { FormControl, FormsModule, NgModel } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImageHandlingService } from '../../services/image-handling.service';
import { WINDOW } from '../../services/window';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { combineLatest, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatMenuModule } from '@angular/material/menu';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

interface State {
    'front': {
        showScanPreview: boolean;
        showPhoto: boolean;
        photoUrl?: string;
    }
    'back': {
        showScanPreview: boolean;
        showPhoto: boolean;
        photoUrl?: string;
    }
}

@Component({
    selector: 'vki-make-copy',
    standalone: true,
    imports: [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        NgIf,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatStepperModule,
        MatMenuModule
    ],
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: { displayDefaultIndicatorType: false }
        }
    ],
    templateUrl: './make-copy.component.html',
    styleUrl: './make-copy.component.scss',
})
export default class MakeCopyComponent implements AfterViewInit {
    @ViewChild('reasonNgModel')
    private readonly reasonNgModel!: NgModel;

    @ViewChild('stepper')
    private readonly stepper!: MatStepper;

    readonly #document = inject(DOCUMENT);
    readonly #window = inject(WINDOW);
    readonly #matSnackBar = inject(MatSnackBar);
    readonly #activatedRoute = inject(ActivatedRoute);
    readonly #imageHandlingService = inject(ImageHandlingService);

    readonly now = new Date();
    readonly #viewReady = new Subject<void>();

    reason = '';

    state: State = {
        'front': {
            showScanPreview: false,
            showPhoto: false,
        },
        'back': {
            showScanPreview: false,
            showPhoto: false,
        }
    }

    constructor() {
        this.#listenToSearchParams();
    }

    ngAfterViewInit(): void {
        this.#viewReady.next();
    }

    handleScan(side: 'front' | 'back', command: 'cancel' | 'preview' | 'download'): void {
        if (command === 'cancel') {
            this.state[side].showPhoto = false;
            this.state[side].showScanPreview = false;
            this.state[side].photoUrl = undefined;
        }

        if (command === 'preview') {
            if ((this.reasonNgModel.control as FormControl).invalid) {
                (this.reasonNgModel.control as FormControl).markAsTouched();
                this.#window.scrollTo({ top: 0, behavior: 'smooth' });
                this.#matSnackBar.open('Reden ontbreekt', 'Sluit', {
                    duration: 10000,
                });
            } else {
                this.state[side].showPhoto = false;
                this.state[side].showScanPreview = true;
                this.#showPreview(side);
            }
        }

        if (command === 'download') {
            this.#createLinkAndDownload(side);
        }
    }

    takePicture(side: 'front' | 'back'): void {
        const player = this.#document.getElementById(`video-${ side }`) as HTMLVideoElement;
        const video = this.#document.getElementById(`video-${ side }`) as HTMLVideoElement;
        const ratio = 16 / 10;
        const newWidth = video.videoWidth;
        const newHeight = newWidth / ratio;
        const xOffset = video.videoWidth > newWidth ? (newWidth - video.videoWidth) / 2 : 0;
        const yOffset = video.videoHeight > newHeight ? (newHeight - video.videoHeight) / 2 : 0;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        let sideText = 'Voorkant';
        if (side === 'back') {
            sideText = 'Achterkant';
        }

        const fullReason = `(${ this.now.toLocaleDateString() } - ${ sideText }) - Reden kopie: ${ this.reason }`;
        this.#imageHandlingService.start('#ffffff', 0.5, 1.4, 2, this.reason, fullReason, player, newWidth, newHeight, xOffset, yOffset, videoWidth, videoHeight);

        // save the state
        this.state[side].photoUrl = this.#imageHandlingService.getDataURL();
        // this.state[side].photoUrl = canvas.toDataURL('image/jpeg');
        this.state[side].showPhoto = true;
        this.state[side].showScanPreview = false;
    }

    #showPreview(side: 'front' | 'back'): void {
        // setTimeout is necessary to because the element will
        // only be visible after the next render cycle
        setTimeout(() => {
            const player = this.#document.getElementById(`video-${ side }`) as HTMLVideoElement;
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

    #createLinkAndDownload(side: 'front' | 'back'): void {
        const objectURL = this.state[side].photoUrl as string;
        const fileName = `${ side }_${ (new Date()).toISOString() }.jpg`;
        const linkElement = this.#document.createElement('a');
        linkElement.href = objectURL;
        linkElement.style.display = 'none';
        linkElement.download = fileName;
        // Using dispatchEvent is necessary as link.click() does not work on the latest firefox
        linkElement.dispatchEvent(
            new MouseEvent('click', { bubbles: true, cancelable: true, view: this.#window }),
        );
        setTimeout(() => {
            // For Firefox it is necessary to delay revoking the ObjectURL
            URL.revokeObjectURL(objectURL);
            linkElement.remove();
        }, 100);
    }

    #listenToSearchParams(): void {
        // TODO: untilDestroyed
        combineLatest([
            this.#viewReady,
            this.#activatedRoute.queryParams
        ])
            .pipe(
                map(([_, params]) => params)
            )
            .subscribe((params) => {
                if (params['reden']) {
                    this.reason = params['reden'];
                }
                if (params['stap'] && this.reason.length >= 10 && this.reason.length <= 75) {
                    this.stepper.selectedIndex = +params['stap'] - 1;
                }
            })
    }
}
