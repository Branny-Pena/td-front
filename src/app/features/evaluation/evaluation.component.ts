import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TestDriveStateService, EvaluationData } from '../../core/services/test-drive-state.service';
import { ComboBoxComponent, ComboBoxOption } from '../../shared/components/combo-box/combo-box.component';

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
    this.router.navigate(['/return']);
  }
}
