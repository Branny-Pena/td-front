import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { DraftFormContextService } from './draft-form-context.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { MessageToastService } from '../../shared/services/message-toast.service';

@Component({
  selector: 'app-draft-customer-view',
  standalone: true,
  imports: [WizardLayoutComponent, ContentCardComponent],
  templateUrl: './draft-customer-view.component.html',
  styleUrl: './draft-customer-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraftCustomerViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ctx = inject(DraftFormContextService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly toastService = inject(MessageToastService);

  readonly isLoading = signal(false);
  readonly draftId = signal<string>('');

  readonly customer = this.stateService.customer;

  constructor() {
    this.stateService.setCurrentStep(1);
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/borradores']);
      return;
    }
    this.draftId.set(id);
    this.load(id);
  }

  private load(id: string): void {
    this.isLoading.set(true);
    this.ctx.ensureLoaded(id).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('No se pudo cargar el borrador.', { title: 'Borradores' });
        this.router.navigate(['/borradores']);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/borradores']);
  }

  onNext(): void {
    this.router.navigate(['/borradores', this.draftId(), 'vehiculo']);
  }
}

