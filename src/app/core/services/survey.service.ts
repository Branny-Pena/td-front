import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateSurveyDto, Survey, SurveyBrand, UpdateSurveyDto } from '../models';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/surveys';

  create(dto: CreateSurveyDto): Observable<Survey> {
    return this.http.post<Survey>(this.baseUrl, dto);
  }

  listAll(): Observable<Survey[]> {
    return this.http.get<Survey[]>(this.baseUrl);
  }

  getById(id: string): Observable<Survey> {
    return this.http.get<Survey>(`${this.baseUrl}/${id}`);
  }

  update(id: string, dto: UpdateSurveyDto): Observable<Survey> {
    return this.http.patch<Survey>(`${this.baseUrl}/${id}`, dto);
  }

  listActiveByBrand(brand: SurveyBrand): Observable<Survey[]> {
    const params = new HttpParams().set('brand', brand);
    return this.http.get<Survey[]>(`${this.baseUrl}/active`, { params });
  }
}

