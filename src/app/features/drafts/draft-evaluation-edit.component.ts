import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { ComboBoxComponent, ComboBoxOption } from '../../shared/components/combo-box/combo-box.component';
import { DraftFormContextService } from './draft-form-context.service';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';
import { TestDriveStateService, EvaluationData } from '../../core/services/test-drive-state.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { UpdateTestDriveFormDto } from '../../core/models';

@Component({
  selector: 'app-draft-evaluation-edit',
  standalone: true,
  imports: [ReactiveFormsModule, WizardLayoutComponent, ContentCardComponent, ComboBoxComponent],
  templateUrl: './draft-evaluation-edit.component.html',
  styleUrl: './draft-evaluation-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraftEvaluationEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly ctx = inject(DraftFormContextService);
  private readonly testDriveFormService = inject(TestDriveFormService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly toastService = inject(MessageToastService);

  readonly isLoading = signal(false);
  readonly isPageLoading = signal(false);
  readonly draftId = signal<string>('');

  readonly estimatedPurchaseOptions: ComboBoxOption[] = [
    { value: '1 mes', label: '1 mes' },
    { value: '1 a 3 meses', label: '1 a 3 meses' },
    { value: 'Más de 3 meses', label: 'Más de 3 meses' }
  ];

  readonly form = this.fb.nonNullable.group({
    purchaseProbability: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
    estimatedPurchaseDate: ['', Validators.required],
    observations: ['', [Validators.maxLength(255)]]
  });

  constructor() {
    this.stateService.setCurrentStep(4);
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/borradores']);
      return;
    }
    this.draftId.set(id);
    this.load(id);
  }

  private load(id: string): void {
    this.isPageLoading.set(true);
    this.ctx.ensureLoaded(id).subscribe({
      next: () => {
        const existing = this.stateService.evaluation();
        if (existing) {
          this.form.patchValue({
            purchaseProbability: existing.purchaseProbability,
            estimatedPurchaseDate: existing.estimatedPurchaseDate,
            observations: existing.observations
          });
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
    this.router.navigate(['/borradores', this.draftId(), 'firma']);
  }

  onNext(): void {
    if (this.form.invalid) return;

    const draftId = this.draftId();
    if (!draftId) return;

    this.isLoading.set(true);

    const formValue = this.form.getRawValue();
    const evaluation: EvaluationData = {
      purchaseProbability: formValue.purchaseProbability,
      estimatedPurchaseDate: formValue.estimatedPurchaseDate,
      observations: formValue.observations?.trim() || ''
    };
    this.stateService.setEvaluation(evaluation);

    const currentStatus = this.stateService.testDriveForm()?.status ?? 'draft';
    const dto: UpdateTestDriveFormDto = {
      purchaseProbability: evaluation.purchaseProbability,
      estimatedPurchaseDate: evaluation.estimatedPurchaseDate,
      status: currentStatus
    };
    if (evaluation.observations.trim().length > 0) dto.observations = evaluation.observations.trim();

    this.testDriveFormService.update(draftId, dto).subscribe({
      next: (updated) => {
        this.stateService.setTestDriveForm(updated);
        this.isLoading.set(false);
        this.router.navigate(['/borradores', draftId, 'devolucion']);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('No se pudo guardar la evaluación.', { title: 'Evaluación' });
      }
    });
  }
}
