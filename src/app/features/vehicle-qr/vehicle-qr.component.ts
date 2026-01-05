import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { VehicleService } from '../../core/services/vehicle.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { VehicleQrResponseDto } from '../../core/models';

@Component({
  selector: 'app-vehicle-qr',
  standalone: true,
  imports: [ReactiveFormsModule, WizardLayoutComponent, ContentCardComponent, ModalDialogComponent],
  templateUrl: './vehicle-qr.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleQrComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly vehicleService = inject(VehicleService);
  private readonly toastService = inject(MessageToastService);

  readonly isGenerating = signal(false);
  readonly isDialogOpen = signal(false);
  readonly qrData = signal<VehicleQrResponseDto | null>(null);

  readonly form = this.fb.nonNullable.group({
    make: ['', Validators.required],
    model: ['', Validators.required],
    color: ['', Validators.required],
    licensePlate: ['', Validators.required],
    vinNumber: [''],
    location: ['', Validators.required]
  });

  onBack(): void {
    this.router.navigate(['/test-drive-forms']);
  }

  generateQr(): void {
    if (this.form.invalid || this.isGenerating()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.isGenerating.set(true);

    this.vehicleService.generateQrCode({
      brand: raw.make.trim(),
      model: raw.model.trim(),
      color: raw.color.trim(),
      licensePlate: raw.licensePlate.trim(),
      vin: raw.vinNumber?.trim() || undefined,
      location: raw.location.trim()
    }).subscribe({
      next: (res) => {
        this.isGenerating.set(false);
        this.qrData.set(res);
        this.isDialogOpen.set(true);
      },
      error: () => {
        this.isGenerating.set(false);
        this.toastService.show('No se pudo generar el QR.', { title: 'QR' });
      }
    });
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
  }

  downloadQr(): void {
    const dataUrl = this.qrData()?.qrCodeDataUrl;
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'vehiculo-qr.png';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  onDownload(): void {
    this.downloadQr();
    this.closeDialog();
  }
}
