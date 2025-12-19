import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { fromEvent, map, startWith } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { MessageToastService } from '../../shared/services/message-toast.service';
import {
  CreateSurveyQuestionDto,
  SurveyQuestionType,
  SurveyResponse,
  SurveyResponseStatus,
  SurveyVersion,
} from '../../core/models';
import { SurveyResponseService } from '../../core/services/survey-response.service';
import { SurveyVersionService } from '../../core/services/survey-version.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { ThemeService } from '../../core/services/theme.service';

type QuestionTypeOption = { value: SurveyQuestionType; label: string };
type EditorTab = 'answers' | 'content';
type ResponseFilter = 'all' | SurveyResponseStatus;

@Component({
  selector: 'app-survey-version-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, WizardLayoutComponent, ContentCardComponent],
  templateUrl: './survey-version-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyVersionEditorComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly versionService = inject(SurveyVersionService);
  private readonly responseService = inject(SurveyResponseService);
  private readonly toastService = inject(MessageToastService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly themeService = inject(ThemeService);

  readonly isLoading = signal(false);
  readonly version = signal<SurveyVersion | null>(null);
  readonly isReadOnly = computed(() => this.version()?.survey?.status === 'ready');

  readonly typeOptions: QuestionTypeOption[] = [
    { value: 'number', label: 'Número (escala)' },
    { value: 'text', label: 'Texto' },
    { value: 'option_single', label: 'Opción única' },
    { value: 'option_multi', label: 'Opción múltiple' },
  ];

  readonly activeTab = signal<EditorTab>('answers');

  readonly isResponsesLoading = signal(false);
  readonly responses = signal<SurveyResponse[]>([]);
  readonly selectedResponseFilter = signal<ResponseFilter>('submitted');

  readonly filteredResponses = computed(() => {
    const selected = this.selectedResponseFilter();
    const responses = this.responses();
    if (selected === 'all') return responses;
    return responses.filter((r) => r.status === selected);
  });

  readonly questionForm = new FormGroup({
    type: new FormControl<SurveyQuestionType>('number', { nonNullable: true, validators: [Validators.required] }),
    label: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    isRequired: new FormControl(true, { nonNullable: true }),
    orderIndex: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    minValue: new FormControl<number | null>(1),
    maxValue: new FormControl<number | null>(10),
    options: new FormArray<FormGroup<{ label: FormControl<string>; value: FormControl<string> }>>([]),
  });

  private readonly selectedType = toSignal(
    this.questionForm.controls.type.valueChanges.pipe(startWith(this.questionForm.controls.type.value)),
    { initialValue: this.questionForm.controls.type.value },
  );

  readonly isTypeMenuOpen = signal(false);
  readonly typeActiveIndex = signal(-1);

  readonly isOptionType = computed(() => {
    const type = this.selectedType();
    return type === 'option_single' || type === 'option_multi';
  });

  readonly isNumberType = computed(() => this.selectedType() === 'number');

  readonly selectedTypeLabel = computed(() => {
    const v = this.selectedType();
    return this.typeOptions.find((o) => o.value === v)?.label ?? '';
  });

  readonly options = computed(() => this.questionForm.controls.options);
  readonly canAddQuestion = toSignal(
    this.questionForm.statusChanges.pipe(
      startWith(this.questionForm.status),
      map(() => this.questionForm.valid),
    ),
    { initialValue: this.questionForm.valid },
  );

  constructor() {
    this.stateService.setCurrentStep(1);
    this.load();
    this.applyDynamicValidators();

    fromEvent<PointerEvent>(document, 'pointerdown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (!this.isTypeMenuOpen()) return;
        const target = event.target as Node | null;
        if (!target) return;
        // Close when clicking outside the dropdown root.
        const host = document.getElementById('td-question-type-dropdown');
        if (host && host.contains(target)) return;
        this.closeTypeMenu();
      });
  }

  setTab(tab: EditorTab): void {
    if (tab === this.activeTab()) return;
    this.activeTab.set(tab);
    this.closeTypeMenu();
    if (tab === 'answers') this.loadResponses();
  }

  setResponseFilter(value: ResponseFilter): void {
    this.selectedResponseFilter.set(value);
  }

  toggleTypeMenu(): void {
    if (this.isTypeMenuOpen()) this.closeTypeMenu();
    else this.openTypeMenu();
  }

  openTypeMenu(): void {
    if (this.isTypeMenuOpen()) return;
    this.isTypeMenuOpen.set(true);
    const idx = this.typeOptions.findIndex((o) => o.value === this.questionForm.controls.type.value);
    this.typeActiveIndex.set(idx >= 0 ? idx : 0);
  }

  closeTypeMenu(): void {
    if (!this.isTypeMenuOpen()) return;
    this.isTypeMenuOpen.set(false);
    this.typeActiveIndex.set(-1);
  }

  selectType(value: SurveyQuestionType): void {
    if (value === this.questionForm.controls.type.value) {
      this.closeTypeMenu();
      return;
    }
    this.questionForm.controls.type.setValue(value);
    this.onTypeChange();
    this.closeTypeMenu();
  }

  onTypeOptionPointerEnter(index: number): void {
    this.typeActiveIndex.set(index);
  }

  onTypeButtonKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!this.isTypeMenuOpen()) this.openTypeMenu();
        else this.typeActiveIndex.set(Math.min(this.typeActiveIndex() + 1, this.typeOptions.length - 1));
        return;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.isTypeMenuOpen()) this.openTypeMenu();
        else this.typeActiveIndex.set(Math.max(this.typeActiveIndex() - 1, 0));
        return;
      }
      case 'Enter': {
        if (!this.isTypeMenuOpen()) {
          event.preventDefault();
          this.openTypeMenu();
          return;
        }
        event.preventDefault();
        const idx = this.typeActiveIndex();
        const opt = this.typeOptions[idx] ?? this.typeOptions[0];
        if (opt) this.selectType(opt.value);
        return;
      }
      case 'Escape': {
        if (!this.isTypeMenuOpen()) return;
        event.preventDefault();
        this.closeTypeMenu();
        return;
      }
      default:
        return;
    }
  }

  private getVersionId(): string {
    return this.route.snapshot.paramMap.get('versionId') ?? '';
  }

  versionIdForLinks(): string {
    return this.getVersionId();
  }

  getReviewRoute(): unknown[] {
    const versionId = this.getVersionId();
    return ['/encuestas/version', versionId, 'revision'];
  }

  load(): void {
    const versionId = this.getVersionId();
    if (!versionId) return;
    this.isLoading.set(true);
    this.versionService.getFullVersion(versionId).subscribe({
      next: (v) => {
        const expected = this.themeService.getSurveyBrand();
        const brand = v.survey?.brand;
        if (brand && brand !== expected) {
          this.isLoading.set(false);
          this.toastService.show('No tienes acceso a encuestas de otra marca.', { title: 'Encuestas' });
          this.router.navigateByUrl('/encuestas');
          return;
        }
        this.version.set(v);
        const nextIndex = ((v.questions?.[v.questions.length - 1]?.orderIndex ?? 0) + 1) || 1;
        this.resetQuestionForm(nextIndex);
        this.isLoading.set(false);
        if (this.activeTab() === 'answers') this.loadResponses();
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('No se pudo cargar la versión.', { title: 'Encuestas' });
      },
    });
  }

  loadResponses(): void {
    const versionId = this.getVersionId();
    if (!versionId) return;
    this.isResponsesLoading.set(true);
    this.responseService.listAll({ surveyVersionId: versionId }).subscribe({
      next: (items) => {
        this.responses.set(items);
        this.isResponsesLoading.set(false);
      },
      error: () => {
        this.isResponsesLoading.set(false);
        this.toastService.show('No se pudieron cargar las respuestas.', { title: 'Encuestas' });
      },
    });
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return value;
    }
  }

  onTypeChange(): void {
    const type = this.questionForm.controls.type.value;

    if (type === 'number') {
      this.questionForm.controls.minValue.setValue(this.questionForm.controls.minValue.value ?? 1);
      this.questionForm.controls.maxValue.setValue(this.questionForm.controls.maxValue.value ?? 10);
    } else {
      this.questionForm.controls.minValue.setValue(null);
      this.questionForm.controls.maxValue.setValue(null);
    }

    const arr = this.questionForm.controls.options;
    while (arr.length) arr.removeAt(0);
    if (type === 'option_single' || type === 'option_multi') {
      this.addOption();
      this.addOption();
    }

    this.applyDynamicValidators();
  }

  addOption(): void {
    this.questionForm.controls.options.push(
      new FormGroup({
        label: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        value: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      }),
    );
  }

  removeOption(index: number): void {
    this.questionForm.controls.options.removeAt(index);
    this.applyDynamicValidators();
  }

  addQuestion(): void {
    const versionId = this.getVersionId();
    if (!versionId) return;
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    const raw = this.questionForm.getRawValue();
    const dto: CreateSurveyQuestionDto = {
      type: raw.type,
      label: raw.label.trim(),
      isRequired: raw.isRequired,
      orderIndex: raw.orderIndex,
    };

    if (raw.type === 'number') {
      dto.minValue = raw.minValue ?? undefined;
      dto.maxValue = raw.maxValue ?? undefined;
    }

    if (raw.type === 'option_single' || raw.type === 'option_multi') {
      const opts = (raw.options ?? [])
        .map((o, idx) => ({ label: o.label.trim(), value: o.value.trim(), orderIndex: idx + 1 }))
        .filter((o) => o.label.length > 0 && o.value.length > 0);
      dto.options = opts;
    }

    this.versionService.addQuestion(versionId, dto).subscribe({
      next: () => {
        this.toastService.show('Pregunta agregada.', { title: 'Encuestas' });
        this.load();
      },
      error: (err) => {
        const msg: string =
          err?.error?.message === 'Survey version is immutable because it already has responses'
            ? 'No se pueden agregar preguntas: esta versión ya tiene respuestas.'
            : 'No se pudo agregar la pregunta.';
        this.toastService.show(msg, { title: 'Encuestas' });
      },
    });
  }

  private resetQuestionForm(nextIndex: number): void {
    this.questionForm.reset({
      type: 'number',
      label: '',
      isRequired: true,
      orderIndex: nextIndex,
      minValue: 1,
      maxValue: 10,
    });
    const arr = this.questionForm.controls.options;
    while (arr.length) arr.removeAt(0);
    this.applyDynamicValidators();
    this.questionForm.markAsPristine();
  }

  private applyDynamicValidators(): void {
    const type = this.questionForm.controls.type.value;

    if (type === 'number') {
      this.questionForm.controls.minValue.setValidators([Validators.required]);
      this.questionForm.controls.maxValue.setValidators([Validators.required]);
    } else {
      this.questionForm.controls.minValue.clearValidators();
      this.questionForm.controls.maxValue.clearValidators();
    }
    this.questionForm.controls.minValue.updateValueAndValidity({ emitEvent: false });
    this.questionForm.controls.maxValue.updateValueAndValidity({ emitEvent: false });

    if (type === 'option_single' || type === 'option_multi') {
      this.questionForm.controls.options.setValidators([
        (control: AbstractControl): ValidationErrors | null => {
          const value = control.value as unknown;
          return Array.isArray(value) && value.length > 0 ? null : { required: true };
        },
      ]);
    } else {
      this.questionForm.controls.options.clearValidators();
    }
    this.questionForm.controls.options.updateValueAndValidity({ emitEvent: false });

    this.questionForm.setValidators([
      (control: AbstractControl): ValidationErrors | null => {
        const group = control as FormGroup;
        const t = group.get('type')?.value as SurveyQuestionType | undefined;
        if (t !== 'number') return null;
        const min = group.get('minValue')?.value as number | null;
        const max = group.get('maxValue')?.value as number | null;
        if (min == null || max == null) return null;
        return min <= max ? null : { minGreaterThanMax: true };
      },
    ]);
    this.questionForm.updateValueAndValidity({ emitEvent: false });
  }
}
