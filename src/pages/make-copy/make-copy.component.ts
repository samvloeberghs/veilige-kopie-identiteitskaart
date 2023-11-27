import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { wrapText } from 'wraptext.js';

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
        MatInputModule
    ],
    templateUrl: './make-copy.component.html',
    styleUrl: './make-copy.component.scss',
})
export default class MakeCopyComponent {
    readonly #activatedRoute = inject(ActivatedRoute);

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
        this.#listenToReasonSearchParam();
    }

    handleScan(side: 'front' | 'back', command: 'cancel' | 'preview' | 'download'): void {
        if (command === 'cancel') {
            this.state[side].showPhoto = false;
            this.state[side].showScanPreview = false;
        }

        if (command === 'preview') {
            this.state[side].showPhoto = false;
            this.state[side].showScanPreview = true;
            this.#showPreview(side);
        }

        if (command === 'download') {
            this.#createLinkAndDownload(side);
        }
    }

    takePicture(side: 'front' | 'back'): void {
        const canvas = document.getElementById(`${ side }-preview`) as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        // copy the video frame to the canvas
        const player = document.getElementById(`video-${ side }`) as HTMLVideoElement;
        const video = document.getElementById(`video-${ side }`) as HTMLVideoElement;
        const ratio = 16 / 10;
        const newWidth = video.videoWidth;
        const newHeight = newWidth / ratio;
        const xOffset = video.videoWidth > newWidth ? (newWidth - video.videoWidth) / 2 : 0;
        const yOffset =
            video.videoHeight > newHeight ? (newHeight - video.videoHeight) / 2 : 0;

        canvas.width = newWidth;
        canvas.height = newHeight;
        context?.fillRect(xOffset, yOffset, newWidth, newHeight);
        context?.drawImage(player, xOffset, yOffset, video.videoWidth, video.videoHeight);

        // add the watermark text
        if (context) {
            const text = this.reason;
            const font = '25px Arial';
            const lineHeight = 60;

            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowBlur = 2;
            context.shadowColor = 'rgba(0, 0, 0, 0.5)';
            context.fillStyle = 'rgba(255,255,255,0.25)'
            context.textAlign = 'left';
            context.font = font;

            // #wrapPostContent(font: string, lineHeight: number, content: string, maxWidth: number, maxHeight: number): string[] {
            const expandedText = new Array(100).join(text + ' | '); //change the multipler for more lines
            const maxLines = Math.floor(newHeight / lineHeight);

            wrapText(expandedText, {
                font: font,
                maxWidth: (newWidth - lineHeight * 2),
                maxLines: maxLines,
            }).lines
                .map(t => t.join(''))
                .forEach((line: string, i: number) => {
                context.fillText(line, lineHeight, (i + 1) * lineHeight);
            });
        }

        // save the state
        this.state[side].photoUrl = canvas.toDataURL('image/jpeg');
        this.state[side].showPhoto = true;
        this.state[side].showScanPreview = false;
    }

    #showPreview(side: 'front' | 'back'): void {
        // setTimeout is necessary to because the element will
        // only be visible after the next render cycle
        setTimeout(() => {
            const player = document.getElementById(`video-${ side }`) as HTMLVideoElement;
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
        const linkElement = document.createElement('a');
        linkElement.href = objectURL;
        linkElement.style.display = 'none';
        linkElement.download = fileName;
        // Using dispatchEvent is necessary as link.click() does not work on the latest firefox
        linkElement.dispatchEvent(
            new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
        );
        setTimeout(() => {
            // For Firefox it is necessary to delay revoking the ObjectURL
            URL.revokeObjectURL(objectURL);
            linkElement.remove();
        }, 100);
    }

    #listenToReasonSearchParam(): void {
        // TODO: untilDestroyed
        this.#activatedRoute.queryParams.subscribe((params) => {
            console.log(params);
            if (params['reden']) {
                this.reason = params['reden'];
            }
        })
    }
}
