import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { ContentCardComponent } from '../../shared/components/content-card/content-card.component';
import { TestDriveForm } from '../../core/models';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { MessageToastService } from '../../shared/services/message-toast.service';

@Component({
  selector: 'app-draft-view',
  standalone: true,
  imports: [WizardLayoutComponent, ContentCardComponent],
  templateUrl: './draft-view.component.html',
  styleUrl: './draft-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraftViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testDriveFormService = inject(TestDriveFormService);
  private readonly stateService = inject(TestDriveStateService);
  private readonly toastService = inject(MessageToastService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly isLoading = signal(false);
  readonly isPdfLoading = signal(false);
  readonly isEmailLoading = signal(false);
  readonly form = signal<TestDriveForm | null>(null);
  readonly selectedTab = signal<'form' | 'survey'>('survey');

  constructor() {
    this.stateService.setCurrentStep(1);
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/test-drive-forms']);
      return;
    }
    this.load(id);
  }

  private load(id: string): void {
    this.isLoading.set(true);
    this.testDriveFormService.getById(id).subscribe({
      next: (form) => {
        this.form.set(form);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('No se pudo cargar el formulario.', { title: 'Formulario' });
        this.router.navigate(['/test-drive-forms']);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/test-drive-forms']);
  }

  setTab(tab: 'form' | 'survey'): void {
    if (this.selectedTab() === tab) return;
    this.selectedTab.set(tab);
  }

  formatDate(value: string): string {
    try {
      return new Date(value).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return value;
    }
  }

  trustSignature(value: string): SafeUrl {
    const trimmed = value.trim();
    const normalized = trimmed.startsWith('data:image/') ? trimmed : trimmed.startsWith('iVBOR') ? `data:image/png;base64,${trimmed}` : trimmed;
    return this.sanitizer.bypassSecurityTrustUrl(normalized);
  }

  generatePdf(): void {
    const id = this.form()?.id;
    if (!id) {
      this.toastService.show('No se encontró el ID del formulario.', { title: 'PDF' });
      return;
    }

    this.isPdfLoading.set(true);
    this.testDriveFormService.getPdf(id).subscribe({
      next: (blob) => {
        this.isPdfLoading.set(false);
        this.downloadBlob(blob, `prueba-de-manejo-${id}.pdf`);
      },
      error: () => {
        this.isPdfLoading.set(false);
        this.toastService.show('No se pudo generar el PDF.', { title: 'PDF' });
      }
    });
  }

  sendEmail(): void {
    this.toastService.show('Envío por correo próximamente.', { title: 'Correo' });
  }

  onSendEmail(): void {
    const id = this.form()?.id;
    const customerEmail = this.form()?.customer?.email ?? undefined;

    if (!id) {
      this.toastService.show('No se encontró el ID del formulario.', { title: 'Correo' });
      return;
    }

    if (!customerEmail) {
      this.toastService.show('El cliente no tiene correo registrado.', { title: 'Correo' });
      return;
    }

    this.isEmailLoading.set(true);
    this.testDriveFormService.sendEmail(id).subscribe({
      next: () => {
        this.isEmailLoading.set(false);
        this.toastService.show(`Correo enviado a ${customerEmail}.`, { title: 'Correo' });
      },
      error: () => {
        this.isEmailLoading.set(false);
        this.toastService.show('No se pudo enviar el correo.', { title: 'Correo' });
      }
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    globalThis.URL.revokeObjectURL(url);
  }
}
