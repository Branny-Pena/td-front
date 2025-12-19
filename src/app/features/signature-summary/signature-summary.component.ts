import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { SignaturePadComponent } from '../../shared/components/signature-pad/signature-pad.component';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';

@Component({
  selector: 'app-signature-summary',
  standalone: true,
  imports: [
    WizardLayoutComponent,
    ContentCardComponent,
    SignaturePadComponent,
    ModalDialogComponent
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

  readonly customer = this.stateService.customer;
  readonly vehicle = this.stateService.vehicle;
  readonly location = this.stateService.location;
  readonly signatureData = this.stateService.signatureData;
  readonly draftFormId = this.stateService.draftFormId;
  readonly testDriveForm = this.stateService.testDriveForm;

  readonly isValid = computed(() => this.signatureData() !== null);
  readonly showSaveDialog = signal(false);
  readonly isSavingDraft = signal(false);

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

    const hasDraft = !!this.draftFormId() || this.testDriveForm()?.status === 'draft';
    if (hasDraft) {
      this.router.navigate(['/evaluation']);
      return;
    }

    this.showSaveDialog.set(true);
  }

  onSaveDialogClosed(): void {
    this.showSaveDialog.set(false);
    this.isSavingDraft.set(false);
  }

  continueWithoutSaving(): void {
    this.onSaveDialogClosed();
    this.router.navigate(['/evaluation']);
  }

  saveAndContinue(): void {
    if (this.isSavingDraft()) return;

    const customer = this.customer();
    const vehicle = this.vehicle();
    const location = this.location();
    const signatureData = this.signatureData();

    if (!customer || !vehicle || !location || !signatureData) {
      this.toastService.show('Faltan datos. Completa los pasos anteriores.', { title: 'Test Drive' });
      this.onSaveDialogClosed();
      return;
    }

    this.isSavingDraft.set(true);

    this.testDriveFormService
      .createDraft({
        customerId: customer.id,
        vehicleId: vehicle.id,
        locationId: location.id,
        signatureData,
        status: 'draft'
      })
      .subscribe({
        next: (form) => {
          this.stateService.setDraftFormId(form.id);
          this.stateService.setTestDriveForm(form);
          this.toastService.show('Progreso guardado.', { title: 'Test Drive' });
          this.onSaveDialogClosed();
          this.router.navigate(['/evaluation']);
        },
        error: () => {
          this.isSavingDraft.set(false);
          this.toastService.show('No se pudo guardar el progreso. Puedes continuar sin guardar.', {
            title: 'Test Drive'
          });
        }
      });
  }
}
