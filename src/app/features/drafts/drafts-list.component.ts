import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TestDriveForm } from '../../core/models';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { MessageToastService } from '../../shared/services/message-toast.service';

type DraftsFilterStatus = 'all' | 'draft' | 'pending' | 'submitted';

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

  readonly isLoading = signal(false);
  readonly allForms = signal<TestDriveForm[]>([]);
  readonly selectedStatus = signal<DraftsFilterStatus>('all');
  readonly filteredForms = computed(() => {
    const selectedStatus = this.selectedStatus();
    const forms = this.allForms();
    if (selectedStatus === 'all') return forms;
    return forms.filter((form) => form.status === selectedStatus);
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
      this.router.navigate(['/borradores', form.id, 'ver']);
      return;
    }
    this.router.navigate(['/borradores', form.id, 'cliente']);
  }

  formatDate(value: string): string {
    try {
      return new Date(value).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return value;
    }
  }
}
