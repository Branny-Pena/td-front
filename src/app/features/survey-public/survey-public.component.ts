import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { ThemeService, TdThemeId } from '../../core/services/theme.service';
import {
  SurveyBrand,
  SurveyQuestion,
  SurveyQuestionType,
  SurveyResponse,
  SubmitSurveyAnswerItemDto,
  SurveyVersion,
} from '../../core/models';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyVersionService } from '../../core/services/survey-version.service';
import { SurveyResponseService } from '../../core/services/survey-response.service';

function requiredArray(control: AbstractControl): ValidationErrors | null {
  const value = control.value as unknown;
  if (!Array.isArray(value)) return { required: true };
  return value.length > 0 ? null : { required: true };
}

@Component({
  selector: 'app-survey-public',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WizardLayoutComponent, ContentCardComponent],
  templateUrl: './survey-public.component.html',
  styleUrl: './survey-public.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyPublicComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(MessageToastService);
  private readonly themeService = inject(ThemeService);
  private readonly surveyService = inject(SurveyService);
  private readonly surveyVersionService = inject(SurveyVersionService);
  private readonly responseService = inject(SurveyResponseService);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly isSubmitted = signal(false);

  readonly response = signal<SurveyResponse | null>(null);
  readonly version = signal<SurveyVersion | null>(null);

  readonly form = signal<FormGroup | null>(null);

  readonly questions = computed(() => this.version()?.questions ?? []);
  readonly title = computed(() => this.version()?.survey?.name ?? 'Encuesta');
  readonly brand = computed(() => this.version()?.survey?.brand ?? null);

  private readonly previousThemeId: TdThemeId = this.themeService.themeId();
  private readonly storagePrefix = 'td-survey-response';

  constructor() {
    this.load();
    this.destroyRef.onDestroy(() => {
      this.themeService.apply(this.previousThemeId, { persist: false });
    });
  }

  private persistResponseId(response: SurveyResponse): void {
    try {
      const versionId = response.surveyVersion?.id;
      const formId = response.testDriveForm?.id;
      if (!versionId || !formId) return;
      const key = `${this.storagePrefix}:${versionId}:${formId}`;
      localStorage.setItem(key, response.id);
    } catch {
      // ignore
    }
  }

  private getParamId(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }

  private mapBrandToThemeId(brand: SurveyBrand): TdThemeId {
    switch (brand) {
      case 'MERCEDES-BENZ':
        return 'mercedes';
      case 'ANDES MOTOR':
        return 'andes';
      case 'STELLANTIS':
        return 'stellantis';
    }
  }

  private applyBrandTheme(brand: SurveyBrand): void {
    this.themeService.apply(this.mapBrandToThemeId(brand), { persist: false });
  }

  private buildForm(questions: SurveyQuestion[]): FormGroup {
    const group: Record<string, FormControl<unknown>> = {};
    for (const q of questions) {
      const key = `q_${q.id}`;
      if (q.type === 'number') {
        const validators = [];
        if (q.isRequired) validators.push(Validators.required);
        if (q.minValue != null) validators.push(Validators.min(q.minValue));
        if (q.maxValue != null) validators.push(Validators.max(q.maxValue));
        group[key] = new FormControl<number | null>(null, { validators });
        continue;
      }
      if (q.type === 'text') {
        const validators = q.isRequired ? [Validators.required] : [];
        group[key] = new FormControl<string>('', { nonNullable: true, validators });
        continue;
      }
      if (q.type === 'option_single') {
        const validators = q.isRequired ? [Validators.required] : [];
        group[key] = new FormControl<string | null>(null, { validators });
        continue;
      }
      if (q.type === 'option_multi') {
        const validators = q.isRequired ? [requiredArray] : [];
        group[key] = new FormControl<string[]>([], { nonNullable: true, validators });
        continue;
      }
    }
    return new FormGroup(group);
  }

  sliderPercent(value: number | null, min: number, max: number): number {
    const safeMin = Number.isFinite(min) ? min : 0;
    const safeMax = Number.isFinite(max) ? max : safeMin;
    const denom = safeMax - safeMin;
    if (denom <= 0) return 0;
    if (value == null || Number.isNaN(value)) return 0;
    const clamped = Math.min(safeMax, Math.max(safeMin, value));
    return ((clamped - safeMin) / denom) * 100;
  }

  load(): void {
    const id = this.getParamId();
    if (!id) return;

    this.isLoading.set(true);
    this.isSubmitted.set(false);

    this.responseService
      .getById(id)
      .pipe(
        switchMap((response) => {
          this.response.set(response);
          this.persistResponseId(response);
          if (response.surveyVersion?.survey?.brand) {
            this.applyBrandTheme(response.surveyVersion.survey.brand);
          }

          if (response.status === 'submitted') {
            this.isSubmitted.set(true);
            return of(null);
          }
          return this.surveyVersionService.getFullVersion(response.surveyVersion.id);
        }),
        catchError(() => {
          return this.loadBySurveyIdFallback(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (version) => {
          if (version) {
            this.version.set(version);
            if (version.survey?.brand) this.applyBrandTheme(version.survey.brand);
            this.form.set(this.buildForm(version.questions ?? []));
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastService.show('No se pudo cargar la encuesta.', { title: 'Encuesta' });
        },
      });
  }

  private loadBySurveyIdFallback(surveyId: string) {
    const testDriveFormId =
      this.route.snapshot.queryParamMap.get('formId') ??
      this.route.snapshot.queryParamMap.get('testDriveFormId') ??
      this.route.snapshot.queryParamMap.get('testDriveFormIdentifier');

    return this.surveyService.getById(surveyId).pipe(
      switchMap((survey) => {
        this.applyBrandTheme(survey.brand);
        return this.surveyVersionService.getCurrentForSurvey(survey.id);
      }),
      switchMap((currentVersion) => this.surveyVersionService.getFullVersion(currentVersion.id)),
      switchMap((full) => {
        if (!testDriveFormId) return of(full);
        return this.responseService
          .start({ surveyVersionId: full.id, testDriveFormIdentifier: testDriveFormId })
          .pipe(
            switchMap((resp) => {
              this.response.set(resp);
              this.persistResponseId(resp);
              return of(full);
            }),
          );
      }),
    );
  }

  toggleMulti(questionId: string, optionId: string): void {
    const form = this.form();
    if (!form) return;
    const control = form.get(`q_${questionId}`) as FormControl<string[]> | null;
    if (!control) return;
    const current = control.value ?? [];
    const next = current.includes(optionId)
      ? current.filter((x) => x !== optionId)
      : [...current, optionId];
    control.setValue(next);
    control.markAsDirty();
    control.markAsTouched();
  }

  submit(): void {
    const response = this.response();
    const version = this.version();
    const form = this.form();
    if (!response || !version || !form) return;

    form.markAllAsTouched();
    if (form.invalid) {
      this.toastService.show('Completa los campos requeridos.', { title: 'Encuesta' });
      return;
    }

    const answers: SubmitSurveyAnswerItemDto[] = [];
    for (const q of version.questions ?? []) {
      const key = `q_${q.id}`;
      const value = form.get(key)?.value;

      if (q.type === 'number') {
        const num =
          value === null || value === undefined || value === '' ? null : Number(value);
        if (num === null || Number.isNaN(num)) continue;
        answers.push({ questionId: q.id, valueNumber: num });
        continue;
      }
      if (q.type === 'text') {
        const text = String(value ?? '').trim();
        if (!text.length) continue;
        answers.push({ questionId: q.id, valueText: text });
        continue;
      }
      if (q.type === 'option_single') {
        const optionId = String(value ?? '').trim();
        if (!optionId) continue;
        answers.push({ questionId: q.id, optionIds: [optionId] });
        continue;
      }
      if (q.type === 'option_multi') {
        const optionIds = Array.isArray(value) ? (value as string[]) : [];
        if (!optionIds.length) continue;
        answers.push({ questionId: q.id, optionIds });
      }
    }

    this.isSubmitting.set(true);
    this.responseService.submitAnswers(response.id, { answers }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isSubmitted.set(true);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg =
          typeof err?.error?.message === 'string'
            ? err.error.message
            : 'No se pudo enviar la encuesta.';
        this.toastService.show(msg, { title: 'Encuesta' });
      },
    });
  }

  questionHint(q: SurveyQuestion): string {
    if (q.type === 'number') {
      const min = q.minValue ?? 1;
      const max = q.maxValue ?? 10;
      return `Escala de ${min} a ${max}`;
    }
    if (q.type === 'option_single') return 'Selecciona una opción';
    if (q.type === 'option_multi') return 'Puedes seleccionar varias opciones';
    return '';
  }

  isChecked(questionId: string, optionId: string): boolean {
    const form = this.form();
    if (!form) return false;
    const value = form.get(`q_${questionId}`)?.value;
    return Array.isArray(value) ? (value as string[]).includes(optionId) : false;
  }

  typeLabel(type: SurveyQuestionType): string {
    switch (type) {
      case 'number':
        return 'Número';
      case 'text':
        return 'Texto';
      case 'option_single':
        return 'Opción única';
      case 'option_multi':
        return 'Opción múltiple';
    }
  }
}
