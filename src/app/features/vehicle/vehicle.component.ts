import { Component, ChangeDetectionStrategy, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { LocationService } from '../../core/services/location.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { CreateVehicleDto, CreateLocationDto } from '../../core/models';
import { BarcodeScannerDialogComponent } from '../../shared/components/barcode-scanner-dialog/barcode-scanner-dialog.component';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [ReactiveFormsModule, WizardLayoutComponent, ContentCardComponent, BarcodeScannerDialogComponent],
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly stateService = inject(TestDriveStateService);
  private readonly vehicleService = inject(VehicleService);
  private readonly locationService = inject(LocationService);
  private readonly toastService = inject(MessageToastService);
  private readonly destroy$ = new Subject<void>();

  readonly isLoading = signal(false);
  readonly isLookupLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private readonly lastLookupNotificationKey = signal<string | null>(null);
  readonly isVehicleAutofilled = signal(false);
  readonly isScannerOpen = signal(false);

  readonly vehicleScannerFormats: BarcodeFormat[] = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.PDF_417,
    BarcodeFormat.DATA_MATRIX
  ];

  readonly form = this.fb.nonNullable.group({
    make: ['', Validators.required],
    model: ['', Validators.required],
    licensePlate: ['', Validators.required],
    vinNumber: [''],
    locationName: ['', Validators.required]
  });

  constructor() {
    this.stateService.setCurrentStep(2);

    const existingVehicle = this.stateService.vehicle();
    const existingLocation = this.stateService.location();

    if (existingVehicle) {
      this.form.patchValue({
        make: existingVehicle.make,
        model: existingVehicle.model,
        licensePlate: existingVehicle.licensePlate,
        vinNumber: existingVehicle.vinNumber || ''
      });
    }

    if (existingLocation) {
      this.form.patchValue({
        locationName: existingLocation.locationName
      });
    }

    const wasAutofilled = this.stateService.vehicleAutofilled();
    this.isVehicleAutofilled.set(wasAutofilled);
    this.setVehicleDetailsEditable(!wasAutofilled);
  }

  ngOnInit(): void {
    const licenseControl = this.form.controls.licensePlate;
    const vinControl = this.form.controls.vinNumber;

    licenseControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((licensePlate) => {
        const next = licensePlate.trim();
        if (next.length === 0) {
          if (this.isVehicleAutofilled() && this.form.controls.vinNumber.value.trim().length === 0) {
            this.clearAutofilledVehicleDetails();
          }
          return;
        }
        this.lookupVehicle({ licensePlate: next });
      });

    vinControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((vinNumber) => {
        const next = vinNumber.trim();
        if (next.length === 0) {
          if (this.isVehicleAutofilled() && this.form.controls.licensePlate.value.trim().length === 0) {
            this.clearAutofilledVehicleDetails();
          }
          return;
        }
        this.lookupVehicle({ vinNumber: next });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private lookupVehicle(input: { licensePlate?: string; vinNumber?: string }): void {
    const licensePlate = input.licensePlate?.trim() || '';
    const vinNumber = input.vinNumber?.trim() || '';

    this.isLookupLoading.set(true);
    this.vehicleService.getByLicensePlateOrVin(licensePlate || undefined, vinNumber || undefined).subscribe({
      next: (vehicle) => {
        const wasAutofilled = this.isVehicleAutofilled();
        this.isLookupLoading.set(false);

        if (vehicle) {
          this.stateService.setVehicle(vehicle);
          this.stateService.setVehicleAutofilled(true);
          this.isVehicleAutofilled.set(true);
          this.setVehicleDetailsEditable(false);

          this.form.patchValue(
            {
              make: vehicle.make,
              model: vehicle.model,
              licensePlate: vehicle.licensePlate,
              vinNumber: vehicle.vinNumber || ''
            },
            { emitEvent: false }
          );

          this.notifyOnce('found', licensePlate, vinNumber, 'Vehículo encontrado. Datos autocompletados.');
          return;
        }

        this.stateService.setVehicleAutofilled(false);
        this.isVehicleAutofilled.set(false);
        this.setVehicleDetailsEditable(true);
        if (wasAutofilled) this.clearAutofilledVehicleDetails();
        this.notifyOnce('not_found', licensePlate, vinNumber, 'Vehículo no encontrado. Completa los datos manualmente.');
      },
      error: () => {
        const wasAutofilled = this.isVehicleAutofilled();
        this.isLookupLoading.set(false);
        this.stateService.setVehicleAutofilled(false);
        this.isVehicleAutofilled.set(false);
        this.setVehicleDetailsEditable(true);
        if (wasAutofilled) this.clearAutofilledVehicleDetails();
        this.notifyOnce('not_found', licensePlate, vinNumber, 'Vehículo no encontrado. Completa los datos manualmente.');
      }
    });
  }

  private clearAutofilledVehicleDetails(): void {
    this.stateService.clearVehicle();
    this.isVehicleAutofilled.set(false);
    this.form.patchValue({ make: '', model: '' }, { emitEvent: false });
    this.setVehicleDetailsEditable(true);
  }

  private setVehicleDetailsEditable(isEditable: boolean): void {
    const makeControl = this.form.controls.make;
    const modelControl = this.form.controls.model;

    if (isEditable) {
      makeControl.enable({ emitEvent: false });
      modelControl.enable({ emitEvent: false });
      return;
    }

    makeControl.disable({ emitEvent: false });
    modelControl.disable({ emitEvent: false });
  }

  private notifyOnce(
    status: 'found' | 'not_found',
    licensePlate: string,
    vinNumber: string,
    message: string
  ): void {
    const key = `${status}|${licensePlate}|${vinNumber}`;
    if (this.lastLookupNotificationKey() === key) return;
    this.lastLookupNotificationKey.set(key);
    this.toastService.show(message, { title: 'Vehículo' });
  }

  scanQr(): void {
    this.isScannerOpen.set(true);
    return;
    this.form.patchValue({
      make: 'Toyota',
      model: 'Corolla 2024',
      licensePlate: 'ABC-123',
      vinNumber: '1HGBH41JXMN109186',
      locationName: 'Lima Central'
    });
  }

  onVehicleCodeScanned(value: string): void {
    const raw = value.trim();
    const extractedVin = this.parseVehicleVin(raw);
    const vinNumber = extractedVin ?? this.normalizeVin(raw);
    if (!vinNumber) return;

    this.form.patchValue(
      {
        vinNumber
      },
      { emitEvent: false }
    );

    this.lookupVehicle({ vinNumber });

    this.isScannerOpen.set(false);
  }

  closeScanner(): void {
    this.isScannerOpen.set(false);
  }

  onBack(): void {
    this.router.navigate(['/customer']);
  }

  private parseVehicleVin(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    try {
      if (trimmed.startsWith('{')) {
        const obj = JSON.parse(trimmed) as Record<string, unknown>;
        const vin =
          typeof obj['vinNumber'] === 'string'
            ? obj['vinNumber']
            : typeof obj['vin'] === 'string'
              ? obj['vin']
              : undefined;
        const normalized = vin ? this.normalizeVin(vin) : null;
        return normalized && this.isLikelyVin(normalized) ? normalized : null;
      }
    } catch {
      // ignore
    }

    if (trimmed.includes('=')) {
      const qs = trimmed.includes('?') ? trimmed.split('?')[1] ?? '' : trimmed;
      const params = new URLSearchParams(qs);
      const vin = params.get('vinNumber') ?? params.get('vin') ?? undefined;
      const normalized = vin ? this.normalizeVin(vin) : null;
      return normalized && this.isLikelyVin(normalized) ? normalized : null;
    }

    const vinMatch = trimmed.match(/(?:vin|vinnumber)\s*[:= ]\s*([A-HJ-NPR-Z0-9]{17})/i);
    if (vinMatch?.[1]) return this.normalizeVin(vinMatch[1]);

    const compact = trimmed.toUpperCase();
    const inline = compact.match(/[A-HJ-NPR-Z0-9]{17}/);
    if (inline?.[0]) return inline[0];

    return null;
  }

  private normalizeVin(value: string): string {
    return value.trim().toUpperCase();
  }

  private isLikelyVin(value: string): boolean {
    const compact = value.replace(/\s/g, '');
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(compact);
  }

  onNext(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.getRawValue();

    const vehicleDto: CreateVehicleDto = {
      make: formValue.make,
      model: formValue.model,
      licensePlate: formValue.licensePlate,
      vinNumber: formValue.vinNumber || undefined
    };

    const locationDto: CreateLocationDto = {
      locationName: formValue.locationName
    };

    forkJoin({
      vehicle: this.vehicleService.create(vehicleDto),
      location: this.locationService.create(locationDto)
    }).subscribe({
      next: ({ vehicle, location }) => {
        this.stateService.setVehicle(vehicle);
        this.stateService.setLocation(location);
        this.isLoading.set(false);
        this.router.navigate(['/signature']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'No se pudo guardar la información del vehículo');
      }
    });
  }
}
