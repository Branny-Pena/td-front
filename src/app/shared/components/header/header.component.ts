import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly themeService = inject(ThemeService);

  readonly currentStep = input.required<number>();
  readonly totalSteps = input<number>(6);
  readonly showLogo = input<boolean>(true);
  readonly showHomeLink = input<boolean>(true);

  readonly brandName = computed(() => this.themeService.getBrandName());
  readonly themeId = computed(() => this.themeService.themeId());
  readonly logoSrc = computed(() => {
    switch (this.themeId()) {
      case 'andes':
        return '/logos/andes-motor-logo.svg';
      case 'stellantis':
        return '/logos/stellantis-logo.svg';
      case 'sap':
        return '/logos/divemotor-logo.png';
      default:
        return null;
    }
  });
}
