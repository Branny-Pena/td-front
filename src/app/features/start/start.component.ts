import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [WizardLayoutComponent, ContentCardComponent],
  templateUrl: './start.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StartComponent {
  private readonly router = inject(Router);
  private readonly stateService = inject(TestDriveStateService);

  constructor() {
    this.stateService.setCurrentStep(1);
  }

  startNew(): void {
    this.stateService.reset();
    this.router.navigate(['/customer']);
  }

  goToDrafts(): void {
    this.router.navigate(['/borradores']);
  }

  goToSurveys(): void {
    this.router.navigate(['/encuestas']);
  }
}
