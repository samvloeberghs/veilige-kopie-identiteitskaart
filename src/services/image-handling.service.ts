import { inject, Injectable } from '@angular/core';
import { wrapText } from 'wraptext.js';

const piexifjs = require('./piexif.js');

// Inspiration: https://www.cssscript.com/demo/fill-image-diagonal-watermark/

@Injectable({ providedIn: 'root' })
export class ImageHandlingService {

    #extraHeightForReasonFooter = 48;
    #canvas!: HTMLCanvasElement;
    #context!: CanvasRenderingContext2D;
    #textContext: CanvasRenderingContext2D | null = null;
    #options!: {
        hexColor: string;
        alpha: number;
        fontSize: number;
        text: string;
        descriptiveText: string;
        image: CanvasImageSource,
        imageWidth: number,
        imageHeight: number,
        gap: number;
        xOffset: number;
        yOffset: number;
        videoWidth: number;
        videoHeight: number;
    }

    start(hexColor: string, alpha: number, fontSize: number, gap: number, text: string, descriptiveText: string,image: CanvasImageSource, imageWidth: number, imageHeight: number, xOffset: number, yOffset: number, videoWidth: number, videoHeight: number): void {
        this.#options = {
            hexColor,
            alpha,
            fontSize,
            gap,
            text,
            descriptiveText,
            image,
            imageWidth,
            imageHeight,
            xOffset,
            yOffset,
            videoWidth,
            videoHeight
        };
        this.#canvas = document.createElement('canvas');
        this.#canvas.width = imageWidth;
        this.#canvas.height = imageHeight + this.#extraHeightForReasonFooter;
        this.#textContext = null;
        this.#context = this.#canvas.getContext('2d') as CanvasRenderingContext2D;
        this.#context.fillRect(xOffset, yOffset, imageWidth, imageHeight);
        this.#context.drawImage(image, xOffset, yOffset, videoWidth, videoHeight);
        this.#drawBanner();
        this.#drawText();
    }

    getDataURL(): string {
        return this.#insertExifData(this.#canvas.toDataURL('image/jpeg'), this.#options.descriptiveText);
    }

    #drawBanner() {
        this.#context.fillStyle = '#ffffff';
        this.#context.fillRect(0, this.#options.imageHeight, this.#options.imageWidth, 48);
        this.#context.fillStyle = '#000000';
        this.#context.font = '400 15px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
        this.#context.fillText(this.#options.descriptiveText.slice(0, 57), 16, this.#options.imageHeight + 20, this.#options.imageWidth - 32);
        this.#context.fillText(this.#options.descriptiveText.slice(57, 114), 16, this.#options.imageHeight + 40, this.#options.imageWidth - 32);
    }

    #drawText() {
        const redraw = () => {
            (this.#context as CanvasRenderingContext2D).rotate(315 * Math.PI / 180);
            (this.#context as CanvasRenderingContext2D).clearRect(0, 0, this.#canvas.width, this.#canvas.height);
            (this.#context as CanvasRenderingContext2D).drawImage(this.#options.image, this.#options.xOffset, this.#options.yOffset);
            return (this.#context as CanvasRenderingContext2D).rotate(45 * Math.PI / 180);
        };

        const makeStyle = () => {
            const match = this.#options.hexColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i) ?? ['ff', 'ff', 'ff', 'ff']
            return 'rgba(' + (parseInt(match[1], 16)) + ',' + (parseInt(match[2], 16)) + ',' + (parseInt(match[3], 16)) + ',' + this.#options.alpha + ')';
        }

        let i, j, k, l, margin, ref, ref1, ref2, step, textSize, width, x, y;

        if (this.#canvas == null) {
            return;
        }
        textSize = this.#options.fontSize * Math.max(15, (Math.min(this.#canvas.width, this.#canvas.height)) / 25);

        if (this.#textContext != null) {
            redraw();
        } else {
            this.#textContext = this.#canvas.getContext('2d') as CanvasRenderingContext2D;
            this.#textContext.rotate(45 * Math.PI / 180);
        }

        /*
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
         */

        this.#textContext.fillStyle = makeStyle();
        this.#textContext.font = '400 ' + textSize + 'px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
        this.#textContext.shadowOffsetX = 1;
        this.#textContext.shadowOffsetY = 1;
        this.#textContext.shadowBlur = 1;
        this.#textContext.shadowColor = 'rgba(0, 0, 0, 0.6)';
        width = (this.#textContext.measureText(this.#options.text)).width;
        step = Math.sqrt((Math.pow(this.#canvas.width, 2)) + (Math.pow(this.#canvas.height, 2)));
        margin = (this.#textContext.measureText('px')).width;
        x = Math.ceil(step / (width + margin));
        y = Math.ceil((step / (this.#options.gap * textSize)) / 2);
        for (i = k = 0, ref = x; (0 <= ref ? k <= ref : k >= ref); i = 0 <= ref ? ++k : --k) {
            for (j = l = ref1 = -y, ref2 = y; (ref1 <= ref2 ? l <= ref2 : l >= ref2); j = ref1 <= ref2 ? ++l : --l) {
                this.#textContext.fillText(this.#options.text, (width + margin) * i, this.#options.gap * textSize * j);
            }
        }
    };

    #insertExifData(jpegData: string, reason: string): string {
        const zeroth: any = {};
        const exif:any = {};
        const gps:any = {};

        zeroth[piexifjs.ImageIFD.ImageDescription] = reason;
        zeroth[piexifjs.ImageIFD.ProcessingSoftware] = "https://veilige-kopie-identiteitskaart.be";
        zeroth[piexifjs.ImageIFD.Software] = "Veilige Kopie Identiteitskaart";

        const exifObj = {"0th":zeroth, "Exif":exif, "GPS":gps};
        const exifStr = piexifjs.dump(exifObj);

        return piexifjs.insert(exifStr, jpegData);
    }
}
