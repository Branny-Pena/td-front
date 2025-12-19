import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BottomNavComponent {
  readonly showBack = input<boolean>(true);
  readonly showNext = input<boolean>(true);
  readonly nextDisabled = input<boolean>(false);
  readonly nextLabel = input<string>('Siguiente');
  readonly backLabel = input<string>('Atrás');
  readonly isLoading = input<boolean>(false);

  readonly backClick = output<void>();
  readonly nextClick = output<void>();

  onBack(): void {
    this.backClick.emit();
  }

  onNext(): void {
    this.nextClick.emit();
  }
}

