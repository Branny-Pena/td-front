import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { DraftFormContextService } from './draft-form-context.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { UpdateTestDriveFormDto } from '../../core/models';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-draft-confirmation',
  standalone: true,
  imports: [WizardLayoutComponent, ContentCardComponent],
  templateUrl: './draft-confirmation.component.html',
  styleUrl: './draft-confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraftConfirmationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ctx = inject(DraftFormContextService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly testDriveFormService = inject(TestDriveFormService);
  private readonly toastService = inject(MessageToastService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly attemptedSubmit = signal(false);
  readonly draftId = signal<string>('');

  readonly customer = this.stateService.customer;
  readonly vehicle = this.stateService.vehicle;
  readonly signatureData = this.stateService.signatureData;
  readonly evaluation = this.stateService.evaluation;
  readonly returnState = this.stateService.returnState;
  private readonly signatureRaw = computed<string | null>(() => {
    return this.signatureData() ?? this.stateService.testDriveForm()?.signature?.signatureData ?? null;
  });

  readonly vehicleConfirmed = computed(() => this.vehicle()?.registerStatus === 'confirmed');
  readonly trustedSignature = computed<SafeUrl | null>(() => {
    const raw = this.signatureRaw();
    if (!raw) return null;
    const trimmed = raw.trim();
    const normalized = trimmed.startsWith('data:image/') ? trimmed : trimmed.startsWith('iVBOR') ? `data:image/png;base64,${trimmed}` : trimmed;
    return this.sanitizer.bypassSecurityTrustUrl(normalized);
  });

  readonly missingItems = computed(() => {
    const missing: string[] = [];

    if (!this.customer()) missing.push('Cliente');
    if (!this.vehicle()) missing.push('Vehículo');
    if (!this.vehicle()?.location) missing.push('Ubicación');
    if ((this.signatureRaw()?.trim().length ?? 0) === 0) missing.push('Firma');

    const evaluation = this.evaluation();
    if (!evaluation) {
      missing.push('Evaluación');
    } else {
      if (evaluation.estimatedPurchaseDate?.trim().length === 0) missing.push('Tiempo estimado de compra');
      if (Number.isFinite(evaluation.purchaseProbability) === false) missing.push('Probabilidad de compra');
    }

    const returnState = this.returnState();
    if (!returnState) {
      missing.push('Devolución');
    } else {
      if (!returnState.mileageImageUrl) missing.push('Foto del kilometraje');
      if (!returnState.fuelLevelImageUrl) missing.push('Foto del nivel de combustible');
      if (!returnState.imageUrls || returnState.imageUrls.length < 1) missing.push('Fotos del vehículo (mín. 1)');
    }

    return missing;
  });

  readonly canSubmit = computed(() => {
    return this.customer() !== null &&
      this.vehicle() !== null &&
      !!this.vehicle()?.location &&
      (this.signatureRaw()?.trim().length ?? 0) > 0 &&
      this.evaluation() !== null &&
      this.returnState() !== null;
  });

  constructor() {
    this.stateService.setCurrentStep(6);
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/test-drive-forms']);
      return;
    }
    this.draftId.set(id);
    this.load(id);
  }

  private load(id: string): void {
    this.isPageLoading.set(true);
    this.ctx.ensureLoaded(id).subscribe({
      next: (form) => {
        if (form.status !== 'draft') {
          this.router.navigate(['/test-drive-forms', id, 'ver']);
          return;
        }
        this.isPageLoading.set(false);
      },
      error: () => {
        this.isPageLoading.set(false);
        this.toastService.show('No se pudo cargar el borrador.', { title: 'Borradores' });
        this.router.navigate(['/test-drive-forms']);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/test-drive-forms', this.draftId(), 'devolucion']);
  }

  onSubmit(): void {
    this.attemptedSubmit.set(true);

    const customer = this.customer();
    const vehicle = this.vehicle();
    const signatureData = this.signatureRaw()?.trim() ?? '';
    const evaluation = this.evaluation();
    const returnState = this.returnState();
    const draftId = this.draftId();

    if (!draftId) return;
    if (this.missingItems().length > 0 || !customer || !vehicle || !vehicle.location || signatureData.length === 0 || !evaluation || !returnState) {
      this.errorMessage.set(`Faltan datos por completar: ${this.missingItems().join(', ')}.`);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const obs = evaluation.observations?.trim();
    const nextStatus = this.vehicleConfirmed() ? 'submitted' : 'draft';
    const vehicleCount = returnState.imageUrls?.length ?? 0;
    const returnStatePlaceholders = {
      mileageImageUrl: 'image 1',
      fuelLevelImageUrl: 'image 2',
      images: Array.from({ length: vehicleCount }, (_, i) => `image ${i + 3}`)
    };

    const dto: UpdateTestDriveFormDto = {
      customerId: customer.id,
      vehicleId: vehicle.id,
      signatureData: signatureData,
      purchaseProbability: evaluation.purchaseProbability,
      estimatedPurchaseDate: evaluation.estimatedPurchaseDate,
      status: nextStatus,
      returnState: returnStatePlaceholders
    };
    if (obs) dto.observations = obs;

    this.testDriveFormService.update(draftId, dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.show(
          nextStatus === 'submitted' ? 'Formulario finalizado.' : 'Formulario guardado en progreso.',
          { title: 'Formulario' }
        );
        this.router.navigate(['/test-drive-forms']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.message || 'No se pudo enviar el formulario.');
      }
    });
  }
}



