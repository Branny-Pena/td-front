import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';
import { CreateTestDriveFormDto, UpdateTestDriveFormDto } from '../../core/models';
import { MessageToastService } from '../../shared/services/message-toast.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [
    WizardLayoutComponent,
    ContentCardComponent
  ],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationComponent {
  private readonly router = inject(Router);
  private readonly stateService = inject(TestDriveStateService);
  private readonly testDriveFormService = inject(TestDriveFormService);
  private readonly toastService = inject(MessageToastService);

  readonly isLoading = signal(false);
  readonly isEmailLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private readonly didSubmit = signal(false);

  readonly customer = this.stateService.customer;
  readonly vehicle = this.stateService.vehicle;
  readonly location = this.stateService.location;
  readonly signatureData = this.stateService.signatureData;
  readonly evaluation = this.stateService.evaluation;
  readonly returnState = this.stateService.returnState;
  readonly testDriveForm = this.stateService.testDriveForm;

  readonly isSubmitted = computed(() => {
    return this.didSubmit() || this.testDriveForm()?.status === 'submitted';
  });

  readonly canSubmit = computed(() => {
    const returnState = this.returnState();
    return this.customer() !== null &&
      this.vehicle() !== null &&
      this.location() !== null &&
      this.signatureData() !== null &&
      this.evaluation() !== null &&
      returnState !== null &&
      !!returnState.mileageImageUrl &&
      !!returnState.fuelLevelImageUrl &&
      (returnState.imageUrls?.length ?? 0) >= 1 &&
      !this.isSubmitted();
  });

  constructor() {
    this.stateService.setCurrentStep(6);
  }

  private toReturnStatePlaceholders(): { mileageImageUrl: string; fuelLevelImageUrl: string; images: string[] } {
    const rs = this.returnState();
    const vehicleCount = rs?.imageUrls?.length ?? 0;
    return {
      mileageImageUrl: 'image 1',
      fuelLevelImageUrl: 'image 2',
      images: Array.from({ length: vehicleCount }, (_, i) => `image ${i + 3}`)
    };
  }

  onBack(): void {
    this.router.navigate(['/return']);
  }

  onSubmit(): void {
    if (!this.canSubmit()) return;
    if (this.isSubmitted()) return;

    const customer = this.customer();
    const vehicle = this.vehicle();
    const location = this.location();
    const signatureData = this.signatureData();
    const evaluation = this.evaluation();
    const returnState = this.returnState();
    const draftId = this.stateService.draftFormId();

    if (!customer || !vehicle || !location || !signatureData || !evaluation || !returnState) {
      this.errorMessage.set('Faltan datos por completar. Verifica todos los pasos.');
      return;
    }
    if (!returnState.mileageImageUrl || !returnState.fuelLevelImageUrl || (returnState.imageUrls?.length ?? 0) < 1) {
      this.errorMessage.set('Faltan fotos de devolución. Vuelve al paso de devolución.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const obs = evaluation.observations?.trim();

    const nextStatus = this.stateService.vehicleAutofilled() ? 'submitted' : 'draft';
    const returnStatePlaceholders = this.toReturnStatePlaceholders();
    const currentStep = nextStatus === 'submitted' ? 'FINAL_CONFIRMATION' : 'VEHICLE_RETURN_DATA';

    if (draftId) {
      const dto: UpdateTestDriveFormDto = {
        customerId: customer.id,
        vehicleId: vehicle.id,
        locationId: location.id,
        signatureData: signatureData,
        purchaseProbability: evaluation.purchaseProbability,
        estimatedPurchaseDate: evaluation.estimatedPurchaseDate,
        status: nextStatus,
        currentStep,
        returnState: returnStatePlaceholders
      };
      if (obs) dto.observations = obs;

      this.testDriveFormService.update(draftId, dto).subscribe({
        next: (form) => {
          this.stateService.setTestDriveForm(form);
          this.didSubmit.set(true);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Failed to submit test drive form');
        }
      });
      return;
    }

    const dto: CreateTestDriveFormDto = {
      customerId: customer.id,
      vehicleId: vehicle.id,
      locationId: location.id,
      signatureData: signatureData,
      purchaseProbability: evaluation.purchaseProbability,
      estimatedPurchaseDate: evaluation.estimatedPurchaseDate,
      status: nextStatus,
      currentStep,
      returnState: returnStatePlaceholders
    };
    if (obs) dto.observations = obs;

    this.testDriveFormService.create(dto).subscribe({
      next: (form) => {
        this.stateService.setTestDriveForm(form);
        this.didSubmit.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Failed to submit test drive form');
      }
    });
  }

  generatePdf(): void {
    const id = this.testDriveForm()?.id ?? this.stateService.draftFormId();
    if (!id) {
      this.toastService.show('No se encontró el ID del formulario.', { title: 'PDF' });
      return;
    }

    this.testDriveFormService.getPdf(id).subscribe({
      next: (blob) => {
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prueba-de-manejo-${id}.pdf`;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        globalThis.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toastService.show('No se pudo generar el PDF.', { title: 'PDF' });
      }
    });
  }

  sendEmail(): void {
    const id = this.testDriveForm()?.id ?? this.stateService.draftFormId();
    const customerEmail = this.testDriveForm()?.customer?.email ?? this.customer()?.email ?? undefined;

    if (!id) {
      this.toastService.show('No se pudo enviar el correo porque falta el ID del formulario.', { title: 'Correo' });
      return;
    }

    if (!customerEmail) {
      this.toastService.show('El cliente no tiene correo registrado.', { title: 'Correo' });
      return;
    }

    this.isEmailLoading.set(true);
    this.testDriveFormService.sendEmail(id).subscribe({
      next: () => {
        this.isEmailLoading.set(false);
        this.toastService.show(`Correo enviado a ${customerEmail}.`, { title: 'Correo' });
      },
      error: () => {
        this.isEmailLoading.set(false);
        this.toastService.show('No se pudo enviar el correo.', { title: 'Correo' });
      }
    });
  }

  startNew(): void {
    this.stateService.reset();
    this.router.navigate(['/test-drive-forms']);
  }
}
