import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { VehicleService } from '../../core/services/vehicle.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { UpdateVehicleDto } from '../../core/models';
import { DraftFormContextService } from './draft-form-context.service';

@Component({
  selector: 'app-draft-vehicle-edit',
  standalone: true,
  imports: [ReactiveFormsModule, WizardLayoutComponent, ContentCardComponent, ModalDialogComponent],
  templateUrl: './draft-vehicle-edit.component.html',
  styleUrl: './draft-vehicle-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraftVehicleEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly vehicleService = inject(VehicleService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly toastService = inject(MessageToastService);
  private readonly ctx = inject(DraftFormContextService);

  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly draftId = signal<string>('');
  readonly errorMessage = signal<string | null>(null);
  readonly showConfirmDialog = signal(false);
  private pendingConfirm = false;

  readonly form = this.fb.nonNullable.group({
    make: ['', Validators.required],
    model: ['', Validators.required],
    licensePlate: ['', Validators.required],
    vinNumber: [''],
    locationName: [{ value: '', disabled: true }]
  });

  constructor() {
    this.stateService.setCurrentStep(2);
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/borradores']);
      return;
    }
    this.draftId.set(id);
    this.loadDraft(id);
  }

  private loadDraft(id: string): void {
    this.isPageLoading.set(true);
    this.ctx.ensureLoaded(id).subscribe({
      next: () => {
        const form = this.stateService.testDriveForm();
        const vehicle = this.stateService.vehicle();
        const location = this.stateService.location();
        if (vehicle) {
          this.form.patchValue({
            make: vehicle.make,
            model: vehicle.model,
            licensePlate: vehicle.licensePlate,
            vinNumber: vehicle.vinNumber ?? ''
          });
        }
        if (location) {
          this.form.patchValue({ locationName: location.locationName });
        }
        if (!form || (form.status !== 'draft' && form.status !== 'pending')) {
          this.toastService.show('Este formulario ya fue enviado y no se puede editar.', { title: 'Formulario' });
          this.router.navigate(['/borradores', id, 'ver']);
          return;
        }
        this.isPageLoading.set(false);
      },
      error: () => {
        this.isPageLoading.set(false);
        this.toastService.show('No se pudo cargar el borrador.', { title: 'Borradores' });
        this.router.navigate(['/borradores']);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/borradores', this.draftId(), 'cliente']);
  }

  onNext(): void {
    if (this.form.invalid) return;

    this.showConfirmDialog.set(true);
  }

  onConfirmDialogClosed(): void {
    this.showConfirmDialog.set(false);
  }

  continueWithoutConfirm(): void {
    this.pendingConfirm = false;
    this.showConfirmDialog.set(false);
    this.saveVehicle(false);
  }

  confirmAndContinue(): void {
    this.pendingConfirm = true;
    this.showConfirmDialog.set(false);
    this.saveVehicle(true);
  }

  private saveVehicle(confirm: boolean): void {
    const draftId = this.draftId();
    const currentVehicle = this.stateService.vehicle();
    if (!draftId || !currentVehicle) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.getRawValue();
    const dto: UpdateVehicleDto = {
      make: formValue.make,
      model: formValue.model,
      licensePlate: formValue.licensePlate,
      vinNumber: formValue.vinNumber?.trim() ? formValue.vinNumber.trim() : undefined
    };
    if (confirm) dto.registerStatus = 'confirmed';

    this.vehicleService.update(currentVehicle.id, dto).subscribe({
      next: (vehicle) => {
        this.stateService.setVehicle(vehicle);
        this.isLoading.set(false);
        if (confirm) {
          this.toastService.show('Vehículo confirmado.', { title: 'Vehículo' });
        } else {
          this.toastService.show('Vehículo actualizado (sin confirmar).', { title: 'Vehículo' });
        }
        this.router.navigate(['/borradores', draftId, 'firma']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.message || 'No se pudo actualizar el vehículo.');
      }
    });
  }
}
