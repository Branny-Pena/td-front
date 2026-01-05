import { Injectable, signal } from '@angular/core';
import type { SurveyBrand } from '../models';

export type TdThemeId = 'sap' | 'mercedes' | 'andes' | 'stellantis';

const STORAGE_KEY = 'td-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themeId = signal<TdThemeId>('sap');

  constructor() {
    this.applyPersisted();
  }

  getBrandName(): string {
    switch (this.themeId()) {
      case 'mercedes':
        return 'Mercedes-Benz';
      case 'andes':
        return 'Andes Motor';
      case 'stellantis':
        return 'Stellantis';
      default:
        return 'Divemotor';
    }
  }

  getSurveyBrand(): SurveyBrand {
    switch (this.themeId()) {
      case 'andes':
        return 'ANDES MOTOR';
      case 'stellantis':
        return 'STELLANTIS';
      case 'mercedes':
      case 'sap':
      default:
        return 'MERCEDES-BENZ';
    }
  }

  apply(themeId: TdThemeId, opts?: { persist?: boolean }): void {
    this.themeId.set(themeId);
    this.applyClass(themeId);

    if (opts?.persist) {
      try {
        localStorage.setItem(STORAGE_KEY, themeId);
      } catch {
        // ignore
      }
    }
  }

  private applyPersisted(): void {
    let persisted: TdThemeId | null = null;
    try {
      persisted = (localStorage.getItem(STORAGE_KEY) as TdThemeId | null) ?? null;
    } catch {
      persisted = null;
    }

    if (persisted === 'mercedes' || persisted === 'andes' || persisted === 'stellantis' || persisted === 'sap') {
      this.apply(persisted);
      return;
    }

    this.apply('sap');
  }

  private applyClass(themeId: TdThemeId): void {
    const root = document.documentElement;
    const all = ['td-theme-sap', 'td-theme-mercedes', 'td-theme-andes', 'td-theme-stellantis'];
    for (const cls of all) root.classList.remove(cls);
    root.classList.add(`td-theme-${themeId}`);
  }
}
