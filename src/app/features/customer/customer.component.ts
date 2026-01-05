import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { UserService } from '../../core/services/customer.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { CreateUserDto } from '../../core/models';
import { debounceTime, distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { BarcodeFormat } from '@zxing/library';
import { BarcodeScannerDialogComponent } from '../../shared/components/barcode-scanner-dialog/barcode-scanner-dialog.component';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    WizardLayoutComponent,
    ContentCardComponent,
    BarcodeScannerDialogComponent
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly stateService = inject(TestDriveStateService);
  private readonly userService = inject(UserService);
  private readonly testDriveFormService = inject(TestDriveFormService);
  private readonly toastService = inject(MessageToastService);
  private readonly themeService = inject(ThemeService);
  private readonly destroy$ = new Subject<void>();

  readonly isLoading = signal(false);
  readonly isDniLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isScannerOpen = signal(false);

  readonly dniScannerFormats: BarcodeFormat[] = [
    BarcodeFormat.PDF_417,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.CODE_128
  ];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dni: ['', Validators.required],
    phoneNumber: [''],
    email: ['', Validators.email]
  });

  constructor() {
    this.stateService.setCurrentStep(1);
    const existingUser = this.stateService.customer();
    if (existingUser) {
      this.form.patchValue({
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        dni: existingUser.dni,
        phoneNumber: existingUser.phoneNumber || '',
        email: existingUser.email || ''
      });
    }
  }

  ngOnInit(): void {
    this.form.controls.dni.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter((dni) => dni.trim().length >= 8),
      takeUntil(this.destroy$)
    ).subscribe(dni => {
      this.lookupUserByDni(dni.trim());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private lookupUserByDni(dni: string): void {
    this.isDniLoading.set(true);

    this.userService.getByDni(dni).subscribe({
      next: (customer) => {
        this.isDniLoading.set(false);
        if (customer) {
          this.stateService.setUser(customer);
          this.form.patchValue({
            firstName: customer.firstName,
            lastName: customer.lastName,
            phoneNumber: customer.phoneNumber || '',
            email: customer.email || ''
          }, { emitEvent: false });

          this.toastService.show('Cliente encontrado. Datos autocompletados.', { title: 'Cliente' });
          return;
        }

        this.toastService.show('Cliente no encontrado. Completa los datos manualmente.', {
          title: 'Cliente'
        });
      },
      error: () => {
        this.isDniLoading.set(false);
        this.toastService.show('Cliente no encontrado. Completa los datos manualmente.', {
          title: 'Cliente'
        });
      }
    });
  }

  scanId(): void {
    this.isScannerOpen.set(true);
    return;
    this.form.patchValue({
      firstName: 'Juan',
      lastName: 'Pérez',
      dni: '12345678',
      phoneNumber: '+51 999 888 777',
      email: 'juan.perez@example.com'
    });
  }

  onDniScanned(value: string): void {
    const digits = value.replace(/\D/g, '');
    const dni = digits.length >= 8 ? digits.slice(0, 8) : value.trim();
    this.form.controls.dni.setValue(dni);
    this.isScannerOpen.set(false);
  }

  closeScanner(): void {
    this.isScannerOpen.set(false);
  }

  onNext(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.getRawValue();
    const dto: CreateUserDto = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      dni: formValue.dni,
      phoneNumber: formValue.phoneNumber || undefined,
      email: formValue.email || undefined
    };

    this.userService.create(dto).subscribe({
      next: (customer) => {
        this.stateService.setUser(customer);
        const draftId = this.stateService.draftFormId();
        const brand = this.themeService.getSurveyBrand() ?? undefined;

        const proceed = () => {
          this.isLoading.set(false);
          this.router.navigate(['/vehicle']);
        };

        if (draftId) {
          this.testDriveFormService.update(draftId, {
            brand,
            customerId: customer.id,
            currentStep: 'VEHICLE_DATA'
          }).subscribe({
            next: (form) => {
              this.stateService.setTestDriveForm(form);
              proceed();
            },
            error: () => {
              this.isLoading.set(false);
              this.errorMessage.set('No se pudo guardar el progreso del formulario.');
            }
          });
          return;
        }

        this.testDriveFormService.createDraft({
          brand,
          customerId: customer.id,
          currentStep: 'VEHICLE_DATA',
          status: 'draft'
        }).subscribe({
          next: (form) => {
            this.stateService.setDraftFormId(form.id);
            this.stateService.setTestDriveForm(form);
            proceed();
          },
          error: () => {
            this.isLoading.set(false);
            this.errorMessage.set('No se pudo crear el formulario de prueba de manejo.');
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Failed to save customer data');
      }
    });
  }
}
