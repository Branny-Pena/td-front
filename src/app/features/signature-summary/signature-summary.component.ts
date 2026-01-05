import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { SignaturePadComponent } from '../../shared/components/signature-pad/signature-pad.component';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-signature-summary',
  standalone: true,
  imports: [
    WizardLayoutComponent,
    ContentCardComponent,
    SignaturePadComponent
  ],
  templateUrl: './signature-summary.component.html',
  styleUrl: './signature-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignatureSummaryComponent {
  private readonly router = inject(Router);
  private readonly stateService = inject(TestDriveStateService);
  private readonly toastService = inject(MessageToastService);
  private readonly testDriveFormService = inject(TestDriveFormService);
  private readonly themeService = inject(ThemeService);

  readonly customer = this.stateService.customer;
  readonly vehicle = this.stateService.vehicle;
  readonly location = this.stateService.location;
  readonly signatureData = this.stateService.signatureData;
  readonly draftFormId = this.stateService.draftFormId;
  readonly testDriveForm = this.stateService.testDriveForm;

  readonly isValid = computed(() => this.signatureData() !== null);
  readonly isSaving = signal(false);

  constructor() {
    this.stateService.setCurrentStep(3);

    if (!this.stateService.customer()) {
      this.toastService.show('Faltan datos del cliente. Completa el paso 1.', { title: 'Cliente' });
      this.router.navigate(['/customer']);
      return;
    }

    if (!this.stateService.vehicle() || !this.stateService.location()) {
      this.toastService.show('Faltan datos del vehículo. Completa el paso 2.', { title: 'Vehículo' });
      this.router.navigate(['/vehicle']);
    }
  }

  onSignatureAccepted(signatureData: string): void {
    this.stateService.setSignatureData(signatureData);
  }

  onBack(): void {
    this.router.navigate(['/vehicle']);
  }

  onNext(): void {
    if (!this.isValid()) return;

    const customer = this.customer();
    const vehicle = this.vehicle();
    const location = this.location();
    const signatureData = this.signatureData();
    const draftId = this.draftFormId();

    if (!customer || !vehicle || !location || !signatureData) {
      this.toastService.show('Faltan datos. Completa los pasos anteriores.', { title: 'Test Drive' });
      return;
    }

    if (this.isSaving()) return;
    this.isSaving.set(true);

    const brand = this.themeService.getSurveyBrand() ?? undefined;

    if (draftId) {
      this.testDriveFormService.update(draftId, {
        brand,
        signatureData,
        currentStep: 'VALUATION_DATA'
      }).subscribe({
        next: (form) => {
          this.stateService.setTestDriveForm(form);
          this.isSaving.set(false);
          this.router.navigate(['/evaluation']);
        },
        error: () => {
          this.isSaving.set(false);
          this.toastService.show('No se pudo guardar la firma.', { title: 'Firma' });
        }
      });
      return;
    }

    this.testDriveFormService.createDraft({
      brand,
      customerId: customer.id,
      vehicleId: vehicle.id,
      locationId: location.id,
      currentStep: 'VALUATION_DATA',
      status: 'draft'
    }).subscribe({
      next: (form) => {
        this.stateService.setDraftFormId(form.id);
        this.stateService.setTestDriveForm(form);
        this.isSaving.set(false);
        this.router.navigate(['/evaluation']);
      },
      error: () => {
        this.isSaving.set(false);
        this.toastService.show('No se pudo guardar el progreso.', { title: 'Firma' });
      }
    });
  }
}
