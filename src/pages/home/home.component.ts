import { NgIf } from '@angular/common';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'vki-home',
  standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        NgIf,
        FormsModule
    ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export default class HomeComponent implements AfterViewChecked {
    @ViewChild('reasonForm')
    private readonly reasonForm!: ElementRef<HTMLFormElement>;

    reason = '';
    paddingBottom = 0;
    readonly #router = inject(Router);

    ngAfterViewChecked() {
        this.paddingBottom = this.reasonForm.nativeElement.offsetHeight;
    }

    handleSubmit(event: Event) {
        event.preventDefault();
        this.#router.navigate(['/kopie-maken'], {
            queryParams: {
                reden: this.reason,
                stap: 2
            }
        })
    }
}
