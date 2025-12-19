import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrentLocation, CreateLocationDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/locations';

  create(dto: CreateLocationDto): Observable<CurrentLocation> {
    return this.http.post<CurrentLocation>(this.baseUrl, dto);
  }

  getById(id: string): Observable<CurrentLocation> {
    return this.http.get<CurrentLocation>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<CurrentLocation[]> {
    return this.http.get<CurrentLocation[]>(this.baseUrl);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
