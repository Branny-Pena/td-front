import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.post<TestDriveForm>(this.baseUrl, dto);
  }

  create(dto: CreateTestDriveFormDto): Observable<TestDriveForm> {
    return this.http.post<TestDriveForm>(this.baseUrl, dto);
  }

  getById(id: string): Observable<TestDriveForm> {
    return this.http.get<TestDriveForm>(`${this.baseUrl}/${id}`);
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
    status?: 'draft' | 'pending' | 'submitted';
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
    return this.http.get<TestDriveForm[]>(this.baseUrl, { params });
  }

  update(id: string, dto: UpdateTestDriveFormDto): Observable<TestDriveForm> {
    return this.http.patch<TestDriveForm>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
