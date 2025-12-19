import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { DraftFormContextService } from './draft-form-context.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { MessageToastService } from '../../shared/services/message-toast.service';

@Component({
  selector: 'app-draft-signature-view',
  standalone: true,
  imports: [WizardLayoutComponent, ContentCardComponent],
  templateUrl: './draft-signature-view.component.html',
  styleUrl: './draft-signature-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraftSignatureViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ctx = inject(DraftFormContextService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly toastService = inject(MessageToastService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly isLoading = signal(false);
  readonly draftId = signal<string>('');

  readonly signatureData = this.stateService.signatureData;
  private readonly signatureRaw = computed<string | null>(() => {
    return this.signatureData() ?? this.stateService.testDriveForm()?.signature?.signatureData ?? null;
  });
  readonly trustedSignature = computed<SafeUrl | null>(() => {
    const raw = this.signatureRaw();
    if (!raw) return null;
    const normalized = this.normalizeSignature(raw);
    return this.sanitizer.bypassSecurityTrustUrl(normalized);
  });

  constructor() {
    this.stateService.setCurrentStep(3);
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/borradores']);
      return;
    }
    this.draftId.set(id);
    this.load(id);
  }

  private load(id: string): void {
    this.isLoading.set(true);
    this.ctx.ensureLoaded(id).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('No se pudo cargar el borrador.', { title: 'Borradores' });
        this.router.navigate(['/borradores']);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/borradores', this.draftId(), 'vehiculo']);
  }

  onNext(): void {
    this.router.navigate(['/borradores', this.draftId(), 'evaluacion']);
  }

  private normalizeSignature(value: string): string {
    const trimmed = value.trim();
    if (trimmed.startsWith('data:image/')) return trimmed;
    if (trimmed.startsWith('iVBOR')) return `data:image/png;base64,${trimmed}`;
    return trimmed;
  }
}
