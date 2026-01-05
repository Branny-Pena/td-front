import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TestDriveStateService, EvaluationData } from '../../core/services/test-drive-state.service';
import { ComboBoxComponent, ComboBoxOption } from '../../shared/components/combo-box/combo-box.component';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    WizardLayoutComponent,
    ContentCardComponent,
    ComboBoxComponent
  ],
  templateUrl: './evaluation.component.html',
  styleUrl: './evaluation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly stateService = inject(TestDriveStateService);
  private readonly testDriveFormService = inject(TestDriveFormService);
  private readonly toastService = inject(MessageToastService);
  private readonly themeService = inject(ThemeService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly estimatedPurchaseOptions: ComboBoxOption[] = [
    { value: '1 mes', label: '1 mes' },
    { value: '1 a 3 meses', label: '1 a 3 meses' },
    { value: 'Más de 3 meses', label: 'Más de 3 meses' }
  ];

  readonly form = this.fb.nonNullable.group({
    purchaseProbability: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
    estimatedPurchaseDate: ['', Validators.required],
    observations: ['', [Validators.maxLength(250)]]
  });

  constructor() {
    this.stateService.setCurrentStep(4);
    const existingEvaluation = this.stateService.evaluation();
    if (existingEvaluation) {
      this.form.patchValue({
        purchaseProbability: existingEvaluation.purchaseProbability,
        estimatedPurchaseDate: existingEvaluation.estimatedPurchaseDate,
        observations: existingEvaluation.observations
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/signature']);
  }

  onNext(): void {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();
    const evaluation: EvaluationData = {
      purchaseProbability: formValue.purchaseProbability,
      estimatedPurchaseDate: formValue.estimatedPurchaseDate,
      observations: formValue.observations?.trim() || ''
    };

    this.stateService.setEvaluation(evaluation);

    const draftId = this.stateService.draftFormId();
    const brand = this.themeService.getSurveyBrand() ?? undefined;

    if (!draftId) {
      this.toastService.show('No se encontró el formulario en progreso.', { title: 'Evaluación' });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.testDriveFormService.update(draftId, {
      brand,
      purchaseProbability: evaluation.purchaseProbability,
      estimatedPurchaseDate: evaluation.estimatedPurchaseDate,
      observations: evaluation.observations,
      currentStep: 'VEHICLE_RETURN_DATA'
    }).subscribe({
      next: (form) => {
        this.stateService.setTestDriveForm(form);
        this.isLoading.set(false);
        this.router.navigate(['/return']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudo guardar la evaluación.');
      }
    });
  }
}
