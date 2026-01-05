import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TestDriveStateService, ReturnStateDraft } from '../../core/services/test-drive-state.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-vehicle-return',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    WizardLayoutComponent,
    ContentCardComponent
  ],
  templateUrl: './vehicle-return.component.html',
  styleUrl: './vehicle-return.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleReturnComponent {
  private readonly router = inject(Router);
  private readonly stateService = inject(TestDriveStateService);
  private readonly toastService = inject(MessageToastService);
  private readonly testDriveFormService = inject(TestDriveFormService);
  private readonly themeService = inject(ThemeService);

  private readonly minVehiclePhotos = 1;
  private readonly maxVehiclePhotos = 3;
  private readonly maxTotalPhotoBytes = 2 * 1024 * 1024;

  readonly mileageImageUrl = signal<string | null>(null);
  readonly fuelLevelImageUrl = signal<string | null>(null);
  readonly vehicleImageUrls = signal<string[]>([]);

  readonly mileageSelectedFileText = signal<string>('Seleccionar archivo');
  readonly fuelSelectedFileText = signal<string>('Seleccionar archivo');
  readonly vehicleSelectedFilesText = signal<string>('Seleccionar archivo');

  readonly mileagePhotoError = signal<string | null>(null);
  readonly fuelPhotoError = signal<string | null>(null);
  readonly vehiclePhotoError = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isSaving = signal(false);

  constructor() {
    this.stateService.setCurrentStep(5);
    const existingReturnState = this.stateService.returnState();
    if (existingReturnState) {
      this.mileageImageUrl.set(existingReturnState.mileageImageUrl);
      this.fuelLevelImageUrl.set(existingReturnState.fuelLevelImageUrl);
      this.vehicleImageUrls.set(existingReturnState.imageUrls);
      if (existingReturnState.mileageImageUrl) this.mileageSelectedFileText.set('Foto cargada');
      if (existingReturnState.fuelLevelImageUrl) this.fuelSelectedFileText.set('Foto cargada');
      if (existingReturnState.imageUrls?.length) this.vehicleSelectedFilesText.set(`${existingReturnState.imageUrls.length} archivo(s)`);
    }
  }

  onMileageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.mileagePhotoError.set(null);
    const file = input.files[0];
    if (!file) return;
    this.trySetSinglePhoto(file, 'Kilometraje', this.mileageImageUrl, this.mileageSelectedFileText, this.mileagePhotoError);
    input.value = '';
  }

  onFuelFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.fuelPhotoError.set(null);
    const file = input.files[0];
    if (!file) return;
    this.trySetSinglePhoto(file, 'Combustible', this.fuelLevelImageUrl, this.fuelSelectedFileText, this.fuelPhotoError);
    input.value = '';
  }

  onVehicleFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.vehiclePhotoError.set(null);
    const files = Array.from(input.files);
    if (files.length === 0) return;

    const remainingSlots = this.maxVehiclePhotos - this.vehicleImageUrls().length;
    if (remainingSlots <= 0) {
      this.vehiclePhotoError.set(`Máximo ${this.maxVehiclePhotos} foto adicional.`);
      this.toastService.show(`Máximo ${this.maxVehiclePhotos} foto adicional. Elimina una para agregar otra.`, { title: 'Fotos' });
      input.value = '';
      return;
    }

    const currentTotalBytes = this.getTotalBytes(this.getAllPhotoUrls());
    const remainingBytes = this.maxTotalPhotoBytes - currentTotalBytes;
    if (remainingBytes <= 0) {
      this.vehiclePhotoError.set('Se alcanzó el límite total de 2 MB.');
      this.toastService.show('Se alcanzó el límite total de 2 MB. Elimina una foto para agregar otra.', { title: 'Fotos' });
      input.value = '';
      return;
    }

    const acceptedFiles: File[] = [];
    const rejectedReasons: string[] = [];

    for (const file of files) {
      if (acceptedFiles.length >= remainingSlots) break;

      if (!file.type.startsWith('image/')) {
        rejectedReasons.push(`${file.name}: tipo no permitido`);
        continue;
      }
      const acceptedBytes = acceptedFiles.reduce((sum, f) => sum + f.size, 0);
      if (file.size + acceptedBytes > remainingBytes) {
        rejectedReasons.push(`${file.name}: supera el límite total de 2 MB`);
        continue;
      }
      acceptedFiles.push(file);
    }

    if (acceptedFiles.length === 0) {
      this.vehiclePhotoError.set(rejectedReasons[0] ?? 'No se pudieron agregar fotos.');
      this.toastService.show(this.vehiclePhotoError()!, { title: 'Fotos' });
      input.value = '';
      return;
    }

    this.vehicleSelectedFilesText.set(
      acceptedFiles.length === 1 ? acceptedFiles[0].name : `${acceptedFiles.length} archivos seleccionados`
    );

    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        this.vehicleImageUrls.update((urls) => [...urls, dataUrl]);
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeMileagePhoto(): void {
    this.mileageImageUrl.set(null);
    this.mileageSelectedFileText.set('Seleccionar archivo');
    this.mileagePhotoError.set(null);
  }

  removeFuelPhoto(): void {
    this.fuelLevelImageUrl.set(null);
    this.fuelSelectedFileText.set('Seleccionar archivo');
    this.fuelPhotoError.set(null);
  }

  removeVehiclePhoto(index: number): void {
    this.vehicleImageUrls.update(urls => urls.filter((_, i) => i !== index));
    this.vehiclePhotoError.set(null);
  }

  onBack(): void {
    this.router.navigate(['/evaluation']);
  }

  onNext(): void {
    if (this.isSaving()) return;
    if (!this.mileageImageUrl()) {
      this.mileagePhotoError.set('Debe adjuntar 1 foto del kilometraje.');
      this.toastService.show('Debe adjuntar 1 foto del kilometraje.', { title: 'Fotos' });
      return;
    }
    if (!this.fuelLevelImageUrl()) {
      this.fuelPhotoError.set('Debe adjuntar 1 foto del nivel de combustible.');
      this.toastService.show('Debe adjuntar 1 foto del nivel de combustible.', { title: 'Fotos' });
      return;
    }
    if (this.vehicleImageUrls().length < this.minVehiclePhotos) {
      this.vehiclePhotoError.set(`Debe adjuntar al menos ${this.minVehiclePhotos} foto del vehículo.`);
      this.toastService.show(`Debe adjuntar al menos ${this.minVehiclePhotos} foto del vehículo.`, { title: 'Fotos' });
      return;
    }
    if (this.getTotalBytes(this.getAllPhotoUrls()) > this.maxTotalPhotoBytes) {
      this.vehiclePhotoError.set('Las fotos superan el límite total de 2 MB.');
      this.toastService.show('Las fotos superan el límite total de 2 MB. Elimina una foto o usa imágenes más livianas.', {
        title: 'Fotos'
      });
      return;
    }

    const returnState: ReturnStateDraft = {
      mileageImageUrl: this.mileageImageUrl(),
      fuelLevelImageUrl: this.fuelLevelImageUrl(),
      imageUrls: this.vehicleImageUrls()
    };

    this.stateService.setReturnState(returnState);

    const draftId = this.stateService.draftFormId();
    if (!draftId) {
      this.toastService.show('No se encontró el formulario en progreso.', { title: 'Devolución' });
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const brand = this.themeService.getSurveyBrand() ?? undefined;
    this.testDriveFormService.update(draftId, {
      brand,
      returnState: {
        mileageImageUrl: returnState.mileageImageUrl!,
        fuelLevelImageUrl: returnState.fuelLevelImageUrl!,
        images: returnState.imageUrls
      },
      currentStep: 'VEHICLE_RETURN_DATA'
    }).subscribe({
      next: (form) => {
        this.stateService.setTestDriveForm(form);
        this.isSaving.set(false);
        this.router.navigate(['/confirmation']);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('No se pudo guardar la devolución.');
      }
    });
  }

  private trySetSinglePhoto(
    file: File,
    title: string,
    targetUrl: { (): string | null; set: (value: string | null) => void },
    targetText: { set: (value: string) => void },
    targetError: { set: (value: string | null) => void }
  ): void {
    if (!file.type.startsWith('image/')) {
      targetError.set('Tipo de archivo no permitido.');
      this.toastService.show('Tipo de archivo no permitido.', { title });
      return;
    }

    const currentTotalBytes = this.getTotalBytes(this.getAllPhotoUrls());
    const existingBytes = targetUrl() ? this.getDataUrlBytes(targetUrl()!) : 0;
    const remainingBytes = this.maxTotalPhotoBytes - (currentTotalBytes - existingBytes);
    if (file.size > remainingBytes) {
      targetError.set('La foto supera el límite total de 2 MB.');
      this.toastService.show('La foto supera el límite total de 2 MB.', { title });
      return;
    }

    targetText.set(file.name);
    const reader = new FileReader();
    reader.onload = () => targetUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  private getAllPhotoUrls(): string[] {
    const urls: string[] = [];
    const mileage = this.mileageImageUrl();
    const fuel = this.fuelLevelImageUrl();
    if (mileage) urls.push(mileage);
    if (fuel) urls.push(fuel);
    urls.push(...this.vehicleImageUrls());
    return urls;
  }

  private getTotalBytes(urls: string[]): number {
    return urls.reduce((sum, u) => sum + this.getDataUrlBytes(u), 0);
  }

  private getDataUrlBytes(dataUrl: string): number {
    const commaIndex = dataUrl.indexOf(',');
    const b64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
    const cleaned = b64.trim();
    if (!cleaned) return 0;
    const padding = cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0;
    return Math.floor((cleaned.length * 3) / 4) - padding;
  }
}
