import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TestDriveStateService, ReturnStateDraft } from '../../core/services/test-drive-state.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { CreateReturnStateDto } from '../../core/models';
import { DraftFormContextService } from './draft-form-context.service';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';

@Component({
  selector: 'app-draft-return-edit',
  standalone: true,
  imports: [ReactiveFormsModule, WizardLayoutComponent, ContentCardComponent],
  templateUrl: './draft-return-edit.component.html',
  styleUrl: './draft-return-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraftReturnEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly testDriveFormService = inject(TestDriveFormService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly toastService = inject(MessageToastService);
  private readonly ctx = inject(DraftFormContextService);

  private readonly maxPhotos = 3;
  private readonly maxTotalPhotoBytes = 2 * 1024 * 1024;

  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly draftId = signal<string>('');

  readonly imageUrls = signal<string[]>([]);
  readonly selectedFilesText = signal<string>('Seleccionar archivo');
  readonly photoError = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    finalMileage: [0, [Validators.required, Validators.min(0)]],
    fuelLevelPercentage: [50, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  constructor() {
    this.stateService.setCurrentStep(5);
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/borradores']);
      return;
    }
    this.draftId.set(id);
    this.loadDraftIfNeeded(id);
  }

  private loadDraftIfNeeded(id: string): void {
    this.isPageLoading.set(true);
    this.ctx.ensureLoaded(id).subscribe({
      next: (form) => {
        if (form.status !== 'draft' && form.status !== 'pending') {
          this.toastService.show('Este formulario ya fue enviado y no se puede editar.', { title: 'Formulario' });
          this.router.navigate(['/borradores', id, 'ver']);
          return;
        }
        this.restoreFromState();
        this.isPageLoading.set(false);
      },
      error: () => {
        this.isPageLoading.set(false);
        this.toastService.show('No se pudo cargar el borrador.', { title: 'Borradores' });
        this.router.navigate(['/borradores']);
      }
    });
  }

  private restoreFromState(): void {
    const existingReturnState = this.stateService.returnState();
    if (!existingReturnState) return;
    this.form.patchValue({
      finalMileage: existingReturnState.finalMileage,
      fuelLevelPercentage: existingReturnState.fuelLevelPercentage
    });
    this.imageUrls.set(existingReturnState.imageUrls);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.photoError.set(null);
    const files = Array.from(input.files);

    const remainingSlots = this.maxPhotos - this.imageUrls().length;
    if (remainingSlots <= 0) {
      this.photoError.set(`Máximo ${this.maxPhotos} fotos.`);
      this.toastService.show(`Máximo ${this.maxPhotos} fotos. Elimina una para agregar otra.`, { title: 'Fotos' });
      input.value = '';
      return;
    }

    const currentTotalBytes = this.getTotalBytes(this.imageUrls());
    const remainingBytes = this.maxTotalPhotoBytes - currentTotalBytes;
    if (remainingBytes <= 0) {
      this.photoError.set('Se alcanzó el límite total de 2 MB.');
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
      this.photoError.set(rejectedReasons[0] ?? 'No se pudieron agregar fotos.');
      this.toastService.show(this.photoError()!, { title: 'Fotos' });
      input.value = '';
      return;
    }

    if (files.length > acceptedFiles.length) {
      this.toastService.show(
        `Se agregaron ${acceptedFiles.length} foto(s). Máximo ${this.maxPhotos} fotos y 2 MB en total.`,
        { title: 'Fotos' }
      );
    }

    this.selectedFilesText.set(
      acceptedFiles.length === 0
        ? 'Seleccionar archivo'
        : acceptedFiles.length === 1
          ? acceptedFiles[0].name
          : `${acceptedFiles.length} archivos seleccionados`
    );

    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        this.imageUrls.update(urls => [...urls, dataUrl]);
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(index: number): void {
    this.imageUrls.update(urls => urls.filter((_, i) => i !== index));
    this.photoError.set(null);
  }

  onBack(): void {
    this.router.navigate(['/borradores', this.draftId(), 'evaluacion']);
  }

  onNext(): void {
    if (this.form.invalid) return;
    if (this.imageUrls().length < 1) {
      this.photoError.set('Debe adjuntar al menos 1 foto.');
      this.toastService.show('Debe adjuntar al menos 1 foto.', { title: 'Fotos' });
      return;
    }
    if (this.getTotalBytes(this.imageUrls()) > this.maxTotalPhotoBytes) {
      this.photoError.set('Las fotos superan el límite total de 2 MB.');
      this.toastService.show('Las fotos superan el límite total de 2 MB. Elimina una foto o usa imágenes más livianas.', {
        title: 'Fotos'
      });
      return;
    }

    const draftId = this.draftId();
    if (!draftId) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.getRawValue();
    const returnState: CreateReturnStateDto = {
      finalMileage: formValue.finalMileage,
      fuelLevelPercentage: formValue.fuelLevelPercentage,
      images: this.imageUrls()
    };

    this.testDriveFormService.update(draftId, { returnState }).subscribe({
      next: (updated) => {
        const returnDraft: ReturnStateDraft = {
          finalMileage: returnState.finalMileage,
          fuelLevelPercentage: returnState.fuelLevelPercentage,
          imageUrls: returnState.images
        };
        this.stateService.setReturnState(returnDraft);
        this.stateService.setTestDriveForm(updated);
        this.isLoading.set(false);
        this.toastService.show('Devolución actualizada.', { title: 'Devolución' });
        this.router.navigate(['/borradores', draftId, 'confirmacion']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.message || 'No se pudo actualizar la devolución.');
      }
    });
  }

  private getTotalBytes(urls: string[]): number {
    return urls.reduce((sum, u) => sum + this.getDataUrlBytes(u), 0);
  }

  private getDataUrlBytes(dataUrl: string): number {
    if (!dataUrl.startsWith('data:')) return 0;
    const commaIndex = dataUrl.indexOf(',');
    const b64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
    const cleaned = b64.trim();
    if (!cleaned) return 0;
    const padding = cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0;
    return Math.floor((cleaned.length * 3) / 4) - padding;
  }
}
