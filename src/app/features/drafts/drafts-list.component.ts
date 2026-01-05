import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TestDriveForm } from '../../core/models';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { ThemeService } from '../../core/services/theme.service';
import { DraftFormContextService } from './draft-form-context.service';

type DraftsFilterStatus = 'all' | 'draft' | 'submitted';

@Component({
  selector: 'app-drafts-list',
  standalone: true,
  imports: [CommonModule, WizardLayoutComponent, ContentCardComponent],
  templateUrl: './drafts-list.component.html',
  styleUrl: './drafts-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraftsListComponent {
  private readonly router = inject(Router);
  private readonly testDriveFormService = inject(TestDriveFormService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly toastService = inject(MessageToastService);
  private readonly themeService = inject(ThemeService);
  private readonly ctx = inject(DraftFormContextService);

  readonly isLoading = signal(false);
  readonly isCreating = signal(false);
  readonly openingId = signal<string | null>(null);
  readonly openProgressTooltip = signal<{ formId: string; step: number } | null>(null);
  readonly allForms = signal<TestDriveForm[]>([]);
  readonly selectedStatus = signal<DraftsFilterStatus>('draft');
  readonly filteredForms = computed(() => {
    const selectedStatus = this.selectedStatus();
    const forms = this.allForms();
    const sortKey = (form: TestDriveForm) => form.updatedAt || form.createdAt;

    if (selectedStatus === 'all') return forms;

    if (selectedStatus === 'draft') {
      return forms
        .filter((form) => form.status === 'draft')
        .slice()
        .sort((a: TestDriveForm, b: TestDriveForm) => sortKey(a).localeCompare(sortKey(b))); // oldest -> newest
    }

    return forms.filter((form) => form.status === 'submitted');
  });

  constructor() {
    this.stateService.setCurrentStep(1);
    this.loadForms();
  }

  setStatusFilter(status: DraftsFilterStatus): void {
    if (this.selectedStatus() === status) return;
    this.selectedStatus.set(status);
  }

  loadForms(): void {
    this.isLoading.set(true);
    this.testDriveFormService.getAll().subscribe({
      next: (forms) => {
        const sorted = [...forms].sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
        this.allForms.set(sorted);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('No se pudieron cargar los formularios.', { title: 'Borradores' });
      }
    });
  }

  openDraft(form: TestDriveForm): void {
    if (form.status === 'submitted') {
      this.router.navigate(['/test-drive-forms', form.id, 'ver']);
      return;
    }
    this.openingId.set(form.id);
    this.stateService.reset();
    this.ctx.ensureLoaded(form.id).subscribe({
      next: (loaded) => {
        this.openingId.set(null);
        const step = loaded.currentStep ?? 'CUSTOMER_DATA';
        this.router.navigate([this.routeForStep(step)]);
      },
      error: () => {
        this.openingId.set(null);
        this.toastService.show('No se pudo abrir el formulario.', { title: 'Test Drive' });
      }
    });
  }

  onCardKeydown(event: KeyboardEvent, form: TestDriveForm): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.openDraft(form);
  }

  createNew(): void {
    if (this.isCreating()) return;
    this.isCreating.set(true);
    this.stateService.reset();

    const brand = this.themeService.getSurveyBrand() ?? undefined;
    this.testDriveFormService.createDraft({
      brand,
      currentStep: 'CUSTOMER_DATA',
      status: 'draft'
    }).subscribe({
      next: (form) => {
        this.isCreating.set(false);
        this.stateService.setDraftFormId(form.id);
        this.stateService.setTestDriveForm(form);
        this.router.navigate(['/customer']);
      },
      error: () => {
        this.isCreating.set(false);
        this.toastService.show('No se pudo crear un nuevo formulario.', { title: 'Test Drive' });
      }
    });
  }

  progressIndex(form: TestDriveForm): number {
    switch (form.currentStep) {
      case 'CUSTOMER_DATA':
        return 1;
      case 'VEHICLE_DATA':
        return 2;
      case 'SIGNATURE_DATA':
        return 3;
      case 'VALUATION_DATA':
        return 4;
      case 'VEHICLE_RETURN_DATA':
        return 5;
      case 'FINAL_CONFIRMATION':
        return 6;
      default:
        return 1;
    }
  }

  toggleProgressTooltip(event: MouseEvent, form: TestDriveForm, step: number): void {
    event.stopPropagation();
    const current = this.openProgressTooltip();
    if (current?.formId === form.id && current.step === step) {
      this.openProgressTooltip.set(null);
      return;
    }
    this.openProgressTooltip.set({ formId: form.id, step });
  }

  tooltipText(form: TestDriveForm, step: number): string {
    const missing = this.missingForStep(form, step);
    if (missing.length === 0) return 'Completado.';
    return `Falta: ${missing.join(', ')}.`;
  }

  private missingForStep(form: TestDriveForm, step: number): string[] {
    const missing: string[] = [];

    if (step >= 1) {
      if (!form.customer) missing.push('Datos del cliente');
    }

    if (step >= 2) {
      if (!form.vehicle) missing.push('Datos del vehículo');
      if (!form.location) missing.push('Ubicación');
    }

    if (step >= 3) {
      const sig = form.signature?.signatureData?.trim() ?? '';
      if (sig.length === 0) missing.push('Firma');
    }

    if (step >= 4) {
      if (!Number.isFinite(form.purchaseProbability as number)) missing.push('Probabilidad de compra');
      if ((form.estimatedPurchaseDate ?? '').trim().length === 0) missing.push('Tiempo estimado de compra');
    }

    if (step >= 5) {
      const rs = form.returnState;
      if (!rs?.mileageImage?.url) missing.push('Foto del kilometraje');
      if (!rs?.fuelLevelImage?.url) missing.push('Foto del nivel de combustible');
      if ((rs?.images?.length ?? 0) < 1) missing.push('Fotos del vehículo (mín. 1)');
    }

    if (step >= 6) {
      if (form.status !== 'submitted') missing.push('Finalizar envío');
    }

    return missing;
  }

  formatDate(value: string): string {
    try {
      return new Date(value).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return value;
    }
  }

  private routeForStep(step: NonNullable<TestDriveForm['currentStep']>): string {
    switch (step) {
      case 'CUSTOMER_DATA':
        return '/customer';
      case 'VEHICLE_DATA':
        return '/vehicle';
      case 'SIGNATURE_DATA':
        return '/signature';
      case 'VALUATION_DATA':
        return '/evaluation';
      case 'VEHICLE_RETURN_DATA':
        return '/return';
      case 'FINAL_CONFIRMATION':
        return '/confirmation';
      default:
        return '/customer';
    }
  }
}
