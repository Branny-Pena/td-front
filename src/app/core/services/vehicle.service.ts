import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Vehicle, CreateVehicleDto, UpdateVehicleDto, VehicleQrRequestDto, VehicleQrResponseDto } from '../models';

interface FindOrCreateVehicleResponse {
  vehicle: Vehicle;
  created: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/vehicles';

  create(dto: CreateVehicleDto): Observable<Vehicle> {
    return this.http
      .post<FindOrCreateVehicleResponse>(`${this.baseUrl}/find-or-create`, dto)
      .pipe(map((res) => res.vehicle));
  }

  getById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/${id}`);
  }

  getByLicensePlateOrVin(licensePlate?: string, vinNumber?: string): Observable<Vehicle> {
    let params = new HttpParams();
    if (licensePlate && licensePlate.trim().length > 0) {
      params = params.set('licensePlate', licensePlate.trim());
    }
    if (vinNumber && vinNumber.trim().length > 0) {
      params = params.set('vinNumber', vinNumber.trim());
    }

    return this.http.get<Vehicle>(this.baseUrl, { params });
  }

  getByLicencePlateOrVin(licensePlate?: string, vinNumber?: string): Observable<Vehicle> {
    return this.getByLicensePlateOrVin(licensePlate, vinNumber);
  }

  getAll(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.baseUrl);
  }

  generateQrCode(dto: VehicleQrRequestDto): Observable<VehicleQrResponseDto> {
    return this.http.post<VehicleQrResponseDto>(`${this.baseUrl}/qr-code`, dto);
  }

  update(id: string, dto: UpdateVehicleDto): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
