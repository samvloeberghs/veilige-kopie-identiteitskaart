import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

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
    NgIf
  ],
  templateUrl: './make-copy.component.html',
  styleUrl: './make-copy.component.scss',
})
export default class MakeCopyComponent {
  public state: State = {
    'front': {
      showScanPreview: false,
      showPhoto: false,
    },
    'back': {
      showScanPreview: false,
      showPhoto: false,
    }
  }

  public handleScan(side: 'front' | 'back', command: 'cancel' | 'preview' | 'download'): void {
    if (command === 'cancel') {
      this.state[side].showPhoto = false;
      this.state[side].showScanPreview = false;
    }

    if (command === 'preview') {
      this.state[side].showPhoto = false;
      this.state[side].showScanPreview = true;
      this.showPreview(side);
    }

    if(command === 'download'){
      this.createLinkAndDownload(side);
    }
  }

  public takePicture(side: 'front' | 'back'): void {
    const canvas = document.getElementById(`${ side }-preview`) as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    const player = document.getElementById(`video-${ side }`) as HTMLVideoElement;
    const video = document.getElementById(`video-${ side }`) as HTMLVideoElement;
    const ratio = 16 / 10;
    let newWidth = video.videoWidth;
    let newHeight = newWidth / ratio;
    canvas.width = newWidth;
    canvas.height = newHeight;

    const xOffset = video.videoWidth > canvas.width ? (canvas.width - video.videoWidth) / 2 : 0;
    const yOffset =
        video.videoHeight > canvas.height ? (canvas.height - video.videoHeight) / 2 : 0;

    context?.fillRect(xOffset, yOffset, newWidth, newHeight);
    context?.drawImage(player, xOffset, yOffset, video.videoWidth, video.videoHeight);
    this.state[side].photoUrl = canvas.toDataURL('image/jpeg');
    this.state[side].showPhoto = true;
    this.state[side].showScanPreview = false;

    // this.createLinkAndDownload(canvas.toDataURL('image/jpeg'), `${ side }.jpg`);
  }

  private showPreview(side: 'front' | 'back'): void {
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

  private createLinkAndDownload(side: 'front' | 'back'): void {
    const objectURL = this.state[side].photoUrl as string;
    const fileName = `${ side }_${(new Date()).toISOString()}.jpg`;
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
}
