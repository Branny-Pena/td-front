import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyVersionService } from '../../core/services/survey-version.service';
import { SurveyVersion } from '../../core/models';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-survey-publish-review',
  standalone: true,
  imports: [CommonModule, RouterLink, WizardLayoutComponent, ContentCardComponent],
  templateUrl: './survey-publish-review.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyPublishReviewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly versionService = inject(SurveyVersionService);
  private readonly surveyService = inject(SurveyService);
  private readonly toastService = inject(MessageToastService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly themeService = inject(ThemeService);

  readonly isLoading = signal(false);
  readonly isPublishing = signal(false);
  readonly version = signal<SurveyVersion | null>(null);

  readonly canPublish = computed(() => {
    const v = this.version();
    if (!v?.survey?.id) return false;
    if (v.survey.status === 'ready') return false;
    return (v.questions?.length ?? 0) > 0;
  });

  constructor() {
    this.stateService.setCurrentStep(1);
    this.load();
  }

  private getVersionId(): string {
    return this.route.snapshot.paramMap.get('versionId') ?? '';
  }

  getBackRoute(): unknown[] {
    const versionId = this.getVersionId();
    return ['/encuestas/version', versionId];
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
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('No se pudo cargar la encuesta para revisión.', { title: 'Encuestas' });
      },
    });
  }

  publish(): void {
    const v = this.version();
    const surveyId = v?.survey?.id ?? '';
    if (!surveyId) return;
    if (!this.canPublish()) return;

    this.isPublishing.set(true);
    this.surveyService.update(surveyId, { status: 'ready' }).subscribe({
      next: () => {
        this.isPublishing.set(false);
        this.toastService.show('Encuesta publicada. Ahora es de solo lectura.', { title: 'Encuestas' });
        this.router.navigate(['/encuestas', surveyId]);
      },
      error: (err) => {
        this.isPublishing.set(false);
        const msg =
          typeof err?.error?.message === 'string' && err.error.message.includes('ready')
            ? 'La encuesta ya está publicada.'
            : 'No se pudo publicar la encuesta.';
        this.toastService.show(msg, { title: 'Encuestas' });
      },
    });
  }
}
