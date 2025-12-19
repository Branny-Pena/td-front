import { Component, ChangeDetectionStrategy, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WizardLayoutComponent } from '../../shared/layouts/wizard-layout/wizard-layout.component';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';
import { TdThemeId, ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [WizardLayoutComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly stateService = inject(TestDriveStateService);
  private readonly themeService = inject(ThemeService);

  readonly year = new Date().getFullYear();
  readonly isCompanyMenuOpen = signal(false);

  constructor() {
    this.stateService.setCurrentStep(1);
    // Login screen uses the SAP Horizon-like theme (without persisting).
    this.themeService.apply('sap', { persist: false });
  }

  toggleCompanyMenu(): void {
    this.isCompanyMenuOpen.update((v) => !v);
  }

  selectCompany(themeId: TdThemeId): void {
    this.isCompanyMenuOpen.set(false);
    this.themeService.apply(themeId, { persist: true });
    this.stateService.reset();
    this.router.navigate(['/inicio']);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.isCompanyMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('[data-company-menu-root="true"]')) return;
    this.isCompanyMenuOpen.set(false);
  }
}
