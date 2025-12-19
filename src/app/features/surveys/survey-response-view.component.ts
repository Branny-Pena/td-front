import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { SurveyResponse } from '../../core/models';
import { SurveyResponseService } from '../../core/services/survey-response.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-survey-response-view',
  standalone: true,
  imports: [CommonModule, WizardLayoutComponent, ContentCardComponent],
  templateUrl: './survey-response-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyResponseViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly responseService = inject(SurveyResponseService);
  private readonly toastService = inject(MessageToastService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly themeService = inject(ThemeService);

  readonly isLoading = signal(false);
  readonly response = signal<SurveyResponse | null>(null);
  readonly backLink = signal<string>('/encuestas');

  constructor() {
    this.stateService.setCurrentStep(1);
    const fromVersionId = this.route.snapshot.queryParamMap.get('fromVersionId');
    if (fromVersionId) this.backLink.set(`/encuestas/version/${fromVersionId}`);
    this.load();
  }

  private getId(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }

  load(): void {
    const id = this.getId();
    if (!id) return;
    this.isLoading.set(true);
    this.responseService.getById(id).subscribe({
      next: (res) => {
        const expected = this.themeService.getSurveyBrand();
        const brand = res.surveyVersion?.survey?.brand;
        if (brand && brand !== expected) {
          this.isLoading.set(false);
          this.toastService.show('No tienes acceso a encuestas de otra marca.', { title: 'Encuestas' });
          this.router.navigateByUrl('/encuestas');
          return;
        }
        this.response.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('No se pudo cargar la respuesta.', { title: 'Encuestas' });
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

  formatAnswer(ans: SurveyResponse['answers'][number]): string {
    if (ans.question.type === 'number') return String(ans.valueNumber ?? '');
    if (ans.question.type === 'text') return ans.valueText ?? '';
    if (ans.option) return ans.option.label;
    return '';
  }

  goBack(): void {
    this.router.navigateByUrl(this.backLink());
  }
}
