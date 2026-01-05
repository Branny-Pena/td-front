import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TestDriveForm, CreateDraftTestDriveFormDto, CreateTestDriveFormDto, UpdateTestDriveFormDto } from '../models';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class TestDriveFormService {
  private readonly http = inject(HttpClient);
  private readonly themeService = inject(ThemeService);
  private readonly baseUrl = '/test-drive-forms';

  createDraft(dto: CreateDraftTestDriveFormDto): Observable<TestDriveForm> {
    return this.http.post<TestDriveForm>(this.baseUrl, dto).pipe(map((form) => this.enrichForm(form)));
  }

  create(dto: CreateTestDriveFormDto): Observable<TestDriveForm> {
    return this.http.post<TestDriveForm>(this.baseUrl, dto).pipe(map((form) => this.enrichForm(form)));
  }

  getById(id: string): Observable<TestDriveForm> {
    return this.http.get<TestDriveForm>(`${this.baseUrl}/${id}`).pipe(
      map((form) => this.enrichForm(form))
    );
  }

  getPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, {
      responseType: 'blob'
    });
  }

  sendEmail(id: string): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(`${this.baseUrl}/${id}/email`, null);
  }

  getAll(filters?: {
    status?: 'draft' | 'submitted';
    brand?: 'MERCEDES-BENZ' | 'ANDES MOTOR' | 'STELLANTIS';
    customerId?: string;
    vehicleId?: string;
    locationId?: string;
    vehicleLicensePlate?: string;
    vehicleVinNumber?: string;
  }): Observable<TestDriveForm[]> {
    let params = new HttpParams();
    const brand = filters?.brand ?? this.themeService.getSurveyBrand();
    if (brand) params = params.set('brand', brand);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.vehicleId) params = params.set('vehicleId', filters.vehicleId);
    if (filters?.locationId) params = params.set('locationId', filters.locationId);
    if (filters?.vehicleLicensePlate) params = params.set('vehicleLicensePlate', filters.vehicleLicensePlate);
    if (filters?.vehicleVinNumber) params = params.set('vehicleVinNumber', filters.vehicleVinNumber);
    return this.http.get<TestDriveForm[]>(this.baseUrl, { params }).pipe(
      map((forms) => {
        return forms.map((form) => this.enrichForm(form));
      })
    );
  }

  update(id: string, dto: UpdateTestDriveFormDto): Observable<TestDriveForm> {
    return this.http.patch<TestDriveForm>(`${this.baseUrl}/${id}`, dto).pipe(map((form) => this.enrichForm(form)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private mockCustomerValoration(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    const abs = Math.abs(hash);
    const steps = abs % 41; // 0..40
    return 1 + steps / 10; // 1.0 .. 5.0
  }

  private mockSalesExpert(id: string): string {
    const names = [
      'María Fernández',
      'Juan Pérez',
      'Andrea Rojas',
      'Carlos Gutiérrez',
      'Lucía Torres',
      'José Ramírez',
      'Valeria Mendoza',
      'Diego Castillo'
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash * 33 + id.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % names.length;
    return names[idx] ?? '—';
  }

  private enrichForm(form: TestDriveForm): TestDriveForm {
    const rawStatus = (form as unknown as { status?: string }).status;
    const normalizedStatus = rawStatus === 'pending' ? 'draft' : (form.status as TestDriveForm['status']);
    const normalized: TestDriveForm = { ...form, status: normalizedStatus };

    return {
      ...normalized,
      customerValoration: typeof normalized.customerValoration === 'number'
        ? normalized.customerValoration
        : this.mockCustomerValoration(normalized.id),
      salesExpert: typeof normalized.salesExpert === 'string' && normalized.salesExpert.trim().length
        ? normalized.salesExpert
        : this.mockSalesExpert(normalized.id)
    };
  }
}
