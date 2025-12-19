import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMPTY, switchMap } from 'rxjs';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { Survey, SurveyVersion } from '../../core/models';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyVersionService } from '../../core/services/survey-version.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-survey-admin-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    WizardLayoutComponent,
    ContentCardComponent,
    ModalDialogComponent,
  ],
  templateUrl: './survey-admin-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyAdminDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly surveyService = inject(SurveyService);
  private readonly surveyVersionService = inject(SurveyVersionService);
  private readonly toastService = inject(MessageToastService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly themeService = inject(ThemeService);

  readonly isLoading = signal(false);
  readonly survey = signal<Survey | null>(null);
  readonly versions = signal<SurveyVersion[]>([]);

  readonly isCreateVersionOpen = signal(false);
  readonly createVersionForm = new FormGroup({
    version: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    isCurrent: new FormControl<boolean>(true, { nonNullable: true }),
    notes: new FormControl<string>('', { nonNullable: true }),
  });

  readonly canCreateVersion = computed(() => this.createVersionForm.valid && this.survey()?.status !== 'ready');

  constructor() {
    this.stateService.setCurrentStep(1);
    this.load();
  }

  private getSurveyId(): string {
    return this.route.snapshot.paramMap.get('surveyId') ?? '';
  }

  load(): void {
    const surveyId = this.getSurveyId();
    if (!surveyId) return;

    this.isLoading.set(true);
    this.surveyService
      .getById(surveyId)
      .pipe(
        switchMap((survey) => {
          const expected = this.themeService.getSurveyBrand();
          if (survey.brand !== expected) {
            this.isLoading.set(false);
            this.toastService.show('No tienes acceso a encuestas de otra marca.', { title: 'Encuestas' });
            this.router.navigateByUrl('/encuestas');
            return EMPTY;
          }
          this.survey.set(survey);
          return this.surveyVersionService.listForSurvey(surveyId);
        }),
      )
      .subscribe({
        next: (versions) => {
          this.versions.set(versions);
          const nextVersion = (versions[0]?.version ?? 0) + 1;
          this.createVersionForm.reset({ version: nextVersion, isCurrent: true, notes: '' });
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastService.show('No se pudo cargar la encuesta.', { title: 'Encuestas' });
        },
      });
  }

  openCreateVersion(): void {
    if (this.survey()?.status === 'ready') return;
    this.isCreateVersionOpen.set(true);
  }

  closeCreateVersion(): void {
    this.isCreateVersionOpen.set(false);
  }

  createVersion(): void {
    const surveyId = this.getSurveyId();
    if (!surveyId) return;
    if (this.survey()?.status === 'ready') return;

    if (this.createVersionForm.invalid) {
      this.createVersionForm.markAllAsTouched();
      return;
    }

    const v = this.createVersionForm.getRawValue();
    this.surveyVersionService
      .createForSurvey(surveyId, {
        version: v.version,
        isCurrent: v.isCurrent,
        notes: (v.notes ?? '').trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.toastService.show('Versión creada.', { title: 'Encuestas' });
          this.closeCreateVersion();
          this.load();
        },
        error: (err) => {
          const msg =
            typeof err?.error?.message === 'string' && err.error.message.includes('ready')
              ? 'No se pueden crear versiones: la encuesta está en estado Lista.'
              : 'No se pudo crear la versión.';
          this.toastService.show(msg, { title: 'Encuestas' });
        },
      });
  }
}
