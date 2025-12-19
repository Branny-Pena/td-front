import { Component, ChangeDetectionStrategy, computed, inject, input, output } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { StepIndicatorComponent } from '../../components/step-indicator/step-indicator.component';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { MessageToastContainerComponent } from '../../components/message-toast-container/message-toast-container.component';
import { TestDriveStateService } from '../../../core/services/test-drive-state.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-wizard-layout',
  standalone: true,
  imports: [RouterLink, HeaderComponent, StepIndicatorComponent, BottomNavComponent, MessageToastContainerComponent],
  templateUrl: './wizard-layout.component.html',
  styleUrl: './wizard-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WizardLayoutComponent {
  private readonly stateService = inject(TestDriveStateService);
  protected readonly previousStep = computed(() => this.stateService.previousStep());

  readonly currentStep = input.required<number>();
  readonly totalSteps = input<number>(6);
  readonly showHeader = input<boolean>(true);
  readonly showHeaderLogo = input<boolean>(true);
  readonly showHeaderHomeLink = input<boolean>(true);
  readonly chromeVariant = input<'default' | 'plain'>('default');
  readonly showStepper = input<boolean>(true);
  readonly showBottomNav = input<boolean>(true);
  readonly showStartButton = input<boolean>(true);
  readonly startButtonLabel = input<string>('Volver al inicio');
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
