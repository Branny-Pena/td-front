import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, map, of, startWith } from 'rxjs';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { MessageToastService } from '../../shared/services/message-toast.service';
import { Survey, SurveyBrand } from '../../core/models';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyVersionService } from '../../core/services/survey-version.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { ThemeService } from '../../core/services/theme.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-surveys-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    WizardLayoutComponent,
    ContentCardComponent,
    ModalDialogComponent,
  ],
  templateUrl: './surveys-admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveysAdminComponent {
  private readonly surveyService = inject(SurveyService);
  private readonly surveyVersionService = inject(SurveyVersionService);
  private readonly toastService = inject(MessageToastService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly themeService = inject(ThemeService);

  readonly isLoading = signal(false);
  readonly isCreateOpen = signal(false);
  readonly surveys = signal<Survey[]>([]);
  readonly currentVersionBySurveyId = signal<Record<string, number | null>>({});

  readonly brandOptions = [
    { value: 'MERCEDES-BENZ' as const, label: 'Mercedes Benz' },
    { value: 'ANDES MOTOR' as const, label: 'Andes Motor' },
    { value: 'STELLANTIS' as const, label: 'Stellantis' },
  ];

  readonly createForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    brand: new FormControl<SurveyBrand>('MERCEDES-BENZ', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly canCreate = toSignal(
    this.createForm.statusChanges.pipe(
      startWith(this.createForm.status),
      map(() => this.createForm.valid),
    ),
    { initialValue: this.createForm.valid },
  );

  constructor() {
    this.stateService.setCurrentStep(1);
    this.load();
  }

  openCreate(): void {
    const brand = this.themeService.getSurveyBrand();
    this.createForm.reset({ name: '', brand });
    this.createForm.controls.brand.disable({ emitEvent: false });
    this.isCreateOpen.set(true);
  }

  closeCreate(): void {
    this.isCreateOpen.set(false);
  }

  load(): void {
    this.isLoading.set(true);
    this.surveyService.listAll().subscribe({
      next: (surveys) => {
        const brand = this.themeService.getSurveyBrand();
        const filtered = surveys.filter((s) => s.brand === brand);
        this.surveys.set(filtered);
        this.loadCurrentVersions(filtered);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('No se pudieron cargar las encuestas.', { title: 'Encuestas' });
      },
    });
  }

  private loadCurrentVersions(surveys: Survey[]): void {
    if (!surveys.length) {
      this.currentVersionBySurveyId.set({});
      this.isLoading.set(false);
      return;
    }

    const requests = surveys.map((s) =>
      this.surveyVersionService.getCurrentForSurvey(s.id).pipe(
        catchError(() => of(null)),
      ),
    );

    forkJoin(requests).subscribe({
      next: (versions) => {
        const map: Record<string, number | null> = {};
        for (let i = 0; i < surveys.length; i++) {
          map[surveys[i].id] = versions[i]?.version ?? null;
        }
        this.currentVersionBySurveyId.set(map);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  createSurvey(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const value = this.createForm.getRawValue();
    this.surveyService.create({ name: value.name.trim(), brand: value.brand }).subscribe({
      next: () => {
        this.toastService.show('Encuesta creada.', { title: 'Encuestas' });
        this.closeCreate();
        this.load();
      },
      error: () => {
        this.toastService.show('No se pudo crear la encuesta.', { title: 'Encuestas' });
      },
    });
  }

  formatBrand(brand: SurveyBrand): string {
    switch (brand) {
      case 'MERCEDES-BENZ':
        return 'Mercedes Benz';
      case 'ANDES MOTOR':
        return 'Andes Motor';
      case 'STELLANTIS':
        return 'Stellantis';
    }
  }
}
